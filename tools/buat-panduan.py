"""Membuat Panduan Sistem Portal JEMBATAN sebagai berkas PDF.

    python tools/buat-panduan.py            -> panduan-sistem.pdf di akar repo
    python tools/buat-panduan.py <keluaran> -> ke jalur lain

Hasilnya diunggah administrator lewat menu Panduan Sistem di aplikasi
(halaman itu menyimpan satu berkas PDF di bucket documents dan
menampilkannya untuk semua pengguna).

Isinya sengaja dibuat ulang dari skrip, bukan ditulis sekali di aplikasi
pengolah kata: begitu alur di aplikasi berubah, panduannya diperbarui di
sini lalu dibuat ulang, sehingga tidak ada dua sumber yang berbeda.

Butuh reportlab:  pip install reportlab
"""
import sys
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, ListFlowable, ListItem, NextPageTemplate,
    PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle,
)

NAVY = colors.HexColor('#12305f')
BIRU = colors.HexColor('#1d5fd0')
BIRU_MUDA = colors.HexColor('#e6eefb')
ABU = colors.HexColor('#5a6f93')
GARIS = colors.HexColor('#d6dfec')
KUNING = colors.HexColor('#fff6ea')
MERAH = colors.HexColor('#c0262d')

JUDUL = 'Panduan Sistem Portal JEMBATAN'
SUBJUDUL = 'BPK Perwakilan Provinsi Papua Barat Daya'

BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
         'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']


def tanggal_indonesia(d):
    return f'{d.day} {BULAN[d.month - 1]} {d.year}'


# ----------------------------------------------------------------- gaya teks
dasar = getSampleStyleSheet()

G = {
    'judul_sampul': ParagraphStyle(
        'judul_sampul', parent=dasar['Title'], fontName='Helvetica-Bold',
        fontSize=30, leading=34, textColor=NAVY, spaceAfter=6),
    'sub_sampul': ParagraphStyle(
        'sub_sampul', parent=dasar['Normal'], fontSize=12, leading=18,
        textColor=ABU, alignment=TA_CENTER),
    'bab': ParagraphStyle(
        'bab', parent=dasar['Heading1'], fontName='Helvetica-Bold',
        fontSize=17, leading=21, textColor=NAVY, spaceBefore=22, spaceAfter=8),
    'sub': ParagraphStyle(
        'sub', parent=dasar['Heading2'], fontName='Helvetica-Bold',
        fontSize=12.5, leading=16, textColor=BIRU, spaceBefore=12, spaceAfter=5),
    'teks': ParagraphStyle(
        'teks', parent=dasar['Normal'], fontSize=9.8, leading=14.5,
        textColor=colors.HexColor('#23324d'), alignment=TA_JUSTIFY, spaceAfter=6),
    'kecil': ParagraphStyle(
        'kecil', parent=dasar['Normal'], fontSize=8.6, leading=12.5, textColor=ABU),
    'sel': ParagraphStyle(
        'sel', parent=dasar['Normal'], fontSize=8.8, leading=12.4,
        textColor=colors.HexColor('#23324d')),
    'sel_tebal': ParagraphStyle(
        'sel_tebal', parent=dasar['Normal'], fontName='Helvetica-Bold',
        fontSize=8.8, leading=12.4, textColor=NAVY),
    'sel_kepala': ParagraphStyle(
        'sel_kepala', parent=dasar['Normal'], fontName='Helvetica-Bold',
        fontSize=8.8, leading=12.4, textColor=colors.white),
    'catatan': ParagraphStyle(
        'catatan', parent=dasar['Normal'], fontSize=9.2, leading=13.5,
        textColor=colors.HexColor('#8a5a00')),
}


def P(teks, gaya='teks'):
    return Paragraph(teks, G[gaya])


def poin(butir, gaya='teks'):
    return ListFlowable(
        [ListItem(P(b, gaya), leftIndent=12) for b in butir],
        bulletType='bullet', bulletFontSize=9, bulletOffsetY=-1.5,
        leftIndent=12, spaceAfter=6)


def langkah(butir):
    return ListFlowable(
        [ListItem(P(b), leftIndent=14) for b in butir],
        bulletType='1', bulletFormat='%s.', leftIndent=14, spaceAfter=6)


