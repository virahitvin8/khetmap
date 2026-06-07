import { useNavigate } from 'react-router';
import { FlaskRoundIcon as Flask } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const analysisTypes = [
  { id: 'ndvi', name: 'Crop Health (NDVI)', icon: '🌿', color: '#66BB6A', desc: 'Crop vigor & health', ready: true },
  { id: 'ndwi', name: 'Water Index (NDWI)', icon: '💧', color: '#42A5F5', desc: 'Water content in fields', ready: true },
  { id: 'savi', name: 'Soil Health (SAVI)', icon: '🪨', color: '#FFA726', desc: 'Soil-adjusted vegetation index', ready: true },
  { id: 'water', name: 'Water Logging', icon: '🌊', color: '#2196F3', desc: 'Sentinel-1 SAR', ready: false },
  { id: 'slope', name: 'Slope Analysis', icon: '⛰️', color: '#FFA726', desc: 'Slope & elevation', ready: false },
  { id: 'dem', name: 'Elevation (DEM)', icon: '🗺️', color: '#8D6E63', desc: 'Digital elevation model', ready: false },
  { id: 'soil', name: 'Soil Type', icon: '🪨', color: '#A1887F', desc: 'Soil classification', ready: false },
  { id: 'lulc', name: 'Land Cover (LULC)', icon: '🌳', color: '#66BB6A', desc: 'Land use classification', ready: false },
  { id: 'weather', name: 'Weather Data', icon: '🌤️', color: '#FFF176', desc: 'Forecast & history', ready: false },
];

const satelliteSources = [
  { name: 'Sentinel-1 (SAR)', provider: 'ESA', type: 'Radar' },
  { name: 'Sentinel-2 (Optical)', provider: 'ESA', type: 'Optical' },
  { name: 'Landsat 8/9', provider: 'NASA/USGS', type: 'Optical' },
  { name: 'Cartosat-1/2', provider: 'ISRO', type: 'Optical' },
  { name: 'MODIS', provider: 'NASA', type: 'Multi-spectral' },
  { name: 'SRTM DEM', provider: 'NASA', type: 'Elevation' },
  { name: 'ALOS DEM', provider: 'JAXA', type: 'Elevation' },
  { name: 'ISRO Bhuvan', provider: 'ISRO', type: 'Indian Data' },
];

export default function Analyze() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleAnalysisClick = (id: string, ready: boolean) => {
    if (ready) {
      navigate('/map?analysis=' + id);
    }
  };

  const readyTypes = analysisTypes.filter(a => a.ready);
  const comingTypes = analysisTypes.filter(a => !a.ready);

  return (
    <div className="h-full flex flex-col bg-[#0A1F0A] overflow-auto">
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-[#E8F5E9]">{t('analysis.title')}</h1>
        <p className="text-sm text-[#6B8E6B] mt-1">
          {t('analysis.subtitle')}
        </p>
      </div>

      <div className="px-5 pb-6 space-y-6">
        {/* Available now */}
        <section>
          <h2 className="text-[10px] font-semibold text-[#52B788] tracking-widest mb-3 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#52B788]" />
            Available Now
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {readyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleAnalysisClick(type.id, type.ready)}
                className="bg-[#132A1A] rounded-xl p-4 border border-[#1B4D2E] text-left hover:border-[#52B788] transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform" style={{ background: type.color + '22' }}>
                  <span className="text-xl">{type.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#E8F5E9]">{type.name}</h3>
                <p className="text-[10px] text-[#6B8E6B] mt-0.5">{type.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Coming soon analyses */}
        <section>
          <h2 className="text-[10px] font-semibold text-[#6B8E6B] tracking-widest mb-3 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6B8E6B]" />
            Coming Soon
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {comingTypes.map((type) => (
              <div
                key={type.id}
                className="bg-[#0D2818] rounded-xl p-4 border border-[#1B4D2E] opacity-60 cursor-not-allowed"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5" style={{ background: type.color + '15' }}>
                  <span className="text-xl">{type.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#E8F5E9]">{type.name}</h3>
                <p className="text-[10px] text-[#6B8E6B] mt-0.5">{type.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Satellite sources */}
        <section>
          <h2 className="text-[10px] font-semibold text-[#6B8E6B] tracking-widest mb-3 uppercase">
            {t('analysis.sources')}
          </h2>
          <div className="space-y-1">
            {satelliteSources.map((src) => (
              <div key={src.name} className="flex items-center gap-3 py-2">
                <div className="w-2 h-2 rounded-full bg-[#52B788]" />
                <div>
                  <p className="text-sm text-[#E8F5E9] font-medium">{src.name}</p>
                  <p className="text-[10px] text-[#6B8E6B]">{src.provider} · {src.type}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coming soon message */}
        <div className="flex items-center gap-3 bg-[#0D2818] border border-dashed border-[#1B4D2E] rounded-xl p-4">
          <Flask size={22} className="text-[#6B8E6B]" />
          <p className="text-xs text-[#6B8E6B] leading-relaxed">
            {t('analysis.coming')}
          </p>
        </div>
      </div>
    </div>
  );
}
