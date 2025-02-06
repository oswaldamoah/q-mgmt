import React from 'react';  // Ensure React is imported
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Your custom CSS for the app
import App from './App.jsx'; // Your main app component

// Create root and render the App inside StrictMode for development
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