def tabel(kepala, baris, lebar, tebal_kolom_pertama=True):
    data = [[Paragraph(h, G['sel_kepala']) for h in kepala]]
    for r in baris:
        data.append([
            Paragraph(sel, G['sel_tebal' if (i == 0 and tebal_kolom_pertama) else 'sel'])
            for i, sel in enumerate(r)
        ])
    t = Table(data, colWidths=lebar, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, GARIS),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f7faff')]),
    ]))
    return t


def kotak(isi, warna=KUNING, garis=colors.HexColor('#f0d9ae')):
    t = Table([[Paragraph(isi, G['catatan'])]], colWidths=[165 * mm], hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), warna),
        ('BOX', (0, 0), (-1, -1), 0.6, garis),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    return t


# --------------------------------------------------------------- kop & kaki
def hias_sampul(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, A4[1] - 14 * mm, A4[0], 14 * mm, stroke=0, fill=1)
    canvas.setFillColor(BIRU)
    canvas.rect(0, 0, A4[0], 8 * mm, stroke=0, fill=1)
    canvas.restoreState()


def hias_isi(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, A4[1] - 12 * mm, A4[0], 12 * mm, stroke=0, fill=1)
    canvas.setFont('Helvetica-Bold', 8.5)
    canvas.setFillColor(colors.white)
    canvas.drawString(20 * mm, A4[1] - 8 * mm, 'JEMBATAN')
    canvas.setFont('Helvetica', 8.5)
    canvas.drawRightString(A4[0] - 20 * mm, A4[1] - 8 * mm, SUBJUDUL)

    canvas.setStrokeColor(GARIS)
    canvas.setLineWidth(0.5)
    canvas.line(20 * mm, 14 * mm, A4[0] - 20 * mm, 14 * mm)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(ABU)
    canvas.drawString(20 * mm, 10 * mm, JUDUL)
    canvas.drawRightString(A4[0] - 20 * mm, 10 * mm, f'Halaman {canvas.getPageNumber() - 1}')
    canvas.restoreState()


def bangun(keluaran):
    doc = BaseDocTemplate(
        keluaran, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=22 * mm, bottomMargin=20 * mm,
        title=JUDUL, author=SUBJUDUL, subject='Panduan penggunaan Portal JEMBATAN')

    bingkai_sampul = Frame(20 * mm, 30 * mm, A4[0] - 40 * mm, A4[1] - 70 * mm, id='sampul')
    bingkai_isi = Frame(20 * mm, 18 * mm, A4[0] - 40 * mm, A4[1] - 40 * mm, id='isi')
    doc.addPageTemplates([
        PageTemplate(id='sampul', frames=[bingkai_sampul], onPage=hias_sampul),
        PageTemplate(id='isi', frames=[bingkai_isi], onPage=hias_isi),
    ])
    doc.build(cerita())


def rapikan(isi):
    """Judul tidak boleh berdiri sendiri di kaki halaman.

    Setiap judul bab atau subbab diikat dengan elemen sesudahnya, sehingga
    keduanya pindah bersama bila tidak muat.
    """
    hasil = []
    i = 0
    while i < len(isi):
        gaya = getattr(isi[i], 'style', None)
        nama = getattr(gaya, 'name', '')
        if nama in ('bab', 'sub') and i + 1 < len(isi):
            hasil.append(KeepTogether([isi[i], isi[i + 1]]))
            i += 2
        else:
            hasil.append(isi[i])
            i += 1
    return hasil


def cerita():
    # Tanpa pemisah halaman antarbab: memaksa tiap bab mulai di halaman baru
    # menyisakan halaman yang hampir kosong, dan panduan jadi lebih tebal
    # tanpa menambah isi. Jarak sebelum judul bab sudah cukup memisahkannya.
    c = sampul()
    c.append(NextPageTemplate('isi'))
    c.append(PageBreak())
    for bagian in (bab_masuk(), bab_master_data(), bab_syarat_berkas(), bab_versi(),
                   bab_bidang(), bab_dokumen_agenda(), bab_masalah()):
        c += rapikan(bagian)
    return c


