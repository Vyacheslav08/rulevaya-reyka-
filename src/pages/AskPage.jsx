import ClaudeChat from '../components/ClaudeChat'

export default function AskPage() {
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-900">Спросить ИИ</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Знает все рейки, правила подбора и актуальный остаток со склада
        </p>
      </div>
      <div className="card flex-1 flex flex-col overflow-hidden">
        <ClaudeChat />
      </div>
    </div>
  )
}
