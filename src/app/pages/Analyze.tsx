import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  FlaskRoundIcon as Flask, Satellite, Droplets, ThermometerSun,
  Leaf, Globe, CloudRain, Sun, Tractor, Activity, TrendingUp,
  Wheat, Sprout, MapPin, Shield,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { isSentinelAvailable } from '../../services/fieldAnalysis';

interface SatelliteSource {
  id: string;
  name: string;
  icon: string;
  provider: string;
  type: string;
  resolution: string;
  revisit: string;
  status: 'live' | 'configure' | 'coming';
  capabilities: string[];
  color: string;
  statusText: string;
}

const satelliteSources: SatelliteSource[] = [
  {
    id: 'sentinel2',
    name: 'Sentinel-2 (Optical)',
    icon: '🛰️',
    provider: 'ESA Copernicus',
    type: 'Multi-spectral',
    resolution: '10m',
    revisit: '~5 days',
    status: isSentinelAvailable() ? 'live' : 'configure',
    capabilities: ['NDVI', 'NDWI', 'EVI', 'SAVI', 'REIP', 'True Color'],
    color: '#22C55E',
    statusText: isSentinelAvailable() ? 'Connected' : 'Setup required',
  },
  {
    id: 'sentinel1',
    name: 'Sentinel-1 (SAR)',
    icon: '📡',
    provider: 'ESA Copernicus',
    type: 'Radar (C-band)',
    resolution: '10m',
    revisit: '6-12 days',
    status: isSentinelAvailable() ? 'live' : 'configure',
    capabilities: ['Soil Moisture', 'Flood Detection', 'Rice Mapping', 'Cloud-penetrating'],
    color: '#3B82F6',
    statusText: isSentinelAvailable() ? 'Connected' : 'Setup required',
  },
  {
    id: 'landsat',
    name: 'Landsat 8/9',
    icon: '🌍',
    provider: 'NASA/USGS',
    type: 'Optical + Thermal',
    resolution: '30m / 100m thermal',
    revisit: '16 days',
    status: 'live',
    capabilities: ['CWSI', 'NDVI', 'Thermal', 'Evapotranspiration', 'Long-term Trends'],
    color: '#8B5CF6',
    statusText: 'Always available',
  },
  {
    id: 'modis',
    name: 'MODIS Terra/Aqua',
    icon: '🛸',
    provider: 'NASA',
    type: 'Multi-spectral',
    resolution: '250-500m',
    revisit: 'Daily',
    status: 'live',
    capabilities: ['NDVI', 'NDWI', 'Land Surface Temp', 'Drought Alerts', 'Regional Benchmarks'],
    color: '#F59E0B',
    statusText: 'Always available',
  },
  {
    id: 'viirs',
    name: 'VIIRS',
    icon: '🌙',
    provider: 'NASA/NOAA',
    type: 'Visible + Thermal',
    resolution: '375-500m',
    revisit: 'Daily',
    status: 'live',
    capabilities: ['NDVI', 'Night Monitoring', 'Fire Detection', 'Thermal Anomalies'],
    color: '#EC4899',
    statusText: 'Always available',
  },
  {
    id: 'openmeteo',
    name: 'Open-Meteo',
    icon: '🌤️',
    provider: 'Open-Meteo',
    type: 'Weather',
    resolution: '~11km',
    revisit: 'Hourly',
    status: 'live',
    capabilities: ['Rainfall', 'ET₀', 'Temperature', 'Humidity', 'Wind', 'Soil Moisture'],
    color: '#0EA5E9',
    statusText: 'Always available',
  },
  {
    id: 'nasa_power',
    name: 'NASA POWER',
    icon: '☀️',
    provider: 'NASA',
    type: 'Agro-climate',
    resolution: '~50km',
    revisit: 'Daily',
    status: 'live',
    capabilities: ['Solar Radiation', 'Dew Point', 'Wind Speed', 'Climate Normals'],
    color: '#EAB308',
    statusText: 'Always available',
  },
  {
    id: 'dem',
    name: 'SRTM/ASTER DEM',
    icon: '⛰️',
    provider: 'NASA/METI',
    type: 'Elevation',
    resolution: '30m',
    revisit: 'One-time',
    status: 'coming',
    capabilities: ['Elevation', 'Slope', 'Aspect', 'Drainage Direction'],
    color: '#A16207',
    statusText: 'Coming soon',
  },
  {
    id: 'smap',
    name: 'SMAP',
    icon: '💧',
    provider: 'NASA',
    type: 'Soil Moisture',
    resolution: '9km / 36km',
    revisit: '2-3 days',
    status: 'coming',
    capabilities: ['Soil Moisture', 'Freeze/Thaw', 'Root Zone Moisture'],
    color: '#06B6D4',
    statusText: 'Coming soon',
  },
  {
    id: 'alos',
    name: 'ALOS PALSAR (DEM)',
    icon: '🗺️',
    provider: 'JAXA',
    type: 'SAR + DEM',
    resolution: '12.5m',
    revisit: '14 days',
    status: 'coming',
    capabilities: ['High-res DEM', 'Slope Analysis', 'Forest Mapping'],
    color: '#D97706',
    statusText: 'Coming soon',
  },
  {
    id: 'isro',
    name: 'ISRO Bhuvan',
    icon: '🇮🇳',
    provider: 'ISRO',
    type: 'Indian Data',
    resolution: '5m+',
    revisit: 'Varies',
    status: 'coming',
    capabilities: ['Indian Region Data', 'High-res Optical', 'Resourcesat', 'Cartosat'],
    color: '#FF9933',
    statusText: 'Coming soon',
  },
  {
    id: 'planet',
    name: 'Planet (Future)',
    icon: '🪐',
    provider: 'Planet Labs',
    type: 'Daily Optical',
    resolution: '3-5m',
    revisit: 'Daily',
    status: 'coming',
    capabilities: ['Daily Imagery', 'Ultra-high Res', 'Change Detection'],
    color: '#6366F1',
    statusText: 'Paid — future',
  },
];