# -------------------------------------------------------------------- isi
def sampul():
    return [
        Spacer(1, 50 * mm),
        P('PORTAL JEMBATAN', 'sub_sampul'),
        Spacer(1, 4 * mm),
        Paragraph('Panduan Sistem', G['judul_sampul']),
        Spacer(1, 2 * mm),
        P('Jendela Manajemen dan Kolaborasi Kesekretariatan', 'sub_sampul'),
        Spacer(1, 14 * mm),
        P(SUBJUDUL, 'sub_sampul'),
        Spacer(1, 40 * mm),
        P(f'Disusun {tanggal_indonesia(date.today())}', 'sub_sampul'),
        Spacer(1, 3 * mm),
        P('Panduan ini mengikuti aplikasi yang sedang berjalan. Bila alur di '
          'aplikasi berubah, panduan ini perlu dibuat ulang.', 'sub_sampul'),
    ]


def bab_masuk():
    return [
        P('1. Sebelum Mulai', 'bab'),

        P('Cara Masuk', 'sub'),
        P('Portal ini menerima dua bentuk identitas, dan keduanya memakai kolom '
          'isian yang sama di halaman depan:'),
        tabel(
            ['Jenis akun', 'Yang diketik', 'Contoh'],
            [['Akun email kantor', 'Alamat email lengkap, termasuk bagian setelah tanda @',
              'nama.pegawai@bpk.go.id'],
             ['Akun username', 'Username saja, tanpa tanda @',
              'bpkpbd1']],
            [38 * mm, 72 * mm, 55 * mm]),
        Spacer(1, 5),
        kotak('Akun email kantor <b>wajib</b> diketik lengkap. Mengetik '
              '"nama.pegawai" saja akan ditolak, karena portal memperlakukan '
              'masukan tanpa tanda @ sebagai username.'),

        P('Peran dan Batasannya', 'sub'),
        P('Setiap akun punya satu peran. Peran menentukan apa yang boleh '
          'dilakukan, dan ditegakkan di basis data - bukan sekadar disembunyikan '
          'tombolnya. Mencoba menembus lewat jalan lain akan tetap ditolak.'),
        tabel(
            ['Peran', 'Boleh', 'Tidak boleh'],
            [['Administrator',
              'Seluruhnya: mengunggah Master Data, menyetujui dokumen, mengelola '
              'semua bidang, melihat seluruh agenda',
              '-'],
             ['Pegawai',
              'Mengunggah dan mengelola dokumen bidangnya sendiri, mencatat agenda '
              'bidangnya',
              'Mengunggah Master Data, menyetujui dokumen, mengubah data bidang lain'],
             ['Pemantau',
              'Membaca seluruh isi semua bidang',
              'Mengunggah, mengubah, atau menghapus apa pun']],
            [28 * mm, 70 * mm, 67 * mm]),

        P('Sebutan Jabatan', 'sub'),
        P('Di samping nama pengguna tertulis jabatannya, bukan nama perannya. '
          'Sebutan ini hanya keterangan - tidak ada hak akses yang mengikutinya.'),
        tabel(
            ['Yang tertulis', 'Untuk siapa'],
            [['Kepala Perwakilan', 'Pimpinan perwakilan'],
             ['Kepala Sekretariat Perwakilan', 'Kepala sekretariat'],
             ['Verifikator', 'Kepala Subbagian. Di portal ini tidak ada yang perlu '
                             'diverifikasi; sebutan ini mengikuti jabatannya saja'],
             ['Staff Divisi', 'Pegawai pada salah satu bidang'],
             ['Administrator / Pemantau', 'Akun layanan yang tidak terikat bidang']],
            [48 * mm, 117 * mm]),

        P('Memilih Bidang', 'sub'),
        P('Setelah masuk, pilih salah satu dari lima subbagian. Pilihan itu '
          'menentukan menu di sisi kiri dan dashboard yang terbuka. Untuk berpindah '
          'bidang, tekan <b>Pilih bidang lain</b> di atas menu.'),
    ]


