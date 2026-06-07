import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import Welcome from './pages/Welcome';
import MapPage from './pages/MapPage';
import Farms from './pages/Farms';
import FarmDetail from './pages/FarmDetail';
import Analyze from './pages/Analyze';
import Profile from './pages/Profile';
import AppLayout from './components/AppLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0A1F0A]">
        <div className="w-8 h-8 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0A1F0A]">
        <div className="w-8 h-8 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/map" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#132A1A', color: '#E8F5E9', border: '1px solid #1B4D2E' } }} />
      <Routes>
        <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
        <Route path="/map" element={<ProtectedRoute><AppLayout><MapPage /></AppLayout></ProtectedRoute>} />
        <Route path="/farms" element={<ProtectedRoute><AppLayout><Farms /></AppLayout></ProtectedRoute>} />
        <Route path="/farms/:id" element={<ProtectedRoute><AppLayout><FarmDetail /></AppLayout></ProtectedRoute>} />
        <Route path="/analyze" element={<ProtectedRoute><AppLayout><Analyze /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/map" : "/"} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
