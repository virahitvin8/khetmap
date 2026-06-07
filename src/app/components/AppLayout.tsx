import { useNavigate, useLocation } from 'react-router';
import { Map, Leaf, BarChart3, User } from 'lucide-react';

const tabs = [
  { path: '/map', label: 'Map', icon: Map },
  { path: '/farms', label: 'Farms', icon: Leaf },
  { path: '/analyze', label: 'Analyze', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="h-full flex flex-col bg-[#0A1F0A]">
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      
      <nav className="flex items-center justify-around px-4 py-3 bg-[#0D2818] border-t border-[#1B4D2E]">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
                isActive 
                  ? 'text-[#52B788]' 
                  : 'text-[#6B8E6B] hover:text-[#A5D6A7]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
