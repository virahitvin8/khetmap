import { useLanguage, SupportedLanguage } from '../../contexts/LanguageContext';
import { X, Check } from 'lucide-react';

const languages: { code: SupportedLanguage; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
];

interface LanguageSelectorProps { onClose: () => void; }

export default function LanguageSelector({ onClose }: LanguageSelectorProps) {
  const { lang, setLang } = useLanguage();

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] w-[85%] max-w-[320px] shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#1E293B] m-0">Choose Language</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#94A3B8] flex items-center justify-center hover:bg-[#F8FAFC]"><X size={16} /></button>
        </div>

        <div className="flex flex-col gap-1.5">
          {languages.map((langOption) => {
            const isActive = lang === langOption.code;
            return (
              <button key={langOption.code} onClick={() => { setLang(langOption.code); onClose(); }}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl border transition-all w-full text-left ${
                  isActive
                    ? 'bg-[#EFF6FF] border-[#2563EB]'
                    : 'bg-white border-[#E2E8F0] hover:border-[#93C5FD]'
                }`}>
                <span className="text-2xl">{langOption.flag}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold m-0 ${isActive ? 'text-[#2563EB]' : 'text-[#1E293B]'}`}>{langOption.label}</p>
                  <p className="text-xs text-[#64748B] m-1">{langOption.native}</p>
                </div>
                {isActive && <Check size={18} className="text-[#2563EB]" />}
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-[#94A3B8] text-center mt-4">తెలుగు · हिंदी · English</p>
      </div>
    </div>
  );
}
