import { useNavigate } from 'react-router';
import { useLanguage } from '../../contexts/LanguageContext';
import AnimatedLogo from '../components/AnimatedLogo';

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="h-full flex flex-col bg-[#0A1F0A]">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatedLogo size={280} className="mb-8" />

        <h1 className="text-3xl font-bold text-[#52B788] mb-2">
          {t('welcome.title')}
        </h1>
        <p className="text-lg text-[#52B788] italic mb-6">
          {t('welcome.tagline')}
        </p>

        {/* App Purpose - clear explanation */}
        <div className="bg-[#0D2818] rounded-xl px-6 py-5 mb-6 border border-[#1B4D2E] max-w-sm">
          <p className="text-[#A5D6A7] text-sm leading-relaxed mb-3">
            <strong className="text-[#52B788]">{t('welcome.title')}</strong>{' '}
            {t('welcome.purpose')}
          </p>
          <div className="space-y-2 text-sm text-[#A5D6A7]">
            <div className="flex items-start gap-2">
              <span className="text-[#52B788] mt-0.5">🌿</span>
              <span>{t('welcome.feature.crophealth')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#52B788] mt-0.5">💧</span>
              <span>{t('welcome.feature.water')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#52B788] mt-0.5">🪨</span>
              <span>{t('welcome.feature.soil')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#52B788] mt-0.5">🗺️</span>
              <span>{t('welcome.feature.draw')}</span>
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {t('welcome.feature.pills').split('·').map((feat: string) => (
            <span key={feat} className="px-3 py-1.5 bg-[#0D2818] border border-[#1B4D2E] rounded-full text-xs text-[#52B788]">
              {feat.trim()}
            </span>
          ))}
        </div>

        {/* Get Started button */}
        <button
          onClick={() => navigate('/map')}
          className="w-full max-w-sm flex items-center justify-center gap-3 bg-[#52B788] text-[#0A1F0A] rounded-xl py-4 font-bold text-lg hover:bg-[#40916C] transition-colors shadow-lg shadow-[#52B788]/20"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          {t('welcome.getstarted')}
        </button>

        <p className="mt-6 text-xs text-[#6B8E6B] text-center max-w-xs">
          {t('welcome.free')}<br />
          {t('welcome.offline')}
        </p>
      </div>
    </div>
  );
}
