import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Welcome from './pages/Welcome';
import MapPage from './pages/MapPage';
import Farms from './pages/Farms';
import Analyze from './pages/Analyze';
import Profile from './pages/Profile';
import HARIChat from './pages/HARIChat';
import AppLayout from './components/AppLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#050D05]">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl">🌾</div>
          <div className="w-8 h-8 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6B8E6B] text-sm">KhetMap loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#050D05]">
        <div className="w-8 h-8 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/map" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#132A1A',
            color: '#E8F5E9',
            border: '1px solid #1B4D2E',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
        <Route path="/map"     element={<ProtectedRoute><AppLayout><MapPage  /></AppLayout></ProtectedRoute>} />
        <Route path="/farms"   element={<ProtectedRoute><AppLayout><Farms    /></AppLayout></ProtectedRoute>} />
        <Route path="/analyze" element={<ProtectedRoute><AppLayout><Analyze  /></AppLayout></ProtectedRoute>} />
        <Route path="/hari"    element={<ProtectedRoute><AppLayout><HARIChat /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile  /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/map' : '/'} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
