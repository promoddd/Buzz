import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'

// Wait for translations to load before rendering
createRoot(document.getElementById("root")!).render(<App />);