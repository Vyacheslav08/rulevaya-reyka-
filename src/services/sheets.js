import Papa from 'papaparse'

const SHEET_ID = '1LgOzjfN3fO9sg6gYTiJQDqQ7fspHhapiTKEfWVV0c_I'
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`

// Извлечь внутренний код из строки вида: Рулевая рейка "КОД" описание
function extractCode(name) {
  const m = name.match(/[""«]([^""»\n]{1,20})[""»]/)
  return m ? m[1].trim() : null
}

// Парсим строку цены: "32000" или "36000-37000"
function parsePrice(raw) {
  if (!raw) return null
  const clean = String(raw).replace(/\s/g, '').replace(',', '.')
  if (clean.includes('-')) {
    const [lo, hi] = clean.split('-').map(Number)
    return { lo, hi, label: `${lo.toLocaleString('ru')} – ${hi.toLocaleString('ru')} ₽` }
  }
  const n = Number(clean)
  if (!n) return null
  return { lo: n, hi: n, label: `${n.toLocaleString('ru')} ₽` }
}

let _cache = null
let _fetchedAt = 0
const CACHE_MS = 5 * 60 * 1000 // 5 минут

export async function fetchRacks(force = false) {
  if (_cache && !force && Date.now() - _fetchedAt < CACHE_MS) return _cache

  const resp = await fetch(CSV_URL)
  const text = await resp.text()

  const { data } = Papa.parse(text, { skipEmptyLines: true })

  const racks = []
  for (const row of data) {
    const name    = (row[0] || '').trim()
    const inStock = parseInt(row[1]) || 0
    const reserve = parseInt(row[2]) || 0
    const drop    = parsePrice(row[3])
    const retail  = parsePrice(row[4])

    // Пропускаем заголовки и разделители
    if (!name || !drop) continue
    // Строки-разделители типа "Французы", "Немцы"
    if (!name.includes('рейка') && !name.includes('рейк') && !name.toLowerCase().includes('рулев')) continue

    const code = extractCode(name)
    if (!code) continue

    racks.push({ code, name, inStock, reserve, drop, retail })
  }

  _cache = racks
  _fetchedAt = Date.now()
  return racks
}

// Найти рейку по коду (может быть несколько — дроп/без датчика и т.д.)
export function findByCode(racks, code) {
  return racks.filter(r =>
    r.code.toUpperCase() === code.toUpperCase() ||
    r.code.toUpperCase().startsWith(code.toUpperCase())
  )
}

export function getLastUpdated() {
  return _fetchedAt ? new Date(_fetchedAt) : null
}
