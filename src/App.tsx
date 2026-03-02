import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddSupplement from './pages/AddSupplement';
import Analysis from './pages/Analysis';
import SchedulePage from './pages/Schedule';
import { SupplementProvider } from './context/SupplementContext';

export default function App() {
  return (
    <SupplementProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/add" element={<AddSupplement />} />
            <Route path="/edit/:id" element={<AddSupplement />} /> {/* Reuse Add for Edit for simplicity in this demo */}
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/schedule" element={<SchedulePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SupplementProvider>
  );
}
