# Membuat public/favicon-jembatan.png dari public/jembatan-logo.png.
#
# Logonya berupa lockup penuh: marka jembatan, wordmark JEMBATAN, dan
# taglinenya. Dipasang apa adanya sebagai favicon, pada 16 piksel wordmark dan
# taglinenya hanya menjadi noda dan bentuk melebarnya menyisakan pita kosong di
# atas dan bawah. Jadi yang diambil hanya markanya.
#
# Memakai System.Drawing yang sudah ada di Windows - tidak ada dependensi baru
# untuk proyeknya.
#
# Jalankan dari akar proyek:
#   powershell -ExecutionPolicy Bypass -File tools\buat-favicon.ps1

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$akar = Split-Path -Parent $PSScriptRoot
$sumber = Join-Path $akar 'public\jembatan-logo.png'
$keluaran = Join-Path $akar 'public\favicon-jembatan.png'

if (-not (Test-Path $sumber)) { throw "Tidak menemukan $sumber" }

# Kotak marka pada logo 1536x1024, diukur dari piksel terangnya dan berhenti
# di atas wordmark. Sesuaikan bila logonya diganti dengan versi lain.
$mx = 348; $my = 14; $mw = 840; $mh = 742

$sisi = 256
$padding = 10

$src = [System.Drawing.Image]::FromFile($sumber)
try {
  if ($src.Width -ne 1536 -or $src.Height -ne 1024) {
    Write-Warning "Ukuran logo $($src.Width)x$($src.Height), bukan 1536x1024 seperti saat kotak marka diukur. Periksa hasilnya."
  }

  $ruang = $sisi - $padding * 2
  $skala = [Math]::Min($ruang / $mw, $ruang / $mh)
  $lebar = [int][Math]::Round($mw * $skala)
  $tinggi = [int][Math]::Round($mh * $skala)

  $dst = New-Object System.Drawing.Bitmap($sisi, $sisi)
  $g = [System.Drawing.Graphics]::FromImage($dst)
  try {
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    # Latar logonya memang hitam; disamakan supaya potongannya tidak berbingkai.
    $g.Clear([System.Drawing.Color]::Black)
    $tujuan = New-Object System.Drawing.Rectangle([int](($sisi - $lebar) / 2), [int](($sisi - $tinggi) / 2), $lebar, $tinggi)
    $asal = New-Object System.Drawing.Rectangle($mx, $my, $mw, $mh)
    $g.DrawImage($src, $tujuan, $asal, [System.Drawing.GraphicsUnit]::Pixel)
  } finally { $g.Dispose() }

  $dst.Save($keluaran, [System.Drawing.Imaging.ImageFormat]::Png)
  $dst.Dispose()
} finally { $src.Dispose() }

$f = Get-Item $keluaran
Write-Host ("Selesai: {0} ({1:N0} bytes, {2}x{2})" -f $f.Name, $f.Length, $sisi)
