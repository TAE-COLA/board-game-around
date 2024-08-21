import { Route, Routes, useLocation } from 'react-router-dom';
import { MainPage } from './main';

const PageRouter = () => {
  const location = useLocation();

  return (
    <Routes location={ location }>
      <Route path="/" element={ <MainPage /> } />
    </Routes>
  )
}

export default PageRouter;