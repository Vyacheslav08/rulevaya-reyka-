import { useState, useRef, useEffect } from 'react'
import { askClaude } from '../services/claude'

export default function ClaudeChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Привет! Спроси меня про любую рейку: марку, модель, год — подберу и скажу что ответить клиенту.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)
    try {
      const history = messages
  .filter(m => m.role !== 'assistant' || messages.indexOf(m) !== 0)
  .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))

const answer = await askClaude(q, history)
      setMessages(prev => [...prev, { role: 'assistant', text: answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Ошибка соединения. Попробуй ещё раз.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${m.role === 'user'
                  ? 'bg-brand-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm">
              <span className="animate-pulse">Думаю...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Быстрые подсказки */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            'BMW E46 2003 задний привод',
            'Focus 2 гидро или ЭУР?',
            'Touareg 2012 какая рейка?',
            'Octavia 2010 что взять?',
          ].map(hint => (
            <button
              key={hint}
              onClick={() => { setInput(hint); }}
              className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      {/* Поле ввода */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Марка, модель, год или вопрос..."
          disabled={loading}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="btn-primary px-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    </div>
  )
}
