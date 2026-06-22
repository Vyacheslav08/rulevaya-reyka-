import { useState, useEffect, useCallback } from 'react'
import { decodeVin, validateVin } from '../utils/vinDecoder'
import { getRackCandidates } from '../utils/rackRules'
import { fetchRacks, findByCode, getLastUpdated } from '../services/sheets'
import RackCard from '../components/RackCard'

// Иконка стрелки назад
const BackIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

export default function VinSearch() {
  const [vin, setVin]           = useState('')
  const [vinInfo, setVinInfo]   = useState(null)
  const [vinErr, setVinErr]     = useState('')
  const [answers, setAnswers]   = useState({})
  const [racks, setRacks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [sheetErr, setSheetErr] = useState('')
  const [updated, setUpdated]   = useState(null)
  const [step, setStep]         = useState('input') // input | questions | result | notfound

  // Загрузка реек при монтировании
  useEffect(() => {
    fetchRacks()
      .then(r => { setRacks(r); setUpdated(getLastUpdated()) })
      .catch(() => setSheetErr('Не удалось загрузить данные из таблицы. Проверьте интернет.'))
      .finally(() => setLoading(false))
  }, [])

  // Перерасчёт при изменении answers
  const { candidates, questions, unknown } = getRackCandidates(vinInfo, answers)

  const handleVinChange = (e) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17)
    setVin(v)
    setVinErr('')
    if (vinInfo) { setVinInfo(null); setAnswers({}); setStep('input') }
  }

  const handleSearch = () => {
    const err = validateVin(vin)
    if (err) { setVinErr(err); return }
    const info = decodeVin(vin)
    if (info.error) { setVinErr(info.error); return }
    setVinInfo(info)
    setAnswers({})
    setStep('questions')
  }

  const handleAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  const handleReset = () => {
    setVin(''); setVinInfo(null); setAnswers({}); setVinErr(''); setStep('input')
  }

  // Определяем следующий вопрос (первый без ответа)
  const nextQuestion = questions.find(q => !answers[q.id])

  // Когда все вопросы отвечены — показываем результат
  useEffect(() => {
    if (!vinInfo) return
    if (questions.length === 0 || (!nextQuestion && candidates.length > 0)) {
      setStep('result')
    } else if (candidates.length === 0 && questions.length === 0) {
      setStep('notfound')
    }
  }, [answers, vinInfo, questions, candidates, nextQuestion])

  // ── Результирующие карточки ──
  const resultCards = candidates.flatMap(c => {
    const found = findByCode(racks, c.code)
    if (found.length > 0) return found.map(r => ({ ...r, _hint: c.note }))
    // Кандидат известен, но в таблице нет — показываем заглушку
    return [{ code: c.code, name: c.label || c.code, inStock: 0, reserve: 0, drop: null, retail: null, _hint: c.note, _absent: true }]
  })

  // ── Рендер ─────────────────────────────────────────────────────
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
              ${vinErr ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
          />
          <button
            onClick={handleSearch}
            disabled={vin.length !== 17}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed px-6"
          >
            Найти
          </button>
        </div>
        {vinErr && <p className="text-red-600 text-sm mt-2">{vinErr}</p>}
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">
            {vin.length}/17 символов
          </p>
          {loading && <p className="text-xs text-gray-400">Загружаем таблицу...</p>}
          {sheetErr && <p className="text-xs text-red-500">{sheetErr}</p>}
          {updated && !loading && (
            <p className="text-xs text-gray-400">
              Таблица: {updated.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {/* ИНФО О МАШИНЕ */}
      {vinInfo && (
        <div className="card bg-brand-50 border-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-brand-800">
                {vinInfo.brand || 'Марка не определена'}
                {vinInfo.year ? ` · ${vinInfo.year} г.` : ''}
              </p>
              <p className="text-sm text-brand-600">{vinInfo.country || ''} · WMI: {vinInfo.wmi}</p>
            </div>
            <button onClick={handleReset} className="text-sm text-brand-600 hover:text-brand-800 flex items-center">
              <BackIcon /> Новый
            </button>
          </div>
          {!vinInfo.known && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-2">
              Марка не распознана — подбор невозможен. Уточните у клиента модель и год вручную.
            </p>
          )}
        </div>
      )}

      {/* ВОПРОСЫ */}
      {vinInfo && vinInfo.known && nextQuestion && (
        <div className="card">
          <p className="font-semibold text-gray-800 mb-3">{nextQuestion.text}</p>
          <div className="space-y-2">
            {nextQuestion.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(nextQuestion.id, opt.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm
                  ${answers[nextQuestion.id] === opt.value
                    ? 'border-brand-500 bg-brand-50 text-brand-800 font-semibold'
                    : 'border-gray-100 bg-white hover:border-brand-300 hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <span className="block font-medium">{opt.label}</span>
                {opt.note && <span className="block text-xs text-gray-500 mt-0.5">{opt.note}</span>}
              </button>
            ))}
          </div>

          {/* История предыдущих ответов */}
          {Object.entries(answers).length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Предыдущие ответы:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(answers).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setAnswers(prev => {
                      const n = { ...prev }
                      delete n[k]
                      // Сбросить все последующие
                      const keys = Object.keys(n)
                      const idx = keys.indexOf(k)
                      keys.slice(idx).forEach(ki => delete n[ki])
                      return n
                    })}
                    className="text-xs bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 px-2 py-1 rounded-lg transition-colors"
                  >
                    {v} ✕
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* РЕЗУЛЬТАТ */}
      {step === 'result' && resultCards.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Результат подбора</p>
          {resultCards.map((r, i) => (
            <div key={i}>
              {r._hint && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 mb-2">{r._hint}</p>
              )}
              {r._absent ? (
                <div className="card border-dashed border-gray-300 text-center py-5">
                  <p className="font-bold text-gray-400 text-xl">{r.code}</p>
                  <p className="text-sm text-gray-500 mt-1">{r.name}</p>
                  <p className="text-xs text-red-500 mt-2">Нет в таблице — уточните у менеджера</p>
                </div>
              ) : (
                <RackCard rack={r} highlight={i === 0} />
              )}
            </div>
          ))}

          {/* Кнопка нового поиска */}
          <button onClick={handleReset} className="btn-secondary w-full mt-2">
            Новый поиск
          </button>
        </div>
      )}

      {/* НЕ НАЙДЕНО */}
      {step === 'notfound' && (
        <div className="card text-center py-8">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-gray-700">Рейка не определена</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Эта комбинация не входит в нашу базу подбора.
            Уточните у менеджера вручную.
          </p>
          <button onClick={handleReset} className="btn-secondary">Новый поиск</button>
        </div>
      )}
    </div>
  )
}
