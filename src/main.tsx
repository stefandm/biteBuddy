import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Import the skeleton CSS here

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SkeletonTheme baseColor="#FED7AA" highlightColor="#FFEDD5">
      <App />
    </SkeletonTheme>
  </StrictMode>
);
