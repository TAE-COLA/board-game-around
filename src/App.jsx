import { BrowserRouter } from 'react-router-dom';
import { PageRouter } from './pages';

function App() {
  return (
    <div className="app min-h-screen bg-blue-200">
      <BrowserRouter>
        <PageRouter />
      </BrowserRouter>
    </div>
  );
}

export default App