import './App.css';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import SearchProductPage from './pages/SearchProductPage/SearchProductPage';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Layout>{children}</Layout>
);

const LocalRoutes: React.FC = () => (
  <Routes>
    <Route path="*" element={<PublicLayout> <SearchProductPage /> </PublicLayout>} />
  </Routes>
);

function App() { 
  return <LocalRoutes />;
}

export default App;
