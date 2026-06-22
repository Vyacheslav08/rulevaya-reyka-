export default function RackCard({ rack, highlight }) {
  if (!rack) return null

  const stock = rack.inStock || 0
  const res   = rack.reserve || 0

  const stockBadge = stock > 0
    ? <span className="badge-green">{stock} в наличии</span>
    : <span className="badge-red">нет в наличии</span>

  const resBadge = res > 0
    ? <span className="badge-yellow">{res} в резерве</span>
    : null

  return (
    <div className={`card transition-shadow ${highlight ? 'ring-2 ring-brand-500' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-brand-600 text-xl">{rack.code}</span>
            {highlight && <span className="badge-green text-xs">Подобрана</span>}
          </div>
          <p className="text-gray-600 text-sm mt-0.5 leading-snug">{rack.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {stockBadge}
        {resBadge}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-0.5">Дроп-цена</div>
          <div className="font-bold text-gray-900 text-base">
            {rack.drop ? rack.drop.label : '—'}
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3">
          <div className="text-xs text-blue-500 mb-0.5">Розница</div>
          <div className="font-bold text-blue-800 text-base">
            {rack.retail ? rack.retail.label : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}
