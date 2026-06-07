import { useNavigate } from 'react-router';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EFF6FF] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <span className="text-lg font-bold text-[#1E293B]">KhetMap</span>
        </div>
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#1E293B] rounded-lg hover:bg-[#F1F5F9] transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-5 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:shadow-md">
                Sign Up Free
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <button
              onClick={() => navigate('/map')}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
            >
              Go to Map
            </button>
          </SignedIn>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#1E293B] mb-4 tracking-tight">
            See Your Land from Space
          </h1>
          <p className="text-lg text-[#475569] max-w-2xl mx-auto mb-8 leading-relaxed">
            KhetMap is a free, satellite-powered tool for farmers, researchers, and GIS professionals.
            Monitor crop health, water index, and soil health — right from your browser.
          </p>

          <SignedOut>
            <div className="flex items-center justify-center gap-3 mb-12">
              <SignUpButton mode="modal">
                <button className="px-8 py-3.5 text-base font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                  Get Started Free
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-8 py-3.5 text-base font-medium text-[#475569] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-xl shadow-sm transition-all hover:shadow-md">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="mb-12">
              <button
                onClick={() => navigate('/map')}
                className="px-8 py-3.5 text-base font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Open Map Dashboard
              </button>
            </div>
          </SignedIn>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            {[
              { icon: '🌿', title: 'Crop Health (NDVI)', desc: 'Monitor vegetation vigor and detect crop stress with live satellite imagery' },
              { icon: '💧', title: 'Water Index (NDWI)', desc: 'Identify waterlogged areas and measure field moisture content' },
              { icon: '🪨', title: 'Soil Health (SAVI)', desc: 'Soil-adjusted vegetation analysis for accurate crop monitoring' },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-5 border border-[#E2E8F0] text-left hover:border-[#93C5FD] hover:shadow-md transition-all">
                <span className="text-2xl block mb-2">{feature.icon}</span>
                <h3 className="text-sm font-semibold text-[#1E293B] mb-1">{feature.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              '🛰️ Live Satellite',
              '🗺️ Draw Fields',
              '📐 Measure Area',
              '📊 Export Data',
              '🌍 GPS Coordinates',
              '🔗 Share Fields',
            ].map((pill) => (
              <span key={pill} className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-full text-xs text-[#475569] shadow-sm">
                {pill}
              </span>
            ))}
          </div>

          <p className="mt-8 text-xs text-[#94A3B8]">
            Free for everyone · Powered by NASA &amp; ESA satellite data · Works offline
          </p>
        </div>
      </main>
    </div>
  );
}
