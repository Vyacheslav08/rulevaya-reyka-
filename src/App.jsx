import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import VinSearch from './pages/VinSearch'
import Catalog from './pages/Catalog'
import AskPage from './pages/AskPage'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/" element={<VinSearch />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/ask" element={<AskPage />} />
        </Routes>
      </main>
    </div>
  )
}