const analysisCapabilities = [
  { id: 'ndvi', name: 'Crop Health (NDVI)', icon: '🌿', color: '#22C55E', desc: 'Crop vigor & health from Sentinel-2, Landsat, MODIS', sources: 3 },
  { id: 'ndwi', name: 'Water Index (NDWI)', icon: '💧', color: '#3B82F6', desc: 'Water content in fields — Sentinel-2, Landsat, MODIS', sources: 3 },
  { id: 'savi', name: 'Soil Health (SAVI)', icon: '🪨', color: '#F59E0B', desc: 'Soil-adjusted vegetation — Sentinel-2 high-res', sources: 1 },
  { id: 'evi', name: 'Enhanced VI (EVI)', icon: '🌿', color: '#22C55E', desc: 'Atmospherically corrected NDVI — Sentinel-2', sources: 1 },
  { id: 'reip', name: 'Red Edge (REIP)', icon: '🔬', color: '#A855F7', desc: 'Chlorophyll content — Nitrogen stress detection', sources: 1 },
  { id: 'cwsi', name: 'Water Stress (CWSI)', icon: '🌡️', color: '#EF4444', desc: 'Crop Water Stress Index — Landsat thermal', sources: 1 },
  { id: 'sar_moisture', name: 'Soil Moisture (SAR)', icon: '💦', color: '#3B82F6', desc: 'Surface moisture through clouds — Sentinel-1', sources: 1 },
  { id: 'flood_detect', name: 'Flood Detection', icon: '🌊', color: '#2196F3', desc: 'Water extent mapping — Sentinel-1 SAR', sources: 1 },
  { id: 'lst', name: 'Land Surface Temp', icon: '🌡️', color: '#F97316', desc: 'Surface temperature — Landsat, MODIS', sources: 2 },
  { id: 'et0', name: 'Evapotranspiration', icon: '💧', color: '#0EA5E9', desc: 'Water loss to atmosphere — Open-Meteo + Landsat', sources: 2 },
  { id: 'benchmark', name: 'Regional Benchmark', icon: '📊', color: '#8B5CF6', desc: 'Compare vs district average — MODIS daily', sources: 1 },
  { id: 'irrigation', name: 'Irrigation Advisory', icon: '🚜', color: '#2563EB', desc: 'Smart irrigation from ALL sources combined', sources: 6 },
  { id: 'weather', name: 'Weather Analytics', icon: '🌤️', color: '#EAB308', desc: 'Rain, ET₀, temp — Open-Meteo hourly', sources: 1 },
  { id: 'climate', name: 'Climate Normals', icon: '☀️', color: '#F59E0B', desc: 'Solar rad, dew point — NASA POWER 40yr data', sources: 1 },
];

