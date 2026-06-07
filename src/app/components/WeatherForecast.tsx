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

interface WeatherForecastProps {
  lat: number;
  lng: number;
  onClose: () => void;
}

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
  const todayEntries = days[today] || [];
  const now = new Date();
  
  return Object.entries(days)
    .slice(0, 5)
    .map(([dateKey, entries]) => {
      const temps = entries.map((e: any) => e.main.temp);
      const rains = entries.map((e: any) => e.rain?.['3h'] || 0);
      const midday = entries.find((e: any) => {
        const hour = new Date(e.dt * 1000).getHours();
        return hour >= 11 && hour <= 14;
      }) || entries[Math.floor(entries.length / 2)];

      return {
        date: dateKey,
        dayLabel: dateKey === today ? 'Today' : getDayLabel(entries[0].dt),
        tempHigh: Math.round(Math.max(...temps)),
        tempLow: Math.round(Math.min(...temps)),
        humidity: Math.round(midday.main.humidity),
        windSpeed: Math.round(midday.wind.speed * 3.6), // m/s to km/h
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
    if (!API_KEY) {
      setError('Set VITE_OWM_API_KEY in .env for weather forecast');
      setLoading(false);
      return;
    }

    const fetchForecast = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
        );
        if (!res.ok) throw new Error('Failed to fetch forecast');
        const data = await res.json();
        const grouped = groupByDay(data.list);
        setForecast(grouped);
      } catch (e: any) {
        setError(e.message || 'Failed to load forecast');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [lat, lng]);

  const now = forecast[0];

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1500,
      background: 'rgba(13, 40, 24, 0.97)',
      borderTop: '1px solid #1B4D2E',
      borderRadius: '16px 16px 0 0',
      backdropFilter: 'blur(12px)',
      maxHeight: '50vh',
      overflow: 'auto',
      animation: 'slideUp 0.3s ease-out',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* Handle bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255, 200, 50, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sun size={16} color="#FFD54F" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#E8F5E9' }}>
              Weather Forecast
            </h3>
            <p style={{ margin: 0, fontSize: 10, color: '#6B8E6B' }}>
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 28, height: 28,
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
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: '12px 16px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
            <div style={{ width: 20, height: 20, border: '2px solid #52B788', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : error ? (
          <div style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#EF5350', background: 'rgba(239,83,80,0.1)', borderRadius: 8 }}>
            {error}
          </div>
        ) : (
          <>
            {/* Today's summary */}
            {now && (
              <div style={{
                background: 'rgba(82,183,136,0.08)',
                border: '1px solid rgba(82,183,136,0.2)',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#E8F5E9' }}>
                    {now.tempHigh}°C
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: '#A5D6A7', textTransform: 'capitalize' }}>
                    {now.description}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <Droplets size={16} color="#42A5F5" style={{ margin: '0 auto 2px' }} />
                    <p style={{ margin: 0, fontSize: 11, color: '#E8F5E9' }}>{now.humidity}%</p>
                    <p style={{ margin: 0, fontSize: 8, color: '#6B8E6B' }}>Humidity</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Wind size={16} color="#66BB6A" style={{ margin: '0 auto 2px' }} />
                    <p style={{ margin: 0, fontSize: 11, color: '#E8F5E9' }}>{now.windSpeed}</p>
                    <p style={{ margin: 0, fontSize: 8, color: '#6B8E6B' }}>km/h</p>
                  </div>
                  {now.rain > 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <CloudRain size={16} color="#42A5F5" style={{ margin: '0 auto 2px' }} />
                      <p style={{ margin: 0, fontSize: 11, color: '#E8F5E9' }}>{now.rain}mm</p>
                      <p style={{ margin: 0, fontSize: 8, color: '#6B8E6B' }}>Rain</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5-day forecast */}
            <div style={{ display: 'flex', gap: 6 }}>
              {forecast.map((day) => (
                <div
                  key={day.date}
                  style={{
                    flex: 1,
                    background: '#0D2818',
                    borderRadius: 10,
                    border: '1px solid #1B4D2E',
                    padding: '8px 4px',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ margin: '0 0 4px', fontSize: 9, color: '#6B8E6B', fontWeight: 600 }}>
                    {day.dayLabel}
                  </p>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>
                    {day.icon?.includes('d') ? '☀️' : '🌙'}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#E8F5E9' }}>
                    {day.tempHigh}°
                  </p>
                  <p style={{ margin: 0, fontSize: 9, color: '#6B8E6B' }}>
                    {day.tempLow}°
                  </p>
                  {day.rain > 0 && (
                    <p style={{ margin: '4px 0 0', fontSize: 8, color: '#42A5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <CloudRain size={10} />
                      {day.rain}mm
                    </p>
                  )}
                </div>
              ))}
            </div>

            {!API_KEY && (
              <p style={{ margin: '12px 0 0', fontSize: 10, color: '#6B8E6B', textAlign: 'center' }}>
                Get a free API key at <span style={{ color: '#52B788' }}>openweathermap.org</span> and add it to .env
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
