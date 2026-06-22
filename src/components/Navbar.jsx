import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-bold text-brand-600 text-lg tracking-tight">РеeckiPro</span>
        <nav className="flex gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            Подбор по VIN
          </NavLink>
          <NavLink
            to="/catalog"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            Каталог
          </NavLink>
          <NavLink
            to="/ask"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            ✦ ИИ
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
