import { App, Providers } from 'app';
import { initPages } from 'pages';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

initPages();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <Providers>
    <App />
  </Providers>
);

reportWebVitals();
