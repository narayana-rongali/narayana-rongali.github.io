import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Production HTML is prerendered, so React attaches to it. The dev server starts empty.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
