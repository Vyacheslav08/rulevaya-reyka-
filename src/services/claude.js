import { fetchRacks } from './sheets.js'

// Форматируем остаток для передачи в Claude
function formatInventory(racks) {
  return racks
    .filter(r => r.inStock > 0)
    .map(r => `${r.code}: ${r.inStock} шт, дроп ${r.drop?.lo?.toLocaleString('ru')} ₽`)
    .join('\n')
}

// Основной запрос к Claude через наш serverless API
export async function askClaude(question) {
  let inventoryText = ''
  try {
    const racks = await fetchRacks()
    inventoryText = formatInventory(racks)
  } catch {
    // если таблица не загрузилась — отвечаем без остатка
  }

  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, inventory: inventoryText }),
  })

  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.answer
}

// Быстрый запрос по конкретной рейке (результат подбора → советы)
export async function getRackAdvice(code, brand, year) {
  const question = `Рейка подобрана: ${code}. Машина: ${brand}${year ? ' ' + year + ' г.' : ''}.
Дай краткий совет дропшипперу: что уточнить у клиента и что ответить клиенту одной фразой.`
  return askClaude(question)
}
