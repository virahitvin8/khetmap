import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import Welcome from './pages/Welcome';
import MapPage from './pages/MapPage';
import Farms from './pages/Farms';
import FarmDetail from './pages/FarmDetail';
import Analyze from './pages/Analyze';
import Profile from './pages/Profile';
import AppLayout from './components/AppLayout';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Toaster position="top-center" toastOptions={{ style: { background: '#132A1A', color: '#E8F5E9', border: '1px solid #1B4D2E' } }} />
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/map" element={<AppLayout><MapPage /></AppLayout>} />
            <Route path="/farms" element={<AppLayout><Farms /></AppLayout>} />
            <Route path="/farms/:id" element={<AppLayout><FarmDetail /></AppLayout>} />
            <Route path="/analyze" element={<AppLayout><Analyze /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
