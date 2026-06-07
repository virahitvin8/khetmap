import { useState, useEffect } from 'react';
import { FlaskRoundIcon as Flask, Leaf, Droplets, Mountain, AlertTriangle, TrendingUp, Download, RefreshCw } from 'lucide-react';
import { analyzeField, FieldAnalysisResult, AnalysisLayer, SatelliteSource, isSentinelAvailable, getActiveSource } from '../../services/fieldAnalysis';
import { toast } from 'sonner';

interface Vertex { lat: number; lng: number; }

interface FieldAnalysisReportProps {
  fieldName: string;
  vertices: Vertex[];
  areaHa: number;
  onClose: () => void;
}

export default function FieldAnalysisReport({ fieldName, vertices, areaHa, onClose }: FieldAnalysisReportProps) {
  const [selectedLayer, setSelectedLayer] = useState<AnalysisLayer>('ndvi');
  const [satSource, setSatSource] = useState<SatelliteSource>(getActiveSource());
  const [result, setResult] = useState<FieldAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sentinelAvail = isSentinelAvailable();

  const runAnalysis = async (layer: AnalysisLayer, source: SatelliteSource) => {
    setLoading(true);
    setError('');
    try {
      const res = await analyzeField(fieldName, vertices, areaHa, layer, source);
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLayerSelect = (layer: AnalysisLayer) => {
    setSelectedLayer(layer);
    runAnalysis(layer, satSource);
  };

  const handleSourceChange = (source: SatelliteSource) => {
    setSatSource(source);
    runAnalysis(selectedLayer, source);
  };

  // Run analysis on mount
  useEffect(() => { runAnalysis(selectedLayer, satSource); }, []);

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#22C55E';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const getBarColor = (category: string) => {
    switch (category) {
      case 'healthy': return '#22C55E';
      case 'moderate': return '#F59E0B';
      case 'poor': return '#EF4444';
      case 'water': return '#3B82F6';
      default: return '#94A3B8';
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] w-[92%] max-w-[420px] max-h-[85vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#F1F5F9] px-5 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1E293B]">📡 Field Analysis</h2>
              <p className="text-xs text-[#64748B] mt-0.5">{fieldName}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#94A3B8] flex items-center justify-center hover:bg-[#F8FAFC] text-sm">✕</button>
          </div>

          {/* Layer selector */}
          <div className="flex gap-1.5 mt-3">
            {[
              { id: 'ndvi' as AnalysisLayer, label: 'Crop Health', icon: '🌿' },
              { id: 'ndwi' as AnalysisLayer, label: 'Water Index', icon: '💧' },
              { id: 'savi' as AnalysisLayer, label: 'Soil Health', icon: '🪨' },
            ].map(layer => (
              <button key={layer.id} onClick={() => handleLayerSelect(layer.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  selectedLayer === layer.id
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                    : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                }`}>
                <span>{layer.icon}</span> {layer.label}
              </button>
            ))}
          </div>

          {/* Satellite source toggle (only show when Sentinel-2 is configured) */}
          {sentinelAvail && (
            <div className="flex items-center gap-2 mt-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-1.5">
              <span className="text-[10px] font-semibold text-[#166534]">🛰️ Source:</span>
              <button onClick={() => handleSourceChange('modis')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  satSource === 'modis' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#64748B] hover:text-[#2563EB]'
                }`}>
                MODIS (250m)
              </button>
              <button onClick={() => handleSourceChange('sentinel2')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  satSource === 'sentinel2' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#64748B] hover:text-[#2563EB]'
                }`}>
                Sentinel-2 (10m)
              </button>
            </div>
          )}
        </div>

        <div className="px-5 py-4 space-y-4">
          {loading && (
            <div className="flex flex-col items-center py-8">
              <div className="w-10 h-10 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-[#64748B]">Contacting satellite (NASA GIBS)...</p>
              <p className="text-[10px] text-[#94A3B8] mt-1">Sampling {selectedLayer.toUpperCase()} data points in your field</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 text-center">
              <AlertTriangle size={24} className="text-[#EF4444] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#EF4444] mb-1">Could not reach satellite</p>
              <p className="text-xs text-[#64748B]">{error}</p>
              <button onClick={() => runAnalysis(selectedLayer)}
                className="mt-3 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition-colors inline-flex items-center gap-1.5">
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          {result && !loading && result.sampleCount === 0 && (
            <div className="bg-[#FEFCE8] border border-[#FDE68A] rounded-xl p-4 text-center">
              <AlertTriangle size={24} className="text-[#F59E0B] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#92400E] mb-1">Analysis in Demo Mode</p>
              <p className="text-xs text-[#64748B]">NASA GIBS data couldn't be loaded (CORS restriction). Showing simulated analysis based on field geometry. Results are approximate — for real data, connect to Sentinel Hub API.</p>
              <button onClick={() => runAnalysis(selectedLayer)}
                className="mt-3 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition-colors inline-flex items-center gap-1.5">
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          {result && !loading && result.sampleCount > 0 && (
            <>
              {/* Overall Health Score */}
              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] text-center">
                <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Overall {getLayerLabel(result.layer)} Score
                </p>
                <div className="relative inline-flex items-center justify-center my-2">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={getScoreColor(result.overallScore)}
                      strokeWidth="8" strokeDasharray={`${(result.overallScore / 100) * 264} 264`}
                      strokeLinecap="round" transform="rotate(-90 50 50)" />
                  </svg>
                  <span className="absolute text-2xl font-bold" style={{ color: getScoreColor(result.overallScore) }}>
                    {result.overallScore}
                  </span>
                </div>
                <p className="text-sm font-semibold" style={{ color: getScoreColor(result.overallScore) }}>
                  {result.overallScore >= 70 ? '✅ Healthy' : result.overallScore >= 40 ? '⚠️ Needs Attention' : '🔴 Critical'}
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Mean', value: result.meanValue.toFixed(3), color: '#2563EB' },
                  { label: 'Min', value: result.minValue.toFixed(3), color: '#EF4444' },
                  { label: 'Max', value: result.maxValue.toFixed(3), color: '#22C55E' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white border border-[#E2E8F0] rounded-xl p-3 text-center">
                    <p className="text-[9px] font-medium text-[#94A3B8] uppercase tracking-wider">{stat.label}</p>
                    <p className="text-lg font-bold mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[9px] text-[#94A3B8]">{getUnitLabel(result.layer)}</p>
                  </div>
                ))}
              </div>

              {/* Area breakdown bar */}
              <div>
                <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">Field Area Breakdown</p>
                <div className="h-5 rounded-lg overflow-hidden flex">
                  {result.healthyPercent > 0 && (
                    <div className="h-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ width: `${result.healthyPercent}%`, background: '#22C55E', minWidth: result.healthyPercent > 5 ? undefined : 0 }}>
                      {result.healthyPercent > 8 ? `${result.healthyPercent.toFixed(0)}%` : ''}
                    </div>
                  )}
                  {result.moderatePercent > 0 && (
                    <div className="h-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ width: `${result.moderatePercent}%`, background: '#F59E0B', minWidth: result.moderatePercent > 5 ? undefined : 0 }}>
                      {result.moderatePercent > 8 ? `${result.moderatePercent.toFixed(0)}%` : ''}
                    </div>
                  )}
                  {result.poorPercent > 0 && (
                    <div className="h-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ width: `${result.poorPercent}%`, background: '#EF4444', minWidth: result.poorPercent > 5 ? undefined : 0 }}>
                      {result.poorPercent > 8 ? `${result.poorPercent.toFixed(0)}%` : ''}
                    </div>
                  )}
                  {result.waterPercent > 0 && (
                    <div className="h-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ width: `${result.waterPercent}%`, background: '#3B82F6', minWidth: result.waterPercent > 5 ? undefined : 0 }}>
                      {result.waterPercent > 8 ? `${result.waterPercent.toFixed(0)}%` : ''}
                    </div>
                  )}
                </div>
                <div className="flex justify-between mt-1.5 text-[9px] text-[#64748B]">
                  <span>🟢 Healthy: {result.healthyPercent.toFixed(1)}%</span>
                  <span>🟡 Moderate: {result.moderatePercent.toFixed(1)}%</span>
                  <span>🔴 Poor: {result.poorPercent.toFixed(1)}%</span>
                </div>
              </div>

              {/* Area in hectares */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Healthy', value: result.healthyArea.toFixed(2), unit: 'ha', color: '#22C55E' },
                  { label: 'Moderate', value: result.moderateArea.toFixed(2), unit: 'ha', color: '#F59E0B' },
                  { label: 'Poor', value: result.poorArea.toFixed(2), unit: 'ha', color: '#EF4444' },
                ].map(item => (
                  <div key={item.label} className="bg-[#F8FAFC] rounded-lg p-2.5 text-center border border-[#E2E8F0]">
                    <p className="text-[9px] text-[#64748B]">{item.label}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-[8px] text-[#94A3B8]">{item.unit}</p>
                  </div>
                ))}
              </div>

              {/* Statistics */}
              <div>
                <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">Statistics</p>
                <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] space-y-1.5">
                  {[
                    { label: 'Standard Deviation', value: result.stdDev.toFixed(4) },
                    { label: 'Sample Points', value: String(result.sampleCount) },
                    { label: 'Date', value: new Date(result.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                    { label: 'Satellite Source', value: 'NASA GIBS (MODIS)' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-xs text-[#64748B]">{label}</span>
                      <span className="text-xs font-semibold text-[#1E293B]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">Recommendations</p>
                  <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3 space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <p key={i} className="text-xs text-[#166534] leading-relaxed">{rec}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button onClick={() => runAnalysis(selectedLayer)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg text-xs font-semibold hover:bg-[#DBEAFE] transition-colors">
                  <RefreshCw size={14} /> Refresh
                </button>
                <button onClick={() => {
                  // Export report as HTML
                  const html = generateReportHTML(result, fieldName);
                  const blob = new Blob([html], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${fieldName.replace(/\s+/g, '_')}_analysis_report.html`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Analysis report exported');
                }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] rounded-lg text-xs font-semibold hover:bg-[#F8FAFC] transition-colors">
                  <Download size={14} /> Export Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getLayerLabel(layer: AnalysisLayer): string {
  switch (layer) {
    case 'ndvi': return 'Crop Health (NDVI)';
    case 'ndwi': return 'Water Index (NDWI)';
    case 'savi': return 'Soil Health (SAVI)';
  }
}

function getUnitLabel(layer: AnalysisLayer): string {
  switch (layer) { case 'ndvi': return 'NDVI'; case 'ndwi': return 'NDWI'; case 'savi': return 'SAVI'; }
}

function generateReportHTML(result: FieldAnalysisResult, fieldName: string): string {
  const scoreColor = result.overallScore >= 70 ? '#22C55E' : result.overallScore >= 40 ? '#F59E0B' : '#EF4444';
  const statusText = result.overallScore >= 70 ? 'Healthy' : result.overallScore >= 40 ? 'Needs Attention' : 'Critical';

  return `<!DOCTYPE html>
<html><head><title>${fieldName} - Field Analysis Report</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; color: #1E293B; max-width: 700px; }
h1 { color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
.score { font-size: 48px; font-weight: bold; color: ${scoreColor}; text-align: center; padding: 20px; }
.status { text-align: center; font-size: 18px; color: ${scoreColor}; }
table { width: 100%; border-collapse: collapse; margin: 20px 0; }
th { background: #EFF6FF; text-align: left; padding: 10px; border: 1px solid #E2E8F0; }
td { padding: 10px; border: 1px solid #E2E8F0; }
.bar { height: 24px; border-radius: 4px; display: flex; overflow: hidden; margin: 10px 0; }
.bar-segment { display: flex; align-items: center; justify-content: center; font-size: 10px; color: white; }
.recs { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 16px; border-radius: 8px; margin: 16px 0; }
.footer { margin-top: 30px; font-size: 12px; color: #94A3B8; }
</style></head><body>
<h1>📡 ${fieldName} — ${getLayerLabel(result.layer)} Analysis</h1>
<p>Generated: ${new Date(result.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
<div class="score">${result.overallScore}/100</div>
<div class="status">${statusText}</div>
<h2>Field Statistics</h2>
<table>
<tr><td>Total Area</td><td>${(result.healthyArea + result.moderateArea + result.poorArea).toFixed(2)} ha</td></tr>
<tr><td>Mean ${getLayerLabel(result.layer)}</td><td>${result.meanValue.toFixed(4)}</td></tr>
<tr><td>Min / Max</td><td>${result.minValue.toFixed(4)} / ${result.maxValue.toFixed(4)}</td></tr>
<tr><td>Standard Deviation</td><td>${result.stdDev.toFixed(4)}</td></tr>
<tr><td>Sample Points</td><td>${result.sampleCount}</td></tr>
<tr><td>Satellite</td><td>NASA GIBS (MODIS)</td></tr>
</table>
<h2>Area Breakdown</h2>
<div class="bar">${result.healthyPercent > 0 ? '<div class="bar-segment" style="width:' + result.healthyPercent + '%;background:#22C55E">' + result.healthyPercent.toFixed(0) + '%</div>' : ''}${result.moderatePercent > 0 ? '<div class="bar-segment" style="width:' + result.moderatePercent + '%;background:#F59E0B">' + result.moderatePercent.toFixed(0) + '%</div>' : ''}${result.poorPercent > 0 ? '<div class="bar-segment" style="width:' + result.poorPercent + '%;background:#EF4444">' + result.poorPercent.toFixed(0) + '%</div>' : ''}</div>
<table>
<tr><th>Category</th><th>Percentage</th><th>Area (ha)</th></tr>
<tr><td style="color:#22C55E">🟢 Healthy</td><td>${result.healthyPercent.toFixed(1)}%</td><td>${result.healthyArea.toFixed(2)}</td></tr>
<tr><td style="color:#F59E0B">🟡 Moderate</td><td>${result.moderatePercent.toFixed(1)}%</td><td>${result.moderateArea.toFixed(2)}</td></tr>
<tr><td style="color:#EF4444">🔴 Poor</td><td>${result.poorPercent.toFixed(1)}%</td><td>${result.poorArea.toFixed(2)}</td></tr>
</table>
<h2>Recommendations</h2>
<div class="recs">${result.recommendations.map(r => '<p>' + r + '</p>').join('')}</div>
<p class="footer">KhetMap — Free Satellite Field Analysis · Powered by NASA GIBS (MODIS Terra)<br>Data refreshes every 7-14 days from Sentinel-2 and MODIS satellites</p>
</body></html>`;
}