def bab_master_data():
    return [
        P('2. Master Data: Sumber Semua Angka', 'bab'),

        P('Angka di dashboard dan menu bidang tidak pernah diketik manual. '
          'Seluruhnya dibaca dari satu berkas yang diunggah administrator di menu '
          'Master Data. Karena itu dashboard dan menu rinciannya tidak mungkin '
          'menyebut angka yang berbeda - keduanya membaca berkas yang sama.'),
        Spacer(1, 3),
        kotak('Hanya <b>administrator</b> yang bisa mengunggah Master Data, dan '
              'tidak ada proses persetujuan. Begitu disimpan, angkanya langsung '
              'berlaku untuk semua pengguna.'),

        P('Tiga Pintu Master Data', 'sub'),
        tabel(
            ['Menu', 'Berkas yang diunggah', 'Mengisi apa'],
            [['Master Data Anggaran', 'Laporan Realisasi SP2D (Excel)',
              'Dashboard Keuangan, menu Belanja Pegawai / Barang / Modal, dan '
              'angka di halaman depan'],
             ['Master Data SDM<br/><font size=7.5 color="#5a6f93">tab Bezetting</font>',
              'Berkas Bezetting (Excel)',
              'Dashboard SDM dan menu Bezetting'],
             ['Master Data SDM<br/><font size=7.5 color="#5a6f93">tab Kalender Diklat</font>',
              'Kaldik per triwulan (PDF)',
              'Menu Kalender Diklat'],
             ['Master Data Aset', 'Daftar BMN (Excel)',
              'Dashboard Umum dan TI serta menu Aset']],
            [42 * mm, 54 * mm, 69 * mm]),
        Spacer(1, 4),
        P('Tautan ketiganya ada di menu kiri, pada kelompok <b>MASTER DATA</b>, dan '
          'hanya muncul untuk administrator.', 'kecil'),

        P('Langkah Mengunggah', 'sub'),
        P('Urutannya sama untuk ketiga pintu:'),
        langkah([
            '<b>Pilih berkas.</b> Tekan kotak unggah atau seret berkasnya ke sana. '
            'Berkas yang sama bisa dipilih ulang bila perlu.',
            '<b>Periksa pratinjau.</b> Portal membaca berkasnya dan menampilkan '
            'angka yang akan tersimpan, sebelum apa pun berubah. Bila ada yang '
            'janggal, hentikan di sini - belum ada yang tersimpan.',
            '<b>Tentukan periode.</b> Pilih bulan dan tahun data (atau tahun '
            'anggaran). Inilah keterangan periode yang nanti tampil di menu.',
            '<b>Tekan Simpan &amp; Terapkan.</b> Portal menyimpan berkas aslinya, '
            'lalu datanya.',
            '<b>Pastikan masuk riwayat.</b> Baris baru muncul di Riwayat Versi '
            'dengan status <b>Aktif</b>. Bila tidak muncul, berarti belum tersimpan.',
        ]),
        Spacer(1, 2),
        kotak('Berkas yang ditolak <b>tidak mengubah apa pun</b>. Data lama tetap '
              'utuh sampai ada berkas yang lolos dan disimpan.'),
    ]


