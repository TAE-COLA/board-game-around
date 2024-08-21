import { BrowserRouter } from 'react-router-dom';
import { PageRouter } from './pages';

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <PageRouter />
      </BrowserRouter>
    </div>
  );
}

export default App