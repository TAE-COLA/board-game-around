import { LoginPage, MainPage } from 'pages';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

const PageRouter: React.FC = () => {
  const location = useLocation();

  return (
    <Routes location={ location }>
      <Route path="/" element={ <MainPage /> } />
      <Route path="/login" element={ <LoginPage /> } />
      <Route path="*" element={ <div>404 Not Found</div> } />
    </Routes>
  )
}

export default PageRouter;