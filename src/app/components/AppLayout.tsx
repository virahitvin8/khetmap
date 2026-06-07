import { useNavigate, useLocation } from 'react-router';
import { Map, Leaf, BarChart3, User } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';

const tabs = [
  { path: '/map', label: 'Map', icon: Map },
  { path: '/farms', label: 'Farms', icon: Leaf },
  { path: '/analyze', label: 'Analyze', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex items-center justify-around px-4 py-2 bg-white border-t border-[#E2E8F0] shadow-[0_-1px_3px_rgba(0,0,0,0.04)]">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-[#2563EB]'
                  : 'text-[#94A3B8] hover:text-[#475569]'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] font-medium ${
                isActive ? 'font-semibold' : ''
              }`}>{tab.label}</span>
            </button>
          );
        })}
        <div className="flex flex-col items-center gap-0.5 px-4 py-1">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-5 h-5',
                userButtonOuterIdentifier: 'text-[10px] text-[#94A3B8]',
              },
            }}
          />
        </div>
      </nav>
    </div>
  );
}