def bab_syarat_berkas():
    return [
        P('3. Syarat Berkas dan Penyebab Penolakan', 'bab'),
        P('Portal menolak berkas yang tidak memenuhi syarat, dan menyebutkan '
          'alasannya. Penolakan itu disengaja: lebih baik berkas ditolak daripada '
          'angka yang salah terlanjur tampil di dashboard dan dipakai mengambil '
          'keputusan.'),

        P('Berlaku untuk Semua Berkas', 'sub'),
        tabel(
            ['Syarat', 'Keterangan'],
            [['Ukuran', 'Maksimal 5 MB'],
             ['Jenis', 'Excel (.xlsx atau .xls), kecuali Kalender Diklat yang harus PDF'],
             ['Isi', 'Dibaca sebagai data saja; rumus dan makro tidak pernah dijalankan']],
            [30 * mm, 135 * mm]),

        P('Master Data Anggaran', 'sub'),
        P('Berkas yang diminta: <b>Laporan Realisasi SP2D - Fa Detail 16 Segmen, '
          'Akun Based</b>, cetakan aplikasi resmi, apa adanya tanpa disunting.'),
        P('Ditolak bila:'),
        poin([
            'Jumlah seluruh akun tidak sama dengan baris <b>JUMLAH SELURUHNYA</b> '
            'pada berkas.',
            'Realisasi periode lalu ditambah periode ini tidak sama dengan realisasi '
            's.d. periode.',
        ]),
        P('Kedua pemeriksaan itu membandingkan berkas dengan dirinya sendiri. Bila '
          'gagal, berkasnya kemungkinan sudah tersunting atau tercetak sebagian - '
          'ambil ulang cetakan yang utuh.', 'kecil'),

        P('Master Data SDM - Bezetting', 'sub'),
        P('Berkas Bezetting harus memuat dua sheet: <b>ABK</b> dan <b>Lengkap_PBD</b>.'),
        P('Ditolak bila jumlah per tingkat pada sheet ABK tidak cocok dengan baris '
          'Jumlah di sheet yang sama.'),
        Spacer(1, 2),
        kotak('<b>Data pribadi.</b> Kolom pada Lengkap_PBD hanya dibaca sampai '
              '"TMT Jabatan Tertentu". NIK, nomor HP, BPJS, Taspen, dan data '
              'keluarga tidak pernah dibaca maupun disimpan. Berkas yang bisa '
              'diunduh ulang dari riwayat sudah berupa salinan bersih tanpa '
              'kolom-kolom tersebut.'),

        P('Master Data SDM - Kalender Diklat', 'sub'),
        P('Hanya menerima <b>PDF</b> Kaldik dari aplikasi sumber, satu berkas per '
          'triwulan. Ditolak bila:'),
        poin([
            'Berkasnya bukan PDF yang sah.',
            'Judul "Triwulan ... Tahun ..." tidak ditemukan.',
            'Tabelnya bukan sepuluh kolom.',
            'Nomor urut per jenis diklat tidak berurutan.',
            'Ada program tanpa nama, metode, atau penyelenggara.',
        ]),
        P('Tanggal yang tidak terbaca ditandai <b>TBA</b>, tidak ditebak.', 'kecil'),

        P('Master Data Aset', 'sub'),
        P('Daftar BMN berformat Excel. Yang wajib ada: kolom <b>Kode Barang</b> dan '
          '<b>Nama Barang</b> - tanpa keduanya tabel tidak dikenali dan berkas '
          'ditolak.'),
        P('Kolom yang dibaca: Kode Barang, NUP, Nama Barang, Jenis BMN, Merk, Tipe, '
          'Kondisi, Umur, Tanggal Perolehan, Nilai Perolehan, Penyusutan, Nilai Buku, '
          'Status Penggunaan, dan PSP.'),
        P('Kondisi atau tanggal perolehan yang kosong tidak menggagalkan unggahan, '
          'tetapi disebutkan di pratinjau dan membuat kartu "Perlu Perhatian" terisi.',
          'kecil'),
    ]


def bab_versi():
    return [
        P('4. Riwayat Versi', 'bab'),
        P('Setiap unggahan tersimpan sebagai satu versi. Yang dipakai aplikasi '
          'selalu versi terbaru; versi lama tetap tersimpan dan bisa dikembalikan.'),

        P('Yang Bisa Dilakukan', 'sub'),
        tabel(
            ['Tindakan', 'Akibatnya'],
            [['Unggah berkas baru',
              'Menjadi versi aktif. Versi sebelumnya tetap tersimpan.'],
             ['Hapus versi aktif',
              'Data kembali ke versi sebelumnya. Bila tidak ada, data menjadi kosong.'],
             ['Hapus versi lama',
              'Angka yang sedang tampil tidak berubah.'],
             ['Kosongkan data',
              'Menu yang bersangkutan menjadi kosong, tercatat sebagai versi '
              '"Dikosongkan". Bisa dikembalikan dengan mengunggah lagi.'],
             ['Unduh berkas asli',
              'Mengambil kembali berkas yang dulu diunggah, lewat ikon pada kolom Aksi.']],
            [38 * mm, 127 * mm]),
        Spacer(1, 4),
        P('Setiap penghapusan menampilkan kotak konfirmasi yang menyebutkan '
          'akibatnya pada data. Bacalah kalimat itu - isinya berbeda tergantung '
          'versi mana yang dihapus.'),
        Spacer(1, 3),
        kotak('Untuk Kalender Diklat, setiap triwulan punya versi aktifnya sendiri. '
              'Menghapus versi triwulan tertentu tidak menyentuh triwulan lain.'),
    ]


def bab_bidang():
    return [
        P('5. Menu di Tiap Bidang', 'bab'),
        P('Tabel berikut menunjukkan dari mana angka setiap menu berasal. Menu yang '
          'bersumber dari Master Data tidak menerima unggahan dokumen; menu lainnya '
          'menerima dokumen biasa.'),

        P('Subbagian Keuangan', 'sub'),
        tabel(['Menu', 'Sumber angka'],
              [['Dashboard', 'Master Data Anggaran'],
               ['Belanja Pegawai (51)', 'Master Data Anggaran'],
               ['Belanja Barang (52)', 'Master Data Anggaran'],
               ['Belanja Modal (53)', 'Master Data Anggaran']],
              [52 * mm, 113 * mm]),
        P('Total ketiga menu belanja selalu sama dengan total di dashboard, karena '
          'ketiganya dihitung dari laporan yang sama.', 'kecil'),

        P('Subbagian Sumber Daya Manusia', 'sub'),
        tabel(['Menu', 'Sumber angka'],
              [['Dashboard', 'Master Data SDM (Bezetting dan Kalender Diklat)'],
               ['Bezetting', 'Master Data SDM, tab Bezetting'],
               ['Diklat', 'Master Data SDM, tab Kalender Diklat'],
               ['Manajemen Pengetahuan, Klinik', 'Dokumen yang diunggah pegawai']],
              [52 * mm, 113 * mm]),

        P('Subbagian Hukum', 'sub'),
        tabel(['Menu', 'Sumber angka'],
              [['Dashboard', 'Dokumen bidang Hukum'],
               ['Kajian Hukum', 'Dokumen yang diunggah pegawai'],
               ['Legislasi / Review MOU', 'Dokumen, beserta masa berlakunya'],
               ['Perjanjian', 'Dokumen yang diunggah pegawai']],
              [52 * mm, 113 * mm]),
        P('Status kerja sama (Aktif, Perlu Ditinjau, Berakhir) dihitung dari tanggal '
          'masa berlaku, bukan disimpan. Karena itu kolom Masa Berlaku pada menu '
          'Legislasi / Review MOU penting diisi - tanpa itu dokumennya tidak ikut '
          'terpantau.', 'kecil'),

        P('Subbagian Umum dan TI', 'sub'),
        tabel(['Menu', 'Sumber angka'],
              [['Dashboard', 'Master Data Aset dan dokumen bidang ini'],
               ['Aset', 'Master Data Aset'],
               ['Arsip, Pengadaan Barang/Jasa', 'Dokumen yang diunggah pegawai']],
              [52 * mm, 113 * mm]),

        P('Subbagian Humas dan TU Kalan', 'sub'),
        tabel(['Menu', 'Sumber angka'],
              [['Dashboard', 'Agenda dan dokumen bidang ini'],
               ['Agenda Kalan', 'Agenda yang dicatat pegawai'],
               ['Dokumentasi Kegiatan, Perpustakaan', 'Dokumen yang diunggah pegawai']],
              [52 * mm, 113 * mm]),
    ]


