import { BrowserRouter } from 'react-router-dom';
import { PageRouter } from './pages';

function App() {
  return (
    <div className="app flex flex-col w-full bg-blue-200 min-h-screen overflow-x-hidden">
      <BrowserRouter>
        <PageRouter />
      </BrowserRouter>
    </div>
  );
}

export default App