export default function Analyze() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filterSource, setFilterSource] = useState<string | null>(null);

  const handleAnalysisClick = (id: string) => {
    navigate('/map?analysis=' + id);
  };

  const liveCount = satelliteSources.filter(s => s.status === 'live').length;
  const configureCount = satelliteSources.filter(s => s.status === 'configure').length;
  const configured = isSentinelAvailable();

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] overflow-auto">
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-[#1E293B]">{t('analysis.title')}</h1>
        <p className="text-sm text-[#64748B] mt-1">{t('analysis.subtitle')}</p>
      </div>

      <div className="px-5 pb-6 space-y-5">
        {/* Overall status banner */}
        <div className="bg-gradient-to-r from-[#EFF6FF] to-[#F8FAFC] rounded-xl p-3 border border-[#BFDBFE] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
            <Satellite size={18} className="text-[#2563EB]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#1E293B]">
              🟢 {liveCount} sources live · {configureCount} need setup · 3 coming soon
            </p>
            <p className="text-[10px] text-[#64748B] mt-0.5">
              {configured
                ? '✅ Sentinel Hub configured — 10m high-res available'
                : '⚙️ Set VITE_SENTINEL_INSTANCE_ID for 10m Sentinel-2 & SAR'}
            </p>
          </div>
        </div>

        {/* Satellite constellation grid */}
        <section>
          <h2 className="text-[10px] font-semibold text-[#64748B] tracking-widest mb-2.5 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            Satellite Constellation
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {satelliteSources.map((src) => (
              <div key={src.id}
                className={`bg-white rounded-xl p-3 border transition-all ${
                  src.status === 'live' ? 'border-[#E2E8F0] hover:border-[#93C5FD]' : 'border-dashed border-[#E2E8F0] opacity-70'
                }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{src.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-[#1E293B]">{src.name}</p>
                      <p className="text-[9px] text-[#64748B]">{src.provider} · {src.type}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${
                    src.status === 'live' ? 'bg-[#F0FDF4] text-[#166534]' :
                    src.status === 'configure' ? 'bg-[#FEFCE8] text-[#92400E]' :
                    'bg-[#F1F5F9] text-[#94A3B8]'
                  }`}>
                    {src.statusText}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {src.capabilities.map(cap => (
                    <span key={cap} className="text-[8px] bg-[#F8FAFC] border border-[#E2E8F0] rounded px-1.5 py-0.5 text-[#64748B]">
                      {cap}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#F1F5F9]">
                  <span className="text-[8px] text-[#94A3B8]">
                    {src.resolution} · {src.revisit}
                  </span>
                  {src.status === 'configure' && (
                    <a href="https://dataspace.copernicus.eu/" target="_blank" rel="noopener noreferrer"
                      className="text-[8px] text-[#2563EB] font-semibold hover:underline">
                      Get API Key →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All analysis capabilities — LIVE */}
        <section>
          <h2 className="text-[10px] font-semibold text-[#64748B] tracking-widest mb-2.5 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            All Analysis Types
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {analysisCapabilities.map((type) => (
              <button key={type.id} onClick={() => handleAnalysisClick(type.id)}
                className="bg-white rounded-xl p-3 border border-[#E2E8F0] text-left hover:border-[#93C5FD] hover:shadow-md transition-all group shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ background: type.color + '15' }}>
                    <span className="text-base">{type.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-[#1E293B] truncate">{type.name}</h3>
                    <p className="text-[9px] text-[#64748B] truncate">{type.desc}</p>
                  </div>
                </div>
                <p className="text-[8px] text-[#94A3B8]">
                  {type.sources} satellite source{type.sources > 1 ? 's' : ''}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Feature comparison card */}
        <section>
          <h2 className="text-[10px] font-semibold text-[#94A3B8] tracking-widest mb-2.5 uppercase">
            🎯 Cross-Source Comparison
          </h2>
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="overflow-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="px-3 py-2 text-left font-semibold text-[#64748B]">Feature</th>
                    <th className="px-3 py-2 text-center font-semibold text-[#64748B]">S2</th>
                    <th className="px-3 py-2 text-center font-semibold text-[#64748B]">S1 SAR</th>
                    <th className="px-3 py-2 text-center font-semibold text-[#64748B]">L8/9</th>
                    <th className="px-3 py-2 text-center font-semibold text-[#64748B]">MODIS</th>
                    <th className="px-3 py-2 text-center font-semibold text-[#64748B]">VIIRS</th>
                    <th className="px-3 py-2 text-center font-semibold text-[#64748B]">O-Meteo</th>
                    <th className="px-3 py-2 text-center font-semibold text-[#64748B]">POWER</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Crop Health', s2: '✅', s1: '—', ls: '✅', mo: '✅', vi: '✅', om: '—', np: '—' },
                    { name: 'Water Index', s2: '✅', s1: '—', ls: '✅', mo: '✅', vi: '—', om: '—', np: '—' },
                    { name: 'Soil Moisture', s2: '—', s1: '✅', ls: '—', mo: '—', vi: '—', om: '✅', np: '—' },
                    { name: 'Thermal/CWSI', s2: '—', s1: '—', ls: '✅', mo: '✅', vi: '✅', om: '—', np: '—' },
                    { name: 'ET₀ / Rain', s2: '—', s1: '—', ls: '—', mo: '—', vi: '—', om: '✅', np: '✅' },
                    { name: 'Irrigation Advice', s2: '✅', s1: '✅', ls: '✅', mo: '✅', vi: '—', om: '✅', np: '✅' },
                    { name: 'Regional Bench', s2: '—', s1: '—', ls: '—', mo: '✅', vi: '—', om: '—', np: '—' },
                    { name: 'Flood Detection', s2: '—', s1: '✅', ls: '—', mo: '—', vi: '—', om: '—', np: '—' },
                    { name: 'Chlorophyll/REIP', s2: '✅', s1: '—', ls: '—', mo: '—', vi: '—', om: '—', np: '—' },
                    { name: 'Solar Radiation', s2: '—', s1: '—', ls: '—', mo: '—', vi: '—', om: '—', np: '✅' },
                  ].map((row, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]/50'} border-b border-[#F1F5F9]`}>
                      <td className="px-3 py-1.5 font-medium text-[#1E293B]">{row.name}</td>
                      <td className="px-3 py-1.5 text-center">{row.s2}</td>
                      <td className="px-3 py-1.5 text-center">{row.s1}</td>
                      <td className="px-3 py-1.5 text-center">{row.ls}</td>
                      <td className="px-3 py-1.5 text-center">{row.mo}</td>
                      <td className="px-3 py-1.5 text-center">{row.vi}</td>
                      <td className="px-3 py-1.5 text-center">{row.om}</td>
                      <td className="px-3 py-1.5 text-center">{row.np}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 bg-[#FFF7ED] border-t border-[#FDE68A] text-[8px] text-[#92400E] flex items-center gap-1.5">
              <Flask size={12} />
              Deep Analysis on any saved field combines ALL live sources automatically
            </div>
          </div>
        </section>

        {/* Quick start */}
        <div className="flex items-start gap-3 bg-gradient-to-br from-[#EFF6FF] to-white rounded-xl p-4 border border-[#BFDBFE]">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center shrink-0">
            <Tractor size={20} className="text-[#2563EB]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1E293B] mb-1">Ready for multi-satellite analysis?</p>
            <p className="text-xs text-[#475569] leading-relaxed mb-2">
              Go to any saved field → tap "Multi-Satellite Analysis" to see data from all {liveCount} live sources combined.
              Each source contributes unique insights — Sentinel-2 for crop health, Sentinel-1 for soil moisture,
              Landsat for thermal stress, MODIS for regional benchmarks.
            </p>
            <div className="flex gap-2">
              <button onClick={() => navigate('/farms')}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition-colors">
                Go to Fields
              </button>
              <button onClick={() => navigate('/map')}
                className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#475569] rounded-lg text-xs font-medium hover:bg-[#F8FAFC] transition-colors">
                Open Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
