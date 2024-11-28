import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { EditorProvider } from './context/EditorProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EditorProvider>
    <App />
    </EditorProvider>
  </StrictMode>,
)
