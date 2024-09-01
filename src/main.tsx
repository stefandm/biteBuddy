import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SkeletonTheme } from 'react-loading-skeleton';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SkeletonTheme baseColor="#cfe3db" highlightColor="#62b392">
     <App />
    </SkeletonTheme>
  </StrictMode>,
)
