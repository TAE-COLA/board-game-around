import { LoginPage, MainPage, ProtectedRoute } from 'pages';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

const PageRouter: React.FC = () => {
  const location = useLocation();

  return (
    <Routes location={ location }>
      <Route path="/login" element={ <LoginPage /> } />
      <Route element={ <ProtectedRoute /> }>
        <Route path="/main" element={ <MainPage /> } />
      </Route>
      <Route path="*" element={ <div>404 Not Found</div> } />
    </Routes>
  )
}

export default PageRouter;