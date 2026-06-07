import { useNavigate } from 'react-router';
import { FlaskRoundIcon as Flask } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const analysisTypes = [
  { id: 'ndvi', name: 'Crop Health (NDVI)', icon: '🌿', color: '#22C55E', desc: 'Crop vigor & health', ready: true },
  { id: 'ndwi', name: 'Water Index (NDWI)', icon: '💧', color: '#3B82F6', desc: 'Water content in fields', ready: true },
  { id: 'savi', name: 'Soil Health (SAVI)', icon: '🪨', color: '#F59E0B', desc: 'Soil-adjusted vegetation index', ready: true },
  { id: 'water', name: 'Water Logging', icon: '🌊', color: '#2196F3', desc: 'Sentinel-1 SAR', ready: false },
  { id: 'slope', name: 'Slope Analysis', icon: '⛰️', color: '#FFA726', desc: 'Slope & elevation', ready: false },
  { id: 'dem', name: 'Elevation (DEM)', icon: '🗺️', color: '#8D6E63', desc: 'Digital elevation model', ready: false },
  { id: 'soil', name: 'Soil Type', icon: '🪨', color: '#A1887F', desc: 'Soil classification', ready: false },
  { id: 'lulc', name: 'Land Cover (LULC)', icon: '🌳', color: '#22C55E', desc: 'Land use classification', ready: false },
  { id: 'weather', name: 'Weather Data', icon: '🌤️', color: '#EAB308', desc: 'Forecast & history', ready: false },
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
    if (ready) navigate('/map?analysis=' + id);
  };

  const readyTypes = analysisTypes.filter(a => a.ready);
  const comingTypes = analysisTypes.filter(a => !a.ready);

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] overflow-auto">
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-[#1E293B]">{t('analysis.title')}</h1>
        <p className="text-sm text-[#64748B] mt-1">{t('analysis.subtitle')}</p>
      </div>

      <div className="px-5 pb-6 space-y-6">
        {/* Available now */}
        <section>
          <h2 className="text-[10px] font-semibold text-[#2563EB] tracking-widest mb-3 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            Available Now
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {readyTypes.map((type) => (
              <button key={type.id} onClick={() => handleAnalysisClick(type.id, type.ready)}
                className="bg-white rounded-xl p-4 border border-[#E2E8F0] text-left hover:border-[#93C5FD] hover:shadow-md transition-all group shadow-sm">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform"
                  style={{ background: type.color + '18' }}>
                  <span className="text-xl">{type.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#1E293B]">{type.name}</h3>
                <p className="text-[10px] text-[#64748B] mt-0.5">{type.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Coming soon */}
        <section>
          <h2 className="text-[10px] font-semibold text-[#94A3B8] tracking-widest mb-3 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
            Coming Soon
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {comingTypes.map((type) => (
              <div key={type.id}
                className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] opacity-50 cursor-not-allowed">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5"
                  style={{ background: type.color + '12' }}>
                  <span className="text-xl">{type.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#1E293B]">{type.name}</h3>
                <p className="text-[10px] text-[#64748B] mt-0.5">{type.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Satellite sources */}
        <section>
          <h2 className="text-[10px] font-semibold text-[#94A3B8] tracking-widest mb-3 uppercase">Satellite Sources</h2>
          <div className="space-y-1">
            {satelliteSources.map((src) => (
              <div key={src.name} className="flex items-center gap-3 py-2">
                <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <div>
                  <p className="text-sm text-[#1E293B] font-medium">{src.name}</p>
                  <p className="text-[10px] text-[#64748B]">{src.provider} · {src.type}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coming soon message */}
        <div className="flex items-center gap-3 bg-white border border-dashed border-[#E2E8F0] rounded-xl p-4">
          <Flask size={22} className="text-[#94A3B8]" />
          <p className="text-xs text-[#64748B] leading-relaxed">{t('analysis.coming')}</p>
        </div>
      </div>
    </div>
  );
}
