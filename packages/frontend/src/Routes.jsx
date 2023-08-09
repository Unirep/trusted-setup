import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Contribute from './pages/Contribute'
import Stats from './pages/Stats'
import OAuthComplete from './pages/OAuthComplete'
import './index.css'

export default function App() {
  return (
    <Routes>
      <Route index path="/" element={<Home />} />
      <Route index path="/contribute" element={<Contribute />} />
      <Route index path="/stats" element={<Stats />} />
      <Route path="/oauth_complete" element={<OAuthComplete />} />
    </Routes>
  )
}
