import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { signOut } from '../../services/auth';
import LanguageSelector from '../components/LanguageSelector';
import { toast } from 'sonner';

const menuSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'edit' },
      { icon: Bell, label: 'notifications', value: 'on' },
    ],
  },
  {
    title: 'Data',
    items: [
      { icon: Download, label: 'offline' },
      { icon: Trash2, label: 'cache' },
      { icon: FileDown, label: 'export' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'help' },
      { icon: MessageSquare, label: 'feedback' },
      { icon: Star, label: 'rate' },
    ],
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showLangSelector, setShowLangSelector] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      navigate('/');
    } catch {
      toast.error('Failed to sign out');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0A1F0A] overflow-auto">
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-[#E8F5E9]">{t('profile.title')}</h1>
      </div>

      <div className="px-5 pb-6 space-y-5">
        {/* User card */}
        <div className="bg-[#132A1A] rounded-xl p-6 border border-[#1B4D2E] flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#0D2818] flex items-center justify-center border-2 border-[#52B788] mb-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full" />
            ) : (
              <User size={28} className="text-[#52B788]" />
            )}
          </div>
          <h2 className="text-lg font-bold text-[#E8F5E9]">{user?.name || 'Farmer'}</h2>
          <p className="text-xs text-[#6B8E6B] mb-4">{user?.email || user?.phone || 'No contact'}</p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xl font-bold text-[#52B788]">0</p>
              <p className="text-[10px] text-[#6B8E6B]">{t('profile.fields')}</p>
            </div>
            <div className="w-px h-8 bg-[#1B4D2E]" />
            <div className="text-center">
              <p className="text-xl font-bold text-[#52B788]">0</p>
              <p className="text-[10px] text-[#6B8E6B]">{t('profile.analyses')}</p>
            </div>
            <div className="w-px h-8 bg-[#1B4D2E]" />
            <div className="text-center">
              <p className="text-xl font-bold text-[#52B788]">0</p>
              <p className="text-[10px] text-[#6B8E6B]">Ha</p>
            </div>
          </div>
        </div>

        {/* Language selector highlight */}
        <button
          onClick={() => setShowLangSelector(true)}
          className="w-full flex items-center justify-between bg-[#52B788]/10 border border-[#52B788]/30 rounded-xl px-4 py-3.5 hover:bg-[#52B788]/15 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Globe size={20} className="text-[#52B788]" />
            <div className="text-left">
              <p className="text-sm font-semibold text-[#E8F5E9]">{t('profile.choose')}</p>
              <p className="text-[10px] text-[#6B8E6B]">
                {lang === 'en' ? 'English' : lang === 'te' ? 'తెలుగు' : 'हिंदी'}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#6B8E6B]" />
        </button>

        {/* Menu sections */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-[10px] font-semibold text-[#6B8E6B] tracking-widest mb-2 uppercase px-0.5">{section.title}</h3>
            <div className="bg-[#132A1A] rounded-xl border border-[#1B4D2E] overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#1A3A2A] transition-colors ${i < section.items.length - 1 ? 'border-b border-[#1B4D2E]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className="text-[#A5D6A7]" />
                    <span className="text-sm text-[#E8F5E9]">{t('profile.' + item.label)}</span>
                  </div>
                  {'value' in item && item.value ? (
                    <span className="text-xs text-[#6B8E6B]">{item.value === 'on' ? t('common.on') : item.value}</span>
                  ) : (
                    <ChevronRight size={14} className="text-[#6B8E6B]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-center gap-2 bg-[#EF5350]/10 border border-[#EF5350]/30 rounded-xl py-3.5 text-sm font-semibold text-[#EF5350] hover:bg-[#EF5350]/20 transition-colors disabled:opacity-50"
        >
          {isSigningOut ? (
            <div className="w-4 h-4 border-2 border-[#EF5350] border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut size={18} />
          )}
          {t('profile.signout')}
        </button>

        <p className="text-[10px] text-center text-[#6B8E6B] opacity-60">
          KhetMap v1.0.0 · Open Source · Free for everyone
        </p>
      </div>

      {/* Language Selector Modal */}
      {showLangSelector && (
        <LanguageSelector onClose={() => setShowLangSelector(false)} />
      )}
    </div>
  );
}

// Icon components
function Globe({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
    </svg>
  );
}
function Bell({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 4 9 4 9H2s4-2 4-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function Download({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
    </svg>
  );
}
function Trash2({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}
function FileDown({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="18" y2="12"/><polyline points="9 15 12 12 15 15"/>
    </svg>
  );
}
function HelpCircle({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/>
    </svg>
  );
}
function MessageSquare({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function Star({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
