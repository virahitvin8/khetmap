import { useLanguage, SupportedLanguage } from '../../contexts/LanguageContext';
import { X, Check } from 'lucide-react';

const languages: { code: SupportedLanguage; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
];

interface LanguageSelectorProps {
  onClose: () => void;
}

export default function LanguageSelector({ onClose }: LanguageSelectorProps) {
  const { lang, setLang } = useLanguage();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#132A1A',
        borderRadius: 16,
        border: '1px solid #1B4D2E',
        width: '85%',
        maxWidth: 320,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        padding: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#E8F5E9' }}>
            Choose Language
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32,
              borderRadius: 8,
              border: '1px solid #1B4D2E',
              background: '#0D2818',
              color: '#6B8E6B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {languages.map((langOption) => {
            const isActive = lang === langOption.code;
            return (
              <button
                key={langOption.code}
                onClick={() => {
                  setLang(langOption.code);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: `1px solid ${isActive ? '#52B788' : '#1B4D2E'}`,
                  background: isActive ? 'rgba(82,183,136,0.1)' : '#0D2818',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 24 }}>{langOption.flag}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: isActive ? '#52B788' : '#E8F5E9' }}>
                    {langOption.label}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B8E6B' }}>
                    {langOption.native}
                  </p>
                </div>
                {isActive && <Check size={18} color="#52B788" />}
              </button>
            );
          })}
        </div>

        <p style={{
          margin: '16px 0 0',
          fontSize: 10,
          color: '#6B8E6B',
          textAlign: 'center',
        }}>
          తెలుగు · हिंदी · English
        </p>
      </div>
    </div>
  );
}
