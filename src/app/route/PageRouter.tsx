import { AuthProvider, LoungeProvider } from 'app';
import { DavinciCodePage, LoginPage, LoungePage, MainPage, RegisterPage, YachtDicePage } from 'pages';
import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

export const PageRouter: React.FC = () => {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path={Paths.default} element={<Navigate to={Paths.login} replace />} />
      <Route path={Paths.login} element={<LoginPage />} />
      <Route path={Paths.register} element={<RegisterPage />} />
      <Route element={<AuthProvider />}>
        <Route path={Paths.main} element={<MainPage />} />
        <Route element={<LoungeProvider />}>
          <Route path={Paths.lounge} element={<LoungePage />} />
          <Route path={Paths.yachtDice} element={<YachtDicePage />} />
          <Route path={Paths.davinciCode} element={<DavinciCodePage />} />
        </Route>
      </Route>
      <Route path={Paths.notFound} element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export const Paths = {
  default: '/',
  main: '/main',
  login: '/login',
  register: '/register',
  lounge: '/lounge',
  yachtDice: '/yachtdice',
  davinciCode: '/davincicode',
  notFound: '*',
};
