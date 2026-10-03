// Langkah sumbu dibulatkan ke 1, 2, 2,5, 5, atau 10 kali pangkat sepuluh,
// supaya garis kisi jatuh di angka yang enak dibaca berapa pun nilainya.
export function buildAxis(maxValue, intervals = 4) {
  if (!maxValue || maxValue <= 0) return { max: 1, ticks: [0, 1] }
  const raw = maxValue / intervals
  const power = 10 ** Math.floor(Math.log10(raw))
  const normal = raw / power
  const step = (normal <= 1 ? 1 : normal <= 2 ? 2 : normal <= 2.5 ? 2.5 : normal <= 5 ? 5 : 10) * power
  const max = step * Math.ceil(maxValue / step)
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, index) => index * step)
  return { max, ticks }
}
