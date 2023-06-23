import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import OAuthComplete from './pages/OAuthComplete'
import './index.css'

export default function App() {
  return (
    <Routes>
      <Route index path="/" element={<Home />} />
      <Route path="/oauth_complete" element={<OAuthComplete />} />
    </Routes>
  )
}
