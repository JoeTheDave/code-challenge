import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@xterm/xterm/css/xterm.css'
import './styles.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
