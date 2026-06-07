import { useState, useEffect } from 'react';
import { X, Droplets, Wind, CloudRain } from 'lucide-react';

const API_KEY = import.meta.env.VITE_OWM_API_KEY || '';

interface ForecastDay {
  date: string;
  dayLabel: string;
  tempHigh: number;
  tempLow: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  rain: number;
}

interface WeatherForecastProps { lat: number; lng: number; onClose: () => void; }

function getDayLabel(dt: number): string {
  const now = new Date();
  const day = new Date(dt * 1000);
  const diff = Math.round((day.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return day.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

function groupByDay(entries: any[]): ForecastDay[] {
  const days: Record<string, any[]> = {};
  entries.forEach((e: any) => {
    const dateKey = new Date(e.dt * 1000).toDateString();
    if (!days[dateKey]) days[dateKey] = [];
    days[dateKey].push(e);
  });
  const today = new Date().toDateString();
  return Object.entries(days).slice(0, 5).map(([dateKey, entries]) => {
    const temps = entries.map((e: any) => e.main.temp);
    const rains = entries.map((e: any) => e.rain?.['3h'] || 0);
    const midday = entries.find((e: any) => { const h = new Date(e.dt * 1000).getHours(); return h >= 11 && h <= 14; }) || entries[Math.floor(entries.length / 2)];
    return {
      date: dateKey,
      dayLabel: dateKey === today ? 'Today' : getDayLabel(entries[0].dt),
      tempHigh: Math.round(Math.max(...temps)),
      tempLow: Math.round(Math.min(...temps)),
      humidity: Math.round(midday.main.humidity),
      windSpeed: Math.round(midday.wind.speed * 3.6),
      description: midday.weather[0].description,
      icon: midday.weather[0].icon,
      rain: Math.round(rains.reduce((a: number, b: number) => a + b, 0)),
    };
  });
}

export default function WeatherForecast({ lat, lng, onClose }: WeatherForecastProps) {
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!API_KEY) { setError('Set VITE_OWM_API_KEY in .env'); setLoading(false); return; }
    const fetchForecast = async () => {
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setForecast(groupByDay(data.list));
      } catch (e: any) { setError(e.message || 'Failed to load'); }
      finally { setLoading(false); }
    };
    fetchForecast();
  }, [lat, lng]);

  const now = forecast[0];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1500] bg-white/98 border-t border-[#E2E8F0] rounded-t-2xl shadow-2xl backdrop-blur-xl max-h-[50vh] overflow-auto animate-slide-up">
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

      <div className="flex justify-between items-center px-4 pt-3 pb-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#FEF3C7] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E293B] m-0">Weather Forecast</h3>
            <p className="text-[10px] text-[#64748B] m-0">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg border border-[#E2E8F0] bg-white text-[#94A3B8] flex items-center justify-center hover:bg-[#F8FAFC]"><X size={14} /></button>
      </div>

      <div className="px-4 pb-4 pt-3">
        {loading ? (
          <div className="flex justify-center py-5"><div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" /></div>
        ) : error ? (
          <div className="text-xs text-[#EF4444] bg-[#FEF2F2] rounded-lg p-3 text-center">{error}</div>
        ) : (
          <>
            {now && (
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3.5 mb-3 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-[#1E293B] m-0">{now.tempHigh}°C</p>
                  <p className="text-[11px] text-[#64748B] capitalize m-0">{now.description}</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center"><Droplets size={16} className="mx-auto mb-0.5 text-[#3B82F6]" /><p className="text-xs font-semibold text-[#1E293B] m-0">{now.humidity}%</p><p className="text-[8px] text-[#64748B] m-0">Humidity</p></div>
                  <div className="text-center"><Wind size={16} className="mx-auto mb-0.5 text-[#22C55E]" /><p className="text-xs font-semibold text-[#1E293B] m-0">{now.windSpeed}</p><p className="text-[8px] text-[#64748B] m-0">km/h</p></div>
                  {now.rain > 0 && (
                    <div className="text-center"><CloudRain size={16} className="mx-auto mb-0.5 text-[#3B82F6]" /><p className="text-xs font-semibold text-[#1E293B] m-0">{now.rain}mm</p><p className="text-[8px] text-[#64748B] m-0">Rain</p></div>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-1.5">
              {forecast.map((day) => (
                <div key={day.date} className="flex-1 bg-[#F8FAFC] rounded-xl px-2 py-2.5 border border-[#E2E8F0] text-center">
                  <p className="text-[9px] font-semibold text-[#64748B] m-0 mb-1">{day.dayLabel}</p>
                  <div className="text-lg mb-1">{day.icon?.includes('d') ? '☀️' : '🌙'}</div>
                  <p className="text-sm font-bold text-[#1E293B] m-0">{day.tempHigh}°</p>
                  <p className="text-[9px] text-[#94A3B8] m-0">{day.tempLow}°</p>
                  {day.rain > 0 && <p className="text-[8px] text-[#3B82F6] mt-1 m-0 flex items-center justify-center gap-1"><CloudRain size={10} />{day.rain}mm</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
