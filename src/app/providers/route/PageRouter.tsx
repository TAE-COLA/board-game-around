import { useToast } from '@chakra-ui/react';
import { AuthProvider, LoungeProvider } from 'app';
import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { GameName } from 'shared';
import { pageRegistry } from './PageRegistry';

export const PageRouter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <Routes location={location}>
      <Route path={Paths.default} element={<Navigate to={Paths.login} replace />} />
      <Route
        path={Paths.login}
        element={<pageRegistry.LoginPage navigate={navigate} toast={toast} />}
      />
      <Route
        path={Paths.register}
        element={<pageRegistry.RegisterPage navigate={navigate} toast={toast} />}
      />
      <Route element={<AuthProvider />}>
        <Route
          path={Paths.main}
          element={<pageRegistry.MainPage navigate={navigate} toast={toast} />}
        />
        <Route element={<LoungeProvider />}>
          <Route
            path={Paths.lounge}
            element={<pageRegistry.LoungePage navigate={navigate} toast={toast} />}
          />
          <Route
            path={Paths.yachtDice}
            element={<pageRegistry.YachtDicePage navigate={navigate} toast={toast} />}
          />
          <Route
            path={Paths.davinciCode}
            element={<pageRegistry.DavinciCodePage navigate={navigate} toast={toast} />}
          />
        </Route>
      </Route>
      <Route path={Paths.notFound} element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export const Paths = {
  default: '/',
  login: '/login',
  register: '/register',
  main: '/main',
  lounge: '/lounge',
  yachtDice: GameName.YatchDice.path,
  davinciCode: GameName.DavinciCode.path,
  notFound: '*',
};
