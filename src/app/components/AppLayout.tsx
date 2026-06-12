import { useNavigate, useLocation } from 'react-router';
import { Map, Leaf, BarChart3, User, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

const tabs = [
  { path: '/map',      label: 'Map',     icon: Map           },
  { path: '/farms',   label: 'Farms',   icon: Leaf          },
  { path: '/analyze', label: 'Analyze', icon: BarChart3     },
  { path: '/hari',    label: 'HARI AI', icon: MessageCircle, special: true },
  { path: '/profile', label: 'Profile', icon: User          },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="h-full flex flex-col bg-[#0A1F0A]">
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      <nav className="flex items-center justify-around px-2 py-2 bg-[#0D2818] border-t border-[#1B4D2E]"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          if (tab.special) {
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-0.5 px-3 py-1"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? 'bg-[#52B788] shadow-[#52B788]/30'
                      : 'bg-gradient-to-br from-[#52B788] to-[#2D6A4F] shadow-[#2D6A4F]/40'
                  }`}
                  style={{ marginTop: -16 }}
                >
                  <Icon size={22} className="text-[#0A1F0A]" />
                </motion.div>
                <span className={`text-[9px] font-bold mt-0.5 ${isActive ? 'text-[#52B788]' : 'text-[#6B8E6B]'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-[#52B788]'
                  : 'text-[#6B8E6B] hover:text-[#A5D6A7]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="w-4 h-0.5 bg-[#52B788] rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
