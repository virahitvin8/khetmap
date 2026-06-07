import { User, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser, UserButton } from '@clerk/clerk-react';
import LanguageSelector from '../components/LanguageSelector';
import { useState } from 'react';

export default function Profile() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const { user: clerkUser } = useUser();
  const [showLangSelector, setShowLangSelector] = useState(false);

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] overflow-auto">
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-[#1E293B]">{t('profile.title')}</h1>
      </div>

      <div className="px-5 pb-6 space-y-5">
        {/* User card */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center border-2 border-[#2563EB] mb-3">
            {clerkUser?.imageUrl ? (
              <img src={clerkUser.imageUrl} alt="" className="w-14 h-14 rounded-full" />
            ) : (
              <User size={28} className="text-[#2563EB]" />
            )}
          </div>
          <h2 className="text-lg font-bold text-[#1E293B]">{user?.name || 'User'}</h2>
          <p className="text-xs text-[#64748B] mb-4">{user?.email || 'Signed in with Clerk'}</p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xl font-bold text-[#2563EB]">0</p>
              <p className="text-[10px] text-[#64748B]">{t('profile.fields')}</p>
            </div>
            <div className="w-px h-8 bg-[#E2E8F0]" />
            <div className="text-center">
              <p className="text-xl font-bold text-[#2563EB]">0</p>
              <p className="text-[10px] text-[#64748B]">{t('profile.analyses')}</p>
            </div>
            <div className="w-px h-8 bg-[#E2E8F0]" />
            <div className="text-center">
              <p className="text-xl font-bold text-[#2563EB]">0</p>
              <p className="text-[10px] text-[#64748B]">Ha</p>
            </div>
          </div>
        </div>

        {/* Clerk UserButton */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User size={18} className="text-[#2563EB]" />
            <div>
              <p className="text-sm font-semibold text-[#1E293B]">Account</p>
              <p className="text-[10px] text-[#64748B]">Manage your profile &amp; sign out</p>
            </div>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9',
              },
            }}
          />
        </div>

        {/* Language selector */}
        <button
          onClick={() => setShowLangSelector(true)}
          className="w-full flex items-center justify-between bg-white border border-[#E2E8F0] rounded-xl px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
            </svg>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#1E293B]">{t('profile.choose')}</p>
              <p className="text-[10px] text-[#64748B]">
                {lang === 'en' ? 'English' : lang === 'te' ? 'తెలుగు' : 'हिंदी'}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#94A3B8]" />
        </button>

        {/* Menu sections */}
        {[
          { title: 'Data', items: [
            { icon: DownloadIcon, label: 'offline' },
            { icon: TrashIcon, label: 'cache' },
            { icon: ExportIcon, label: 'export' },
          ]},
          { title: 'Support', items: [
            { icon: HelpIcon, label: 'help' },
            { icon: FeedbackIcon, label: 'feedback' },
            { icon: StarIcon, label: 'rate' },
          ]},
        ].map((section) => (
          <div key={section.title}>
            <h3 className="text-[10px] font-semibold text-[#94A3B8] tracking-widest mb-2 uppercase px-0.5">{section.title}</h3>
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              {section.items.map((item, i) => (
                <button key={item.label}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#F8FAFC] transition-colors ${i < section.items.length - 1 ? 'border-b border-[#E2E8F0]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className="text-[#64748B]" />
                    <span className="text-sm text-[#1E293B]">{t('profile.' + item.label)}</span>
                  </div>
                  <ChevronRight size={14} className="text-[#94A3B8]" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <p className="text-[10px] text-center text-[#94A3B8] opacity-60">
          KhetMap v1.0.0 · Open Source · Free for everyone
        </p>
      </div>

      {showLangSelector && <LanguageSelector onClose={() => setShowLangSelector(false)} />}
    </div>
  );
}

// SVG icon components
function DownloadIcon({ size, className }: { size: number; className?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>);
}
function TrashIcon({ size, className }: { size: number; className?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
}
function ExportIcon({ size, className }: { size: number; className?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="18" y2="12"/><polyline points="9 15 12 12 15 15"/></svg>);
}
function HelpIcon({ size, className }: { size: number; className?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>);
}
function FeedbackIcon({ size, className }: { size: number; className?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
}
function StarIcon({ size, className }: { size: number; className?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
}
