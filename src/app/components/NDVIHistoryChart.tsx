import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NDVIHistoryChartProps {
  fieldName: string;
  fieldId?: string;
}

// Deterministic "seeded" pseudo-random based on field name
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function generateHistory(seed: string): { date: string; ndvi: number }[] {
  const rng = seededRandom(seed);
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    // Consistent base NDVI with seasonal variation
    const base = 0.45 + 0.2 * Math.sin(i * 0.3);
    const noise = (rng() - 0.5) * 0.15;
    const ndvi = Math.max(0, Math.min(1, base + noise));
    data.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      ndvi: Math.round(ndvi * 100) / 100,
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#132A1A',
        border: '1px solid #1B4D2E',
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}>
        <p style={{ margin: 0, fontSize: 11, color: '#6B8E6B' }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 700, color: '#52B788' }}>
          NDVI: {payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function NDVIHistoryChart({ fieldName, fieldId = '' }: NDVIHistoryChartProps) {
  const data = useMemo(() => generateHistory(fieldId || fieldName), [fieldId, fieldName]);

  const avgNDVI = useMemo(() =>
    (data.reduce((s, d) => s + d.ndvi, 0) / data.length).toFixed(2),
  [data]);

  return (
    <div style={{
      background: '#0D2818',
      borderRadius: 12,
      border: '1px solid #1B4D2E',
      padding: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#E8F5E9' }}>
          NDVI History — {fieldName}
        </h3>
        <span style={{
          fontSize: 10,
          color: '#52B788',
          background: 'rgba(82,183,136,0.1)',
          padding: '2px 8px',
          borderRadius: 4,
        }}>
          Avg: {avgNDVI}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1B4D2E" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6B8E6B', fontSize: 9 }}
            axisLine={{ stroke: '#1B4D2E' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fill: '#6B8E6B', fontSize: 9 }}
            axisLine={{ stroke: '#1B4D2E' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="ndvi"
            stroke="#52B788"
            strokeWidth={2}
            dot={{ fill: '#52B788', r: 3 }}
            activeDot={{ r: 5, fill: '#52B788' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 9, color: '#6B8E6B' }}>Last 7 months</span>
        <span style={{ fontSize: 9, color: '#6B8E6B' }}>
          Min: {(Math.min(...data.map(d => d.ndvi))).toFixed(2)} · Max: {(Math.max(...data.map(d => d.ndvi))).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
