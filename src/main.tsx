import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css?hold=3'
import App from './App.tsx?hold=3'
import { applyTheme, readTheme } from './utils/theme.ts'

applyTheme(readTheme())

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Не найден элемент #root')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
