import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { MainPage } from './main';

const PageRouter: React.FC = () => {
  const location = useLocation();

  return (
    <Routes location={ location }>
      <Route path="/" element={ <MainPage /> } />
    </Routes>
  )
}

export default PageRouter;