import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import Welcome from './pages/Welcome';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import MapPage from './pages/MapPage';
import Farms from './pages/Farms';
import FarmDetail from './pages/FarmDetail';
import Analyze from './pages/Analyze';
import Profile from './pages/Profile';
import AppLayout from './components/AppLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { openSignIn } = useClerk();
  
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="h-full flex items-center justify-center bg-[#F8FAFC]">
          <div className="text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1E293B] mb-2">Sign in to continue</h2>
            <p className="text-sm text-[#64748B] mb-6">Please sign in to access this page</p>
            <button
              onClick={() => openSignIn()}
              className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-semibold text-sm hover:bg-[#1D4ED8] transition-colors shadow-sm"
            >
              Sign In
            </button>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Toaster position="top-center" toastOptions={{ style: { background: '#FFFFFF', color: '#1E293B', border: '1px solid #E2E8F0' } }} />
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/map" element={<ProtectedRoute><AppLayout><MapPage /></AppLayout></ProtectedRoute>} />
            <Route path="/farms" element={<ProtectedRoute><AppLayout><Farms /></AppLayout></ProtectedRoute>} />
            <Route path="/farms/:id" element={<ProtectedRoute><AppLayout><FarmDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/analyze" element={<ProtectedRoute><AppLayout><Analyze /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
