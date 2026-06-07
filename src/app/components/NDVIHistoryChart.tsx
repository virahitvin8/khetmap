import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NDVIHistoryChartProps {
  fieldName: string;
  fieldId?: string;
}

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return () => { hash = (hash * 1103515245 + 12345) & 0x7fffffff; return hash / 0x7fffffff; };
}

function generateHistory(seed: string): { date: string; ndvi: number }[] {
  const rng = seededRandom(seed);
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
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
      <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-[11px] text-[#64748B] m-0">{label}</p>
        <p className="text-sm font-bold text-[#2563EB] m-1">NDVI: {payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function NDVIHistoryChart({ fieldName, fieldId = '' }: NDVIHistoryChartProps) {
  const data = useMemo(() => generateHistory(fieldId || fieldName), [fieldId, fieldName]);
  const avgNDVI = useMemo(() => (data.reduce((s, d) => s + d.ndvi, 0) / data.length).toFixed(2), [data]);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-[#1E293B] m-0">NDVI History — {fieldName}</h3>
        <span className="text-[10px] font-medium text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">Avg: {avgNDVI}</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 9 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, 1]} tick={{ fill: '#94A3B8', fontSize: 9 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="ndvi" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 3 }} activeDot={{ r: 5, fill: '#2563EB' }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-between mt-2">
        <span className="text-[9px] text-[#94A3B8]">Last 7 months</span>
        <span className="text-[9px] text-[#94A3B8]">Min: {Math.min(...data.map(d => d.ndvi)).toFixed(2)} · Max: {Math.max(...data.map(d => d.ndvi)).toFixed(2)}</span>
      </div>
    </div>
  );
}
