import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Routes from './Routes'

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes />
  </BrowserRouter>
)

const root = createRoot(document.getElementById('root'))
root.render(<App />)
