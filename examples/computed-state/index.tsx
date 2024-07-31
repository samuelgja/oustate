import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'

const container = document.querySelector('#app')
if (!container) {
  throw new Error('container not found')
}
const root = createRoot(container) // createRoot(container!) if you use TypeScript
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
