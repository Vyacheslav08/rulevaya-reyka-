import { useState, useEffect } from 'react'
import { fetchRacks, getLastUpdated } from '../services/sheets'
import RackCard from '../components/RackCard'

const CATEGORIES = ['Все', 'В наличии', 'Электрорейки', 'Гидравлика', 'Французы']

export default function Catalog() {
  const [racks, setRacks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('Все')
  const [updated, setUpdated] = useState(null)

  useEffect(() => {
    fetchRacks()
      .then(r => { setRacks(r); setUpdated(getLastUpdated()) })
      .catch(() => setError('Не удалось загрузить таблицу.'))
      .finally(() => setLoading(false))
  }, [])

  const reload = () => {
    setLoading(true); setError('')
    fetchRacks(true)
      .then(r => { setRacks(r); setUpdated(getLastUpdated()) })
      .catch(() => setError('Не удалось загрузить таблицу.'))
      .finally(() => setLoading(false))
  }

  const filtered = racks.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q)

    const matchFilter =
      filter === 'Все'         ? true :
      filter === 'В наличии'   ? r.inStock > 0 :
      filter === 'Электрорейки'? r.name.toLowerCase().includes('эур') || r.name.toLowerCase().includes('электро') :
      filter === 'Гидравлика'  ? r.name.toLowerCase().includes('гур') || r.name.toLowerCase().includes('гидрав') :
      filter === 'Французы'    ? /207|SC|RL|LG|FR3|XSP|C2|C5|406|407|607|508/.test(r.code) :
      true

    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Каталог реек</h1>
        <button onClick={reload} className="text-sm text-brand-600 hover:text-brand-800 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Обновить
        </button>
      </div>

      {updated && (
        <p className="text-xs text-gray-400">
          Данные из Google Sheets · обновлено {updated.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

      {/* Поиск */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Поиск по коду или названию..."
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
      />

      {/* Фильтры */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Контент */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="card text-center py-6">
          <p className="text-red-500 mb-3">{error}</p>
          <button onClick={reload} className="btn-primary">Попробовать снова</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card text-center py-8 text-gray-500">
          Ничего не найдено
        </div>
      )}

      {!loading && filtered.map((rack, i) => (
        <RackCard key={i} rack={rack} />
      ))}

      {!loading && !error && (
        <p className="text-xs text-center text-gray-400 py-2">
          Показано {filtered.length} из {racks.length} реек
        </p>
      )}
    </div>
  )
}
