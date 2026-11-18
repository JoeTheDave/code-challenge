import { Link, Route, Routes, useParams } from 'react-router-dom'
import { Home } from './pages/Home'
import { ProblemPage } from './pages/ProblemPage'
import { Settings } from './pages/Settings'

function AocRoute() {
  const { year, day } = useParams()
  return <ProblemPage id={`aoc/${year}/${day!.padStart(2, '0')}`} />
}

function EulerRoute() {
  const { number } = useParams()
  return <ProblemPage id={`euler/${number!.padStart(3, '0')}`} />
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/aoc/:year/:day" element={<AocRoute />} />
      <Route path="/euler/:number" element={<EulerRoute />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<p className="page">Not found. <Link to="/">Home</Link></p>} />
    </Routes>
  )
}
