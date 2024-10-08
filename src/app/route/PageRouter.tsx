import { AuthProvider, LoungeProvider } from 'app';
import { LoginPage, LoungePage, MainPage, RegisterPage, YachtDicePage } from 'pages';
import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

const PageRouter: React.FC = () => {
  const location = useLocation();

  return (
    <Routes location={ location }>
      <Route path="/" element={ <Navigate to="/login" replace /> } />
      <Route path="/login" element={ <LoginPage /> } />
      <Route path="/register" element={ <RegisterPage /> } />
      <Route element={ <AuthProvider /> }>
        <Route path="/main" element={ <MainPage /> } />
        <Route element={ <LoungeProvider /> }>
          <Route path="/lounge" element={ <LoungePage /> } />
          <Route path="/요트다이스" element={ <YachtDicePage /> } />
        </Route>
      </Route>
      <Route path="*" element={ <div>404 Not Found</div> } />
    </Routes>
  )
}

export default PageRouter;