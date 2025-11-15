import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import InfluencersPage from './pages/InfluencersPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/influencers" element={<InfluencersPage />} />
        <Route path="/" element={<InfluencersPage />} />
      </Routes>
    </Router>
  )
}

export default App

