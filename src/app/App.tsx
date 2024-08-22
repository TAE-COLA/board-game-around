import { PageRouter } from 'pages';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <div className="app flex flex-col w-full bg-blue-200 min-h-screen overflow-x-hidden">
      <BrowserRouter>
        <PageRouter />
      </BrowserRouter>
    </div>
  );
}

export default App