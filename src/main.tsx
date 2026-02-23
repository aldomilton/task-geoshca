// Entry point of React application

import { StrictMode } from 'react' // Enables additional checks in development
import { createRoot } from 'react-dom/client' // React 18 root API
import './index.css' // Global styles
import App from './App.tsx' // Main application component

// Attach React app to the HTML div with id="root"
createRoot(document.getElementById('root')!).render(
  <StrictMode> {/* Helps detect potential problems */}
    <App /> {/* Root component */}
  </StrictMode>,
)