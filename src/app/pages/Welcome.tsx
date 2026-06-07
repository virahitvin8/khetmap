import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Satellite, Mail } from 'lucide-react';
import { signInWithGoogle } from '../../services/auth';
import { toast } from 'sonner';

export default function Welcome() {
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
      navigate('/map');
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0A1F0A]">

      {/* Satellite icon */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-28 h-28 rounded-full bg-[#0D2818] flex items-center justify-center border-2 border-[#2D6A4F] mb-8 shadow-[0_0_30px_rgba(82,183,136,0.15)]">
          <Satellite size={56} className="text-[#52B788]" />
        </div>

        <h1 className="text-5xl font-extrabold text-[#E8F5E9] mb-2 tracking-tight">
          KhetMap
        </h1>
        <p className="text-lg text-[#52B788] italic mb-8">
          See your land from space
        </p>

        <div className="bg-[#0D2818] rounded-xl px-6 py-4 mb-8 border border-[#1B4D2E]">
          <p className="text-[#A5D6A7] text-center text-sm leading-relaxed">
            Analyze your fields using live satellite imagery.{'\n'}
            Crop health · Water logging · Terrain · Weather
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {['🛰️ Live Satellite', '🌿 Crop Health', '💧 Water Analysis', '🗺️ Draw Fields'].map((feat) => (
            <span key={feat} className="px-3 py-1.5 bg-[#0D2818] border border-[#1B4D2E] rounded-full text-xs text-[#52B788]">
              {feat}
            </span>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#0A1F0A] rounded-xl py-3.5 font-semibold text-base hover:bg-gray-100 transition-colors disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-[#0A1F0A] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#1B4D2E]" />
            <span className="text-xs text-[#6B8E6B]">or</span>
            <div className="flex-1 h-px bg-[#1B4D2E]" />
          </div>

          <button
            onClick={() => toast.info('Email sign-up coming in next update')}
            className="w-full flex items-center justify-center gap-2 bg-[#0D2818] border border-[#1B4D2E] text-[#E8F5E9] rounded-xl py-3.5 text-base hover:bg-[#1A3A2A] transition-colors"
          >
            <Mail size={18} />
            Continue with Email
          </button>
        </div>

        <p className="mt-8 text-xs text-[#6B8E6B] text-center">
          Free for everyone · Powered by open satellite data
        </p>
      </div>
    </div>
  );
}
