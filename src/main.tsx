import React from 'react';
import Home from './App'; // Importa el componente Home

import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Home /> {/* Usa el componente Home */}
  </React.StrictMode>
);
