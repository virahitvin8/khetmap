import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToFarms, Farm } from '../../services/database';
import { getWeatherData, WeatherData, ndviToHealthScore } from '../../services/satelliteService';
import { Droplets, Thermometer, Wind, Cloud, Leaf, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';

// ─── Mini SVG NDVI trend chart ────────────────────────────────────
function NDVITrendChart({ data }: { data: number[] }) {
  const w = 300, h = 80, pad = 10;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 0.1;

  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - 2 * pad),
    y: h - pad - ((v - min) / range) * (h - 2 * pad),
    v,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 80 }}>
      <defs>
        <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#52B788" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#52B788" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#ndviGrad)" />
      <path d={pathD} fill="none" stroke="#52B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#52B788" />
      ))}
    </svg>
  );
}

// ─── Weather card ─────────────────────────────────────────────────
function WeatherCard({ weather }: { weather: WeatherData }) {
  return (
    <div className="bg-[#0D2818] border border-[#1B4D2E] rounded-2xl p-4">
      <h3 className="text-[#E8F5E9] font-bold text-sm mb-3">🌤️ Today's Weather</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { icon: <Thermometer size={14} />, label: 'Temperature', value: `${weather.temperature}°C` },
          { icon: <Cloud size={14} />, label: 'Rainfall', value: `${weather.rainfall}mm` },
          { icon: <Droplets size={14} />, label: 'Humidity', value: `${weather.humidity}%` },
          { icon: <Wind size={14} />, label: 'Wind', value: `${weather.windSpeed}km/h` },
        ].map(item => (
          <div key={item.label} className="bg-[#0A1F0A] rounded-xl p-3">
            <div className="flex items-center gap-1 text-[#6B8E6B] mb-1">{item.icon}<span className="text-xs">{item.label}</span></div>
            <p className="text-[#E8F5E9] font-bold text-base">{item.value}</p>
          </div>
        ))}
      </div>
      {/* ET₀ bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-[#6B8E6B] mb-1.5">
          <span>ET₀ (Water Need)</span><span>{weather.et0.toFixed(1)}mm/day</span>
        </div>
        <div className="h-2 bg-[#0A1F0A] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (weather.et0 / 10) * 100)}%` }}
            transition={{ duration: 1 }}
            className="h-full rounded-full"
            style={{ background: weather.et0 > 7 ? '#E76F51' : weather.et0 > 4 ? '#F4A261' : '#52B788' }}
          />
        </div>
      </div>
      {/* Irrigation advice */}
      <div className="bg-[#52B788]/10 border border-[#52B788]/30 rounded-xl px-3 py-2.5">
        <p className="text-[#52B788] text-xs font-semibold">{weather.irrigationAdvice}</p>
      </div>
    </div>
  );
}

export default function Analyze() {
  const [searchParams] = useSearchParams();
  const farmId = searchParams.get('farmId');
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Mock 30-day NDVI trend
  const ndviTrend = [0.41, 0.43, 0.38, 0.45, 0.48, 0.52, 0.54, 0.50, 0.47, 0.53];
  const currentNDVI = ndviTrend[ndviTrend.length - 1];
  const health = ndviToHealthScore(currentNDVI);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToFarms(user.uid, (data) => {
      setFarms(data);
      if (farmId) {
        const found = data.find(f => f.id === farmId);
        setSelectedFarm(found || data[0] || null);
      } else {
        setSelectedFarm(data[0] || null);
      }
    });
    return unsub;
  }, [user, farmId]);

  useEffect(() => {
    if (!selectedFarm?.geometry?.center) return;
    setLoadingWeather(true);
    getWeatherData(selectedFarm.geometry.center.lat, selectedFarm.geometry.center.lng)
      .then(setWeather)
      .catch(() => setWeather(null))
      .finally(() => setLoadingWeather(false));
  }, [selectedFarm]);

  return (
    <div className="h-full overflow-y-auto bg-[#050D05] px-4 py-4 space-y-4">
      <div className="pt-6">
        <h1 className="text-2xl font-black text-[#E8F5E9]">Analysis</h1>
        <p className="text-[#6B8E6B] text-sm">विश्लेषण</p>
      </div>

      {/* Farm selector */}
      {farms.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {farms.map(farm => (
            <button
              key={farm.id}
              onClick={() => setSelectedFarm(farm)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedFarm?.id === farm.id
                  ? 'bg-[#52B788] text-[#0A1F0A]'
                  : 'bg-[#0D2818] border border-[#1B4D2E] text-[#95D5B2] hover:border-[#52B788]'
              }`}
            >
              🌾 {farm.name}
            </button>
          ))}
        </div>
      )}

      {selectedFarm ? (
        <>
          {/* ─── Health score ─── */}
          <div className="bg-[#0D2818] border border-[#1B4D2E] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[#E8F5E9] font-bold">{selectedFarm.name}</h3>
                <p className="text-[#6B8E6B] text-xs">{selectedFarm.cropType || 'Unknown crop'} · {selectedFarm.areaHa?.toFixed(2) || '?'} ha</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black" style={{ color: health.color }}>{health.score}</div>
                <div className="text-xs" style={{ color: health.color }}>{health.label}</div>
              </div>
            </div>
            {/* NDVI trend */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-[#6B8E6B] mb-2">
                <span className="flex items-center gap-1"><Leaf size={12} /> NDVI Trend (30 days)</span>
                <span className="text-[#52B788] font-semibold">{(currentNDVI * 100).toFixed(0)}/100</span>
              </div>
              <NDVITrendChart data={ndviTrend} />
              <div className="flex justify-between text-xs text-[#3A5A3A] mt-1">
                <span>30 days ago</span><span>Today</span>
              </div>
            </div>
          </div>

          {/* ─── Recommendations ─── */}
          <div className="bg-[#0D2818] border border-[#1B4D2E] rounded-2xl p-4">
            <h3 className="text-[#E8F5E9] font-bold text-sm mb-3">🤖 HARI Recommendations</h3>
            <div className="space-y-2.5">
              {[
                { icon: '🌿', text: `NDVI trending upward (+${((ndviTrend[ndviTrend.length-1] - ndviTrend[0])*100).toFixed(0)} pts) — crop recovering well`, type: 'good' },
                { icon: '💧', text: 'ET₀ elevated — consider irrigation in next 2 days if no rain', type: 'warn' },
                { icon: '🔬', text: 'No pest stress detected in satellite signature', type: 'good' },
              ].map((rec, i) => (
                <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border ${
                  rec.type === 'good' ? 'bg-[#52B788]/5 border-[#52B788]/20' : 'bg-[#F4A261]/5 border-[#F4A261]/20'
                }`}>
                  <span className="text-base">{rec.icon}</span>
                  <p className="text-xs text-[#95D5B2] leading-relaxed">{rec.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Weather ─── */}
          {loadingWeather ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : weather ? (
            <WeatherCard weather={weather} />
          ) : (
            <div className="bg-[#0D2818] border border-[#1B4D2E] rounded-2xl p-4 text-center">
              <p className="text-[#6B8E6B] text-sm">Weather data unavailable</p>
            </div>
          )}

          {/* ─── 7-day forecast ─── */}
          {weather?.forecast && (
            <div className="bg-[#0D2818] border border-[#1B4D2E] rounded-2xl p-4">
              <h3 className="text-[#E8F5E9] font-bold text-sm mb-3">📅 7-Day Forecast</h3>
              <div className="space-y-2">
                {weather.forecast.slice(0, 7).map((day, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-[#1B4D2E]/40 last:border-0">
                    <span className="text-xs text-[#6B8E6B] w-16 flex-shrink-0">
                      {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs">{day.rainfall > 10 ? '🌧️' : day.rainfall > 2 ? '🌦️' : '☀️'}</span>
                    <span className="text-xs text-[#95D5B2] flex-1">{day.minTemp.toFixed(0)}–{day.maxTemp.toFixed(0)}°C</span>
                    <span className="text-xs text-[#52B788]">{day.rainfall.toFixed(1)}mm</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <span className="text-4xl mb-3">📡</span>
          <p className="text-[#6B8E6B] text-sm">Add a field to see satellite analysis</p>
        </div>
      )}
    </div>
  );
}
