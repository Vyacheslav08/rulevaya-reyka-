import { useState, useEffect } from 'react'
import { askClaude } from '../services/claude'
import { fetchRacks, getLastUpdated } from '../services/sheets'

export default function VinSearch() {
  const [vin, setVin]         = useState('')
  const [result, setResult]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [updated, setUpdated] = useState(null)

  useEffect(() => {
    fetchRacks()
      .then(() => setUpdated(getLastUpdated()))
      .catch(() => {})
  }, [])

  const handleVinChange = (e) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17)
    setVin(v)
    setError('')
    setResult('')
  }

  const handleSearch = async () => {
    if (vin.length !== 17) {
      setError('VIN должен содержать ровно 17 символов')
      return
    }
    setLoading(true)
    setResult('')
    setError('')
    try {
      const answer = await askClaude(
        `Подбери рулевую рейку по VIN номеру: ${vin}`,
        []
      )
      setResult(answer)
    } catch {
      setError('Ошибка соединения. Попробуй ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setVin('')
    setResult('')
    setError('')
  }

  return (
    <div className="space-y-5">

      {/* VIN ВВОД */}
      <div className="card">
        <h1 className="text-lg font-bold text-gray-900 mb-3">Подбор рейки по VIN</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={vin}
            onChange={handleVinChange}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Введите 17 символов VIN"
            maxLength={17}
            className={`flex-1 px-4 py-3 rounded-xl border text-base font-mono tracking-widest
              focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase
              ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
          />
          <button
            onClick={handleSearch}
            disabled={vin.length !== 17 || loading}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed px-6"
          >
            {loading ? '...' : 'Найти'}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">{vin.length}/17 символов</p>
          {updated && (
            <p className="text-xs text-gray-400">
              Таблица: {updated.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {/* ЗАГРУЗКА */}
      {loading && (
        <div className="card text-center py-8">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Анализирую VIN и подбираю рейку...</p>
        </div>
      )}

      {/* РЕЗУЛЬТАТ */}
      {result && !loading && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Результат подбора</p>
            <button
              onClick={handleReset}
              className="text-sm text-brand-600 hover:text-brand-800"
            >
              Новый поиск
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {result}
          </div>
        </div>
      )}

    </div>
  )
}
