/**
 * Multi-Satellite Dashboard Component
 *
 * Shows analysis results from all satellite sources side by side
 * with per-source breakdowns, health scores, and smart recommendations.
 */

import { useState, useEffect } from 'react';
import {
  X, Activity, Droplets, Leaf, Globe, Download,
  RefreshCw, TrendingUp, AlertTriangle, CloudRain,
} from 'lucide-react';
import { runMultiSatelliteAnalysis, MultiSatelliteAnalysis, SatelliteResult } from '../../services/multiSatelliteAnalysis';
import { toast } from 'sonner';

interface Vertex { lat: number; lng: number; }

interface Props {
  fieldName: string;
  vertices: Vertex[];
  areaHa: number;
  onClose: () => void;
}

const SCORE_COLORS: Record<string, string> = {
  excellent: '#22C55E',
  good: '#3B82F6',
  moderate: '#F59E0B',
  poor: '#EF4444',
  critical: '#7F1D1D',
  no_data: '#94A3B8',
};

const SAT_ICONS: Record<string, string> = {
  sentinel2: '🛰️',
  sentinel1_sar: '📡',
  landsat: '🌍',
  modis: '🛸',
  viirs: '🌙',
  openmeteo: '🌤️',
  nasa_power: '☀️',
};

export default function MultiSatelliteDashboard({ fieldName, vertices, areaHa, onClose }: Props) {
  const [analysis, setAnalysis] = useState<MultiSatelliteAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSat, setExpandedSat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'satellites' | 'irrigation' | 'benchmark'>('overview');

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await runMultiSatelliteAnalysis(fieldName, vertices, areaHa);
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return '#94A3B8';
    if (score >= 70) return '#22C55E';
    if (score >= 50) return '#3B82F6';
    if (score >= 30) return '#F59E0B';
    if (score >= 15) return '#EF4444';
    return '#7F1D1D';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      excellent: '🌟 Excellent',
      good: '✅ Good',
      moderate: '🟡 Moderate',
      poor: '🔴 Poor',
      critical: '⛔ Critical',
      no_data: '❓ No Data',
    };
    return map[status] || status;
  };

  const formatArea = (ha: number) => {
    if (ha < 0.001) return `${(ha * 10000).toFixed(1)} m²`;
    if (ha < 1) return `${(ha * 100).toFixed(2)} cents`;
    return `${ha.toFixed(4)} ha · ${(ha * 2.47105).toFixed(4)} acres`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] w-[92%] max-w-[460px] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center py-8">
            <div className="w-12 h-12 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-[#1E293B] mb-1">🛰️ Contacting Satellite Constellation</p>
            <p className="text-xs text-[#64748B] text-center leading-relaxed">
              Querying Sentinel-2 · Sentinel-1 SAR · Landsat 8/9<br />
              MODIS · VIIRS · Open-Meteo · NASA POWER
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] w-[92%] max-w-[400px] p-6 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
          <AlertTriangle size={32} className="text-[#EF4444] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#EF4444] mb-2">Analysis Error</p>
          <p className="text-xs text-[#64748B] mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={onClose} className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs text-[#475569]">Close</button>
            <button onClick={runAnalysis} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] w-[94%] max-w-[480px] max-h-[88vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                <Activity size={18} className="text-[#2563EB]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E293B]">Multi-Satellite Analysis</h2>
                <p className="text-[10px] text-[#64748B]">{fieldName} · {formatArea(areaHa)}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
              <X size={16} />
            </button>
          </div>

          {/* Demo mode banner */}
          <div className="bg-[#FFF7ED] border border-[#FDE68A] rounded-lg px-3 py-1.5 mb-2 flex items-center gap-2">
            <Activity size={13} className="text-[#D97706] shrink-0" />
            <p className="text-[9px] text-[#92400E] leading-tight">
              Demo mode — satellite values are simulated from field geometry. Real WMS pixel queries coming in production.
            </p>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 bg-[#F8FAFC] rounded-lg p-1">
            {([
              { id: 'overview' as const, label: 'Overview', icon: Activity },
              { id: 'satellites' as const, label: 'Satellites', icon: Globe },
              { id: 'irrigation' as const, label: 'Irrigation', icon: Droplets },
              { id: 'benchmark' as const, label: 'Benchmark', icon: TrendingUp },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-[#2563EB] shadow-sm'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}>
                <tab.icon size={13} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === 'overview' && (
            <>
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-[#EFF6FF] to-[#F8FAFC] rounded-xl p-4 border border-[#BFDBFE] text-center">
                <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">Overall Field Health Score</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="relative inline-flex items-center justify-center">
                    <svg width="88" height="88" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none"
                        stroke={getScoreColor(analysis.overallHealthScore)}
                        strokeWidth="8"
                        strokeDasharray={`${(analysis.overallHealthScore / 100) * 264} 264`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-1000" />
                    </svg>
                    <span className="absolute text-2xl font-bold" style={{ color: getScoreColor(analysis.overallHealthScore) }}>
                      {analysis.overallHealthScore}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-[#1E293B]">{analysis.overallStatus}</p>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Best source: {analysis.bestSource}</p>
                    <p className="text-[10px] text-[#64748B]">Sources: {analysis.satellites.filter(s => s.dataAvailable).length}/5</p>
                  </div>
                </div>
              </div>

              {/* Satellite source cards */}
              <div className="grid grid-cols-2 gap-2">
                {analysis.satellites.map(sat => (
                  <button key={sat.sourceId} onClick={() => setExpandedSat(expandedSat === sat.sourceId ? null : sat.sourceId)}
                    className={`bg-white rounded-xl p-3 border text-left transition-all ${
                      expandedSat === sat.sourceId ? 'border-[#2563EB] ring-1 ring-[#2563EB]/20' : 'border-[#E2E8F0] hover:border-[#93C5FD]'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-lg">{sat.icon}</span>
                        <p className="text-[10px] font-semibold text-[#1E293B] mt-1 leading-tight">{sat.sourceName}</p>
                      </div>
                      {sat.healthScore !== null && (
                        <span className="text-sm font-bold" style={{ color: getScoreColor(sat.healthScore) }}>
                          {sat.healthScore}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[9px] text-[#94A3B8]">{sat.resolution} · {sat.revisitDays}</span>
                      <span className="text-[9px] font-medium" style={{ color: SCORE_COLORS[sat.status] || '#94A3B8' }}>
                        {getStatusLabel(sat.status)}
                      </span>
                    </div>
                    {!sat.dataAvailable && (
                      <div className="mt-1.5 text-[8px] text-[#F59E0B] bg-[#FEFCE8] rounded px-1.5 py-0.5 inline-block">
                        ⚠️ API key needed
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Expanded satellite detail */}
              {expandedSat && (() => {
                const sat = analysis.satellites.find(s => s.sourceId === expandedSat);
                if (!sat) return null;
                const recs = analysis.perSourceRecommendations[expandedSat] || [];
                return (
                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#1E293B] flex items-center gap-1.5">
                        <span>{sat.icon}</span> {sat.sourceName}
                      </p>
                      <button onClick={() => setExpandedSat(null)} className="text-[#94A3B8] hover:text-[#64748B]">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(sat.values).filter(([, v]) => v !== null).map(([key, val]) => (
                        <div key={key} className="bg-white rounded-lg px-2.5 py-1.5 border border-[#E2E8F0]">
                          <p className="text-[8px] text-[#94A3B8] uppercase tracking-wider">{key.replace(/_/g, ' ')}</p>
                          <p className="text-xs font-bold text-[#1E293B]">{typeof val === 'number' ? val.toFixed(4) : String(val)}</p>
                        </div>
                      ))}
                    </div>
                    {recs.length > 0 && (
                      <div className="bg-[#F0FDF4] rounded-lg p-2 border border-[#BBF7D0]">
                        <p className="text-[8px] font-semibold text-[#166534] uppercase tracking-wider mb-1">Recommendations</p>
                        {recs.map((r, i) => <p key={i} className="text-[10px] text-[#166534] leading-relaxed">{r}</p>)}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Global recommendations */}
              {analysis.recommendations.length > 0 && (
                <div>
                  <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">🌍 Cross-Source Analysis</p>
                  <div className="bg-[#F0FDF4] rounded-xl p-3 border border-[#BBF7D0] space-y-1.5">
                    {analysis.recommendations.map((rec, i) => (
                      <p key={i} className="text-xs text-[#166534] leading-relaxed">{rec}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Export */}
              <button onClick={() => {
                const html = generateFullReportHTML(analysis);
                const blob = new Blob([html], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${fieldName.replace(/\s+/g, '_')}_multi_satellite_report.html`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Multi-satellite report exported');
              }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg text-xs font-semibold hover:bg-[#DBEAFE] transition-colors">
                <Download size={14} /> Export Full Report
              </button>
            </>
          )}

          {/* ===== SATELLITES TAB ===== */}
          {activeTab === 'satellites' && (
            <div className="space-y-4">
              {analysis.satellites.map(sat => (
                <div key={sat.sourceId} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{sat.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-[#1E293B]">{sat.sourceName}</p>
                        <p className="text-[9px] text-[#64748B]">{sat.resolution} · {sat.revisitDays}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {sat.healthScore !== null && (
                        <p className="text-sm font-bold" style={{ color: getScoreColor(sat.healthScore) }}>{sat.healthScore}</p>
                      )}
                      <p className="text-[9px]" style={{ color: SCORE_COLORS[sat.status] }}>{getStatusLabel(sat.status)}</p>
                    </div>
                  </div>

                  {/* Value bars */}
                  <div className="px-3 pb-3 space-y-1.5">
                    {Object.entries(sat.values).filter(([, v]) => v !== null).map(([key, val]) => {
                      const numVal = val as number;
                      const pct = Math.min(100, Math.max(0, numVal * 100));
                      const barColor = numVal > 0.6 ? '#22C55E' : numVal > 0.3 ? '#F59E0B' : '#EF4444';
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-[9px] text-[#64748B] mb-0.5">
                            <span className="font-medium uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                            <span className="font-semibold" style={{ color: barColor }}>{numVal.toFixed(4)}</span>
                          </div>
                          <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: barColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Per-source recs */}
                  {analysis.perSourceRecommendations[sat.sourceId]?.length > 0 && (
                    <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-3 py-2 space-y-1">
                      {analysis.perSourceRecommendations[sat.sourceId]!.map((r, i) => (
                        <p key={i} className="text-[9px] text-[#475569] leading-relaxed">{r}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ===== IRRIGATION TAB ===== */}
          {activeTab === 'irrigation' && analysis.irrigationAdvice && (
            <>
              {/* Irrigation status */}
              <div className={`rounded-xl p-4 border ${
                analysis.irrigationAdvice.urgency === 'high' ? 'bg-[#FEF2F2] border-[#FECACA]' :
                analysis.irrigationAdvice.urgency === 'medium' ? 'bg-[#FEFCE8] border-[#FDE68A]' :
                analysis.irrigationAdvice.urgency === 'low' ? 'bg-[#F0FDF4] border-[#BBF7D0]' :
                'bg-[#F0FDF4] border-[#BBF7D0]'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    analysis.irrigationAdvice.urgency === 'high' ? 'bg-[#FEE2E2]' :
                    analysis.irrigationAdvice.urgency === 'medium' ? 'bg-[#FEF3C7]' : 'bg-[#DCFCE7]'
                  }`}>
                    {analysis.irrigationAdvice.urgency === 'high' ? '🔴' :
                     analysis.irrigationAdvice.urgency === 'medium' ? '🟡' :
                     analysis.irrigationAdvice.urgency === 'low' ? '🟢' : '✅'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E293B]">
                      {analysis.irrigationAdvice.urgency === 'none' ? 'No Irrigation Needed' :
                       analysis.irrigationAdvice.urgency === 'low' ? 'Light Irrigation Recommended' :
                       analysis.irrigationAdvice.urgency === 'medium' ? 'Moderate Irrigation Needed' :
                       '🚨 Urgent Irrigation Required'}
                    </p>
                    {analysis.irrigationAdvice.recommended && (
                      <p className="text-lg font-bold text-[#2563EB] mt-0.5">
                        {analysis.irrigationAdvice.amountMm} mm recommended
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed">{analysis.irrigationAdvice.reason}</p>
              </div>

              {/* Water balance chart */}
              <div className="bg-white rounded-xl p-3 border border-[#E2E8F0]">
                <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">💧 Water Balance</p>
                <div className="space-y-2">
                  {([
                    { label: 'Evapotranspiration (ET₀)', value: analysis.irrigationAdvice.et0, max: 8, color: '#F59E0B' },
                    { label: 'Precipitation', value: analysis.irrigationAdvice.precipitation, max: 8, color: '#3B82F6' },
                    { label: 'Soil Moisture (SAR)', value: analysis.irrigationAdvice.soilMoisture * 8, max: 8, color: '#22C55E', raw: analysis.irrigationAdvice.soilMoisture },
                  ]).map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[10px] text-[#64748B] mb-0.5">
                        <span>{item.label}</span>
                        <span className="font-semibold text-[#1E293B]">
                          {item.raw !== undefined ? `${(item.raw * 100).toFixed(0)}%` : `${item.value.toFixed(1)}mm`}
                        </span>
                      </div>
                      <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(item.value / item.max) * 100}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart schedule */}
              {analysis.irrigationAdvice.recommended && (
                <div className="bg-[#EFF6FF] rounded-xl p-3 border border-[#BFDBFE]">
                  <p className="text-[9px] font-semibold text-[#2563EB] uppercase tracking-wider mb-2">📅 Smart Irrigation Schedule</p>
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-[#1E293B]">
                      🌅 <strong>Best time:</strong> Early morning (6-9 AM) to minimize evaporation
                    </p>
                    <p className="text-[10px] text-[#1E293B]">
                      💧 <strong>Method:</strong> Drip irrigation recommended for {analysis.areaHa.toFixed(2)} ha
                    </p>
                    <p className="text-[10px] text-[#1E293B]">
                      ⏱️ <strong>Duration:</strong> ~{Math.round(analysis.irrigationAdvice.amountMm / 0.6)} minutes at 6mm/hr drip rate
                    </p>
                    <p className="text-[10px] text-[#1E293B]">
                      📊 <strong>Split:</strong> Apply in {analysis.irrigationAdvice.amountMm > 20 ? '3' : '2'} sessions over 48h for better absorption
                    </p>
                  </div>
                </div>
              )}

              <button onClick={() => {
                const html = generateIrrigationReportHTML(analysis);
                const blob = new Blob([html], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${fieldName.replace(/\s+/g, '_')}_irrigation_plan.html`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Irrigation plan exported');
              }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg text-xs font-semibold hover:bg-[#DBEAFE] transition-colors">
                <Download size={14} /> Export Irrigation Plan
              </button>
            </>
          )}

          {/* ===== BENCHMARK TAB ===== */}
          {activeTab === 'benchmark' && analysis.regionalBenchmark && (
            <>
              {/* Regional comparison */}
              <div className="bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] rounded-xl p-4 border border-[#BFDBFE]">
                <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">📊 Regional Benchmark (MODIS)</p>

                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="text-center">
                    <p className="text-[9px] text-[#64748B] mb-1">Your Field</p>
                    <p className="text-xl font-bold text-[#2563EB]">{analysis.regionalBenchmark.farmNDVI.toFixed(3)}</p>
                    <p className="text-[9px] text-[#94A3B8]">NDVI</p>
                  </div>
                  <div className="text-[#94A3B8] text-2xl font-light">vs</div>
                  <div className="text-center">
                    <p className="text-[9px] text-[#64748B] mb-1">District Average</p>
                    <p className="text-xl font-bold text-[#64748B]">{analysis.regionalBenchmark.regionalAvgNDVI.toFixed(3)}</p>
                    <p className="text-[9px] text-[#94A3B8]">NDVI</p>
                  </div>
                </div>

                {/* Comparison bar */}
                <div className="bg-white rounded-lg p-3 border border-[#E2E8F0] mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-2 flex-1 bg-[#F1F5F9] rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 flex">
                        <div className="h-full bg-[#22C55E] rounded-l-full" style={{ width: `${analysis.regionalBenchmark.percentile}%` }} />
                        <div className="h-full bg-[#E2E8F0]" style={{ width: `${100 - analysis.regionalBenchmark.percentile}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#2563EB]">{analysis.regionalBenchmark.percentile}%</span>
                  </div>
                  <p className="text-[10px] text-[#64748B]">
                    Your field performs better than <strong>{analysis.regionalBenchmark.percentile}%</strong> of fields in the district
                  </p>
                </div>

                <div className={`rounded-lg p-3 ${
                  analysis.regionalBenchmark.comparison === 'above' ? 'bg-[#F0FDF4] border border-[#BBF7D0]' :
                  analysis.regionalBenchmark.comparison === 'below' ? 'bg-[#FEF2F2] border border-[#FECACA]' :
                  'bg-[#FEFCE8] border border-[#FDE68A]'
                }`}>
                  <p className="text-xs font-medium" style={{
                    color: analysis.regionalBenchmark.comparison === 'above' ? '#166534' :
                           analysis.regionalBenchmark.comparison === 'below' ? '#991B1B' : '#92400E'
                  }}>
                    {analysis.regionalBenchmark.comparison === 'above'
                      ? `✅ ${analysis.regionalBenchmark.difference > 0.1 ? 'Significantly' : 'Slightly'} above district average (+${analysis.regionalBenchmark.difference.toFixed(2)} NDVI)`
                      : analysis.regionalBenchmark.comparison === 'below'
                        ? `🔴 ${analysis.regionalBenchmark.difference < -0.1 ? 'Significantly' : 'Slightly'} below district average (${analysis.regionalBenchmark.difference.toFixed(2)} NDVI)`
                        : '🟡 Your field is at district average'}
                  </p>
                </div>
              </div>

              {/* Source comparison matrix */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-wider p-3 pb-1">Satellite Comparison</p>
                <div className="p-3 space-y-2">
                  {analysis.satellites.filter(s => s.healthScore !== null).map(sat => (
                    <div key={sat.sourceId} className="flex items-center gap-2">
                      <span className="text-sm w-5">{SAT_ICONS[sat.sourceId] || '🛰️'}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] text-[#64748B] mb-0.5">
                          <span className="truncate">{sat.sourceName}</span>
                          <span className="font-bold" style={{ color: getScoreColor(sat.healthScore) }}>{sat.healthScore}</span>
                        </div>
                        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${sat.healthScore}%`, background: getScoreColor(sat.healthScore) }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather summary */}
              {analysis.weatherSummary && (
                <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] flex items-center gap-2.5">
                  <CloudRain size={20} className="text-[#3B82F6]" />
                  <p className="text-xs text-[#475569]">{analysis.weatherSummary}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-[9px] text-[#94A3B8]">
          <span>KhetMap Multi-Satellite</span>
          <div className="flex items-center gap-2">
            <button onClick={runAnalysis} className="flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8]">
              <RefreshCw size={12} /> Refresh
            </button>
            <span>{new Date(analysis.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== REPORT GENERATORS =====

function generateFullReportHTML(a: MultiSatelliteAnalysis): string {
  const scoreColor = getScoreHex(a.overallHealthScore);
  const sats = a.satellites;

  return `<!DOCTYPE html>
<html><head><title>${a.fieldName} - Multi-Satellite Field Analysis</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; color: #1E293B; max-width: 800px; }
h1 { color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
h2 { color: #1E293B; margin-top: 24px; }
.score-circle { width: 100px; height: 100px; border-radius: 50%; background: conic-gradient(${scoreColor} ${a.overallHealthScore}%, #E2E8F0 ${a.overallHealthScore}%); display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.score-inner { width: 80px; height: 80px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: ${scoreColor}; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; }
th { background: #EFF6FF; text-align: left; padding: 8px; border: 1px solid #E2E8F0; font-size: 12px; }
td { padding: 8px; border: 1px solid #E2E8F0; font-size: 12px; }
.bar { height: 16px; background: #E2E8F0; border-radius: 4px; overflow: hidden; margin: 4px 0; }
.bar-fill { height: 100%; border-radius: 4px; }
.sat-card { border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin: 8px 0; }
.recs { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 16px; border-radius: 8px; margin: 16px 0; }
.irrigation { background: #EFF6FF; border: 1px solid #BFDBFE; padding: 16px; border-radius: 8px; margin: 16px 0; }
.footer { margin-top: 30px; font-size: 11px; color: #94A3B8; }
</style></head><body>
<h1>🛰️ ${a.fieldName} — Multi-Satellite Analysis</h1>
<p>Generated: ${new Date(a.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
<div class="score-circle"><div class="score-inner">${a.overallHealthScore}</div></div>
<p style="text-align:center;font-weight:bold;color:${scoreColor}">${a.overallStatus} · ${a.bestSource}</p>

<h2>📊 Field Statistics</h2>
<table>
<tr><th>Property</th><th>Value</th></tr>
<tr><td>Area</td><td>${a.areaHa.toFixed(4)} ha (${(a.areaHa * 2.47105).toFixed(4)} acres)</td></tr>
<tr><td>Overall Score</td><td>${a.overallHealthScore}/100</td></tr>
<tr><td>Best Source</td><td>${a.bestSource}</td></tr>
<tr><td>Active Sources</td><td>${a.satellites.filter(s => s.dataAvailable).length}/5</td></tr>
${a.weatherSummary ? `<tr><td>Weather (7-day)</td><td>${a.weatherSummary}</td></tr>` : ''}
</table>

<h2>🛰️ Per-Satellite Analysis</h2>
${sats.map(sat => {
  const satColor = getScoreHex(sat.healthScore ?? 0);
  return `<div class="sat-card">
<h3>${sat.icon} ${sat.sourceName}</h3>
<p style="color:#64748B;font-size:12px">${sat.resolution} · ${sat.revisitDays}</p>
<p>Health Score: <strong style="color:${satColor}">${sat.healthScore !== null ? sat.healthScore + '/100' : 'N/A'}</strong> · Status: ${sat.status}</p>
${Object.entries(sat.values).filter(([,v]) => v !== null).map(([k, v]) => {
  const pct = Math.min(100, Math.max(0, (v as number) * 100));
  const barColor = (v as number) > 0.6 ? '#22C55E' : (v as number) > 0.3 ? '#F59E0B' : '#EF4444';
  return `<p style="font-size:11px;margin-bottom:2px">${k.replace(/_/g, ' ')}: ${(v as number).toFixed(4)}</p>
<div class="bar"><div class="bar-fill" style="width:${pct}%;background:${barColor}"></div></div>`;
}).join('')}
${(a.perSourceRecommendations[sat.sourceId] || []).map(r => `<p style="font-size:11px;color:#475569">${r}</p>`).join('')}
</div>`;
}).join('')}

<h2>🌍 Cross-Source Recommendations</h2>
<div class="recs">${a.recommendations.map(r => '<p>' + r + '</p>').join('')}</div>

${a.irrigationAdvice ? `<h2>💧 Irrigation Advisory</h2>
<div class="irrigation">
<p><strong>Urgency:</strong> ${a.irrigationAdvice.urgency}</p>
${a.irrigationAdvice.recommended ? `<p><strong>Amount:</strong> ${a.irrigationAdvice.amountMm} mm</p>` : ''}
<p>${a.irrigationAdvice.reason}</p>
<p><strong>ET₀:</strong> ${a.irrigationAdvice.et0.toFixed(1)}mm · <strong>Precip:</strong> ${a.irrigationAdvice.precipitation.toFixed(1)}mm · <strong>Soil Moisture:</strong> ${(a.irrigationAdvice.soilMoisture * 100).toFixed(0)}%</p>
</div>` : ''}

${a.regionalBenchmark ? `<h2>📊 Regional Benchmark</h2>
<table>
<tr><th>Metric</th><th>Value</th></tr>
<tr><td>Your Field NDVI</td><td>${a.regionalBenchmark.farmNDVI.toFixed(3)}</td></tr>
<tr><td>District Avg NDVI</td><td>${a.regionalBenchmark.regionalAvgNDVI.toFixed(3)}</td></tr>
<tr><td>Percentile</td><td>${a.regionalBenchmark.percentile}%</td></tr>
<tr><td>Comparison</td><td>${a.regionalBenchmark.comparison} (${a.regionalBenchmark.difference > 0 ? '+' : ''}${a.regionalBenchmark.difference.toFixed(2)})</td></tr>
</table>` : ''}

<p class="footer">KhetMap — Multi-Satellite Precision Agriculture Platform<br>
Sources: ESA Copernicus Sentinel-2 & Sentinel-1 · NASA/USGS Landsat 8/9 · NASA MODIS & VIIRS · Open-Meteo · NASA POWER<br>
Data refreshes according to each satellite's revisit cycle. Analysis generated ${new Date(a.timestamp).toLocaleString('en-IN')}</p>
</body></html>`;
}

function generateIrrigationReportHTML(a: MultiSatelliteAnalysis): string {
  if (!a.irrigationAdvice) return '<html><body>No irrigation data available</body></html>';
  const ia = a.irrigationAdvice;
  const urgencyColor = ia.urgency === 'high' ? '#EF4444' : ia.urgency === 'medium' ? '#F59E0B' : '#22C55E';

  return `<!DOCTYPE html>
<html><head><title>${a.fieldName} - Smart Irrigation Plan</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; color: #1E293B; max-width: 700px; }
h1 { color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
h2 { color: #1E293B; margin-top: 24px; }
.urgent { padding: 16px; border-radius: 8px; font-size: 16px; font-weight: bold; text-align: center; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; }
th { background: #EFF6FF; text-align: left; padding: 10px; border: 1px solid #E2E8F0; }
td { padding: 10px; border: 1px solid #E2E8F0; }
.advice { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 16px; border-radius: 8px; margin: 16px 0; }
.footer { margin-top: 30px; font-size: 12px; color: #94A3B8; }
</style></head><body>
<h1>💧 ${a.fieldName} — Smart Irrigation Plan</h1>
<p>Generated: ${new Date(a.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
<div class="urgent" style="background:${urgencyColor}15;color:${urgencyColor};border:2px solid ${urgencyColor}">
${ia.urgency === 'none' ? '✅ No Irrigation Needed' : ia.recommended ? ia.amountMm + ' mm Recommended' : 'Monitor Conditions'}
</div>
<h2>Water Balance</h2>
<table>
<tr><th>Parameter</th><th>Value</th></tr>
<tr><td>Evapotranspiration (ET₀)</td><td>${ia.et0.toFixed(1)} mm/day</td></tr>
<tr><td>Precipitation</td><td>${ia.precipitation.toFixed(1)} mm/day</td></tr>
<tr><td>Soil Moisture (SAR)</td><td>${(ia.soilMoisture * 100).toFixed(0)}%</td></tr>
<tr><td>Water Deficit</td><td>${(ia.et0 - ia.precipitation).toFixed(1)} mm/day</td></tr>
</table>
<h2>Recommendation</h2>
<div class="advice"><p>${ia.reason}</p></div>
<h2>Smart Schedule</h2>
<table>
<tr><th>Detail</th><th>Recommendation</th></tr>
<tr><td>Best Time</td><td>Early morning (6-9 AM) to minimize evaporation</td></tr>
<tr><td>Method</td><td>Drip irrigation recommended for ${a.areaHa.toFixed(2)} ha field</td></tr>
<tr><td>Duration</td><td>~${Math.round(ia.amountMm / 0.6)} minutes at 6mm/hr drip rate</td></tr>
<tr><td>Splits</td><td>${ia.amountMm > 20 ? '3' : '2'} sessions over 48h for better absorption</td></tr>
</table>
<p class="footer">KhetMap — Multi-Satellite Precision Agriculture Platform<br>
Irrigation advice combines: Sentinel-2 NDWI · Sentinel-1 SAR moisture · Landsat CWSI · Open-Meteo ET₀</p>
</body></html>`;
}

function getScoreHex(score: number): string {
  if (score >= 70) return '#22C55E';
  if (score >= 50) return '#3B82F6';
  if (score >= 30) return '#F59E0B';
  if (score >= 15) return '#EF4444';
  return '#7F1D1D';
}