def bab_dokumen_agenda():
    return [
        P('6. Dokumen dan Agenda', 'bab'),

        P('Mengunggah Dokumen Layanan', 'sub'),
        P('Pada menu layanan yang menerima dokumen, tombol unggah ada di kanan atas. '
          'Tombol itu hanya muncul bila Anda berhak mengunggah ke bidang tersebut.'),
        langkah([
            'Tekan tombol unggah di kanan atas halaman layanan.',
            'Isi nama dokumen, nomor, dan keterangan. Kolom yang diminta berbeda '
            'antarlayanan - sebagian layanan sengaja dibuat ringkas.',
            'Pilih berkasnya, lalu simpan.',
        ]),
        P('Dokumen yang sudah ada bisa dicari, disaring menurut status dan tahun, '
          'lalu diunduh kembali dari tabel di bawahnya.'),

        P('Kalender Bersama', 'sub'),
        P('Menu Kalender Bersama memperlihatkan agenda seluruh bidang dalam satu '
          'tampilan. Tersedia dua bentuk lewat tombol di kanan bilah penyaring:'),
        poin([
            '<b>Kalender</b> - bilah kegiatan pada petak tanggal. Warna menandakan '
            'bidang pemiliknya; keterangan warnanya ada di kepala kalender dan bisa '
            'ditekan untuk memfokuskan satu bidang.',
            '<b>Daftar</b> - tabel berisi tanggal, waktu, kegiatan, jenis, bidang, '
            'tempat, penyelenggara, dan status.',
        ]),
        P('Menekan satu kegiatan membuka rinciannya di kolom kanan: tanggal, waktu, '
          'durasi, tempat, penyelenggara, peserta, keterlihatan, dan status. Tombol '
          'Edit dan Hapus muncul di sana bila Anda berhak mengubahnya.'),
        Spacer(1, 3),
        kotak('<b>Peringatan bentrok.</b> Bila satu tempat dipakai dua kegiatan, '
              'atau satu bidang punya dua kegiatan bersamaan, kartu rincian '
              'menyebutkannya. Portal tidak menghalangi penyimpanan - keputusan '
              'tetap di tangan pencatat agenda.'),

        P('Keterlihatan Agenda', 'sub'),
        tabel(['Pilihan', 'Siapa yang bisa melihat'],
              [['Seluruh kantor', 'Semua pengguna portal'],
               ['Divisi sendiri', 'Hanya bidang pemilik agenda'],
               ['Terbatas', 'Hanya pencatat agenda dan administrator']],
              [38 * mm, 127 * mm]),
    ]


def bab_masalah():
    return [
        P('7. Bila Ada Masalah', 'bab'),
        tabel(
            ['Yang terjadi', 'Artinya', 'Yang perlu dilakukan'],
            [['Tidak bisa masuk padahal kata sandi benar',
              'Kemungkinan bentuk identitas yang diketik salah',
              'Akun email kantor harus lengkap dengan @bpk.go.id; akun username '
              'diketik tanpa tanda @'],
             ['"Berkas harus berformat Excel"',
              'Berkasnya bukan .xlsx atau .xls',
              'Simpan ulang dari aplikasi sumber sebagai Excel'],
             ['"Ukuran berkas melebihi 5 MB"',
              'Berkasnya terlalu besar',
              'Pastikan yang diunggah berkas data, bukan hasil pindai'],
             ['Jumlah tidak cocok saat unggah anggaran',
              'Berkas tidak seimbang dengan dirinya sendiri',
              'Ambil ulang cetakan laporan yang utuh, jangan disunting'],
             ['Menu Aset atau Bezetting kosong',
              'Master Data terkait belum diunggah atau sudah dikosongkan',
              'Administrator mengunggah berkasnya di menu Master Data'],
             ['Tombol unggah tidak muncul',
              'Peran Anda tidak berhak mengunggah ke bidang itu',
              'Hubungi administrator bila seharusnya berhak'],
             ['Angka dashboard terasa tidak masuk akal',
              'Kemungkinan berkas sumbernya memang begitu',
              'Unduh berkas asli dari Riwayat Versi dan bandingkan']],
            [40 * mm, 50 * mm, 75 * mm]),

        P('Sebelum Menghubungi Administrator', 'sub'),
        P('Keterangan berikut mempercepat penelusuran:'),
        poin([
            'Nama akun yang dipakai dan bidang yang sedang dibuka.',
            'Nama menu dan tombol yang ditekan.',
            'Tulisan galat yang muncul, apa adanya.',
            'Nama berkas yang diunggah, bila terkait unggahan.',
        ]),

        Spacer(1, 6),
        kotak('Panduan ini disusun mengikuti aplikasi yang sedang berjalan pada '
              f'{tanggal_indonesia(date.today())}. Bila alur di aplikasi berubah, '
              'panduan ini perlu dibuat ulang agar tidak menyesatkan.',
              warna=BIRU_MUDA, garis=GARIS),
    ]


if __name__ == '__main__':
    keluaran = sys.argv[1] if len(sys.argv) > 1 else 'panduan-sistem.pdf'
    bangun(keluaran)
    print(f'Panduan dibuat: {keluaran}')
