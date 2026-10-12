import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';   // colours + fonts (must come before the others)
import './styles/global.css';   // resets, nav, cursor, global layers
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
