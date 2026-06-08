import { useState, useEffect } from 'react';
import { X, Activity, Download, RefreshCw, MapPin, TrendingUp, Mountain, AlertTriangle, Info } from 'lucide-react';
import { runLandAnalysis, LandAnalysisResult, LAND_CLASS_LABELS, LAND_CLASS_ICONS, LAND_CLASS_COLORS } from '../../services/landData';
import { toast } from 'sonner';

interface Vertex { lat: number; lng: number; }

interface Props {
  fieldName: string;
  vertices: Vertex[];
  areaHa: number;
  onClose: () => void;
}

function ScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width="72" height="72" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="8" />
          <circle cx="50" cy="50" r="42" fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${(score / 100) * 264} 264`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000" />
        </svg>
        <span className="absolute text-lg font-bold" style={{ color }}>{score}%</span>
      </div>
      <p className="text-[9px] text-[#64748B] mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9] last:border-0">
      <span className="text-[11px] text-[#64748B] flex items-center gap-1.5">
        {icon && <span>{icon}</span>}
        {label}
      </span>
      <span className="text-[11px] font-semibold text-[#1E293B]">{value}</span>
    </div>
  );
}

export default function LandAnalysisModal({ fieldName, vertices, areaHa, onClose }: Props) {
  const [result, setResult] = useState<LandAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await runLandAnalysis(fieldName, vertices, areaHa);
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Land analysis failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalysis(); }, []);

  const getConfidenceColor = (score: number) => {
    if (score >= 70) return '#22C55E';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const handleExport = () => {
    if (!result) return;
    const html = generateReportHTML(result);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fieldName.replace(/\s+/g, '_')}_land_analysis.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Land analysis report exported');
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] w-[92%] max-w-[440px] max-h-[88vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
                <Activity size={18} className="text-[#22C55E]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E293B]">🌍 Land Analysis</h2>
                <p className="text-[10px] text-[#64748B]">{fieldName}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
          {loading && (
            <div className="flex flex-col items-center py-10">
              <div className="w-10 h-10 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-[#1E293B] mb-1">Analyzing land from space...</p>
              <p className="text-[10px] text-[#64748B] text-center leading-relaxed">
                Querying satellite indices (NDVI/NDWI/SAVI)<br />
                Fetching elevation · Checking land use data
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center py-6">
              <AlertTriangle size={32} className="text-[#EF4444] mb-3" />
              <p className="text-sm font-semibold text-[#EF4444] mb-1">Analysis Error</p>
              <p className="text-xs text-[#64748B] text-center">{error}</p>
              <button onClick={fetchAnalysis}
                className="mt-4 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Land Classification Card */}
              <div className="rounded-xl p-4 border-2 text-center transition-all"
                style={{
                  borderColor: result.classification.color + '40',
                  background: `linear-gradient(135deg, ${result.classification.color}08, white)`,
                }}>
                <span className="text-4xl block mb-2">{result.classification.icon}</span>
                <h3 className="text-lg font-bold text-[#1E293B]">
                  {LAND_CLASS_LABELS[result.classification.primaryClass]}
                </h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  {result.classification.description}
                </p>

                {/* Confidence bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-[#64748B] mb-1">
                    <span>Classification Confidence</span>
                    <span className="font-bold" style={{ color: getConfidenceColor(result.classification.confidence) }}>
                      {result.classification.confidence}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${result.classification.confidence}%`,
                        background: getConfidenceColor(result.classification.confidence),
                      }} />
                  </div>
                </div>
              </div>

              {/* Summary row */}
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3">
                <p className="text-xs text-[#166534] leading-relaxed">{result.summary}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: '🌿', label: 'NDVI', value: result.ndvi.toFixed(3), color: '#22C55E' },
                  { icon: '💧', label: 'NDWI', value: result.ndwi.toFixed(3), color: '#3B82F6' },
                  { icon: '🪨', label: 'SAVI', value: result.savi.toFixed(3), color: '#F59E0B' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white border border-[#E2E8F0] rounded-xl p-3 text-center">
                    <span className="text-lg">{stat.icon}</span>
                    <p className="text-[9px] text-[#64748B] uppercase mt-1">{stat.label}</p>
                    <p className="text-sm font-bold mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Composite class breakdown */}
              {result.classification.allClasses.length > 1 && (
                <div>
                  <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">Land Composition</p>
                  <div className="h-4 rounded-lg overflow-hidden flex">
                    {result.classification.allClasses.map((c, i) => (
                      <div key={c.class}
                        className="h-full flex items-center justify-center text-[7px] font-bold text-white"
                        style={{
                          width: `${c.percentage}%`,
                          background: LAND_CLASS_COLORS[c.class],
                          minWidth: c.percentage > 8 ? undefined : 0,
                        }}>
                        {c.percentage > 8 ? `${c.percentage}%` : ''}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                    {result.classification.allClasses.map(c => (
                      <span key={c.class} className="text-[9px] text-[#64748B] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: LAND_CLASS_COLORS[c.class] }} />
                        {LAND_CLASS_LABELS[c.class]} ({c.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Terrain & Location Info */}
              <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
                <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Mountain size={12} /> Terrain & Location
                </p>
                <div>
                  <InfoRow label="Elevation" value={result.elevation ? `${result.elevation.elevation.toFixed(0)}m (${result.elevation.source})` : 'Unknown'} icon="⛰️" />
                  <InfoRow label="Slope" value={result.slope} icon="📐" />
                  <InfoRow label="Aspect" value={result.aspect} icon="☀️" />
                  <InfoRow label="Coordinates" value={`${result.center.lat.toFixed(6)}, ${result.center.lng.toFixed(6)}`} icon="📍" />
                  <InfoRow label="Area" value={
                    result.areaHa < 0.001 ? `${(result.areaHa * 10000).toFixed(1)} m²` :
                    result.areaHa < 1 ? `${(result.areaHa * 100).toFixed(2)} cents` :
                    `${result.areaHa.toFixed(4)} ha`
                  } icon="📏" />
                </div>
              </div>

              {/* OSM Land Use */}
              <div className="bg-white rounded-xl p-3 border border-[#E2E8F0]">
                <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin size={12} /> OpenStreetMap Land Use
                </p>
                <p className="text-xs text-[#475569] leading-relaxed">{result.osmSummary}</p>
              </div>

              {/* Suitable For */}
              {result.classification.suitableFor.length > 0 && (
                <div>
                  <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingUp size={12} /> Suitable For
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.classification.suitableFor.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-[10px] text-[#166534] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.classification.recommendations.length > 0 && (
                <div>
                  <p className="text-[9px] font-semibold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info size={12} /> Recommendations
                  </p>
                  <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3 space-y-1.5">
                    {result.classification.recommendations.map((rec, i) => (
                      <p key={i} className="text-xs text-[#166534] leading-relaxed">{rec}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button onClick={fetchAnalysis}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#F0FDF4] text-[#166534] rounded-lg text-xs font-semibold hover:bg-[#DCFCE7] transition-colors border border-[#BBF7D0]">
                  <RefreshCw size={14} /> Refresh
                </button>
                <button onClick={handleExport}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#EFF6FF] text-[#2563EB] rounded-lg text-xs font-semibold hover:bg-[#DBEAFE] transition-colors">
                  <Download size={14} /> Export Report
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-[9px] text-[#94A3B8]">
          <span>🌍 KhetMap Land Analysis</span>
          <span>NASA GIBS · Open-Meteo · OpenStreetMap</span>
        </div>
      </div>
    </div>
  );
}

function generateReportHTML(result: LandAnalysisResult): string {
  const c = result.classification;
  const confColor = c.confidence >= 70 ? '#22C55E' : c.confidence >= 40 ? '#F59E0B' : '#EF4444';

  return `<!DOCTYPE html>
<html><head><title>${result.fieldName} - Land Analysis Report</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; color: #1E293B; max-width: 700px; }
h1 { color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
h2 { color: #1E293B; margin-top: 24px; }
.confidence { font-size: 36px; font-weight: bold; color: ${confColor}; text-align: center; }
.card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 12px 0; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th { background: #EFF6FF; text-align: left; padding: 8px; border: 1px solid #E2E8F0; font-size: 12px; }
td { padding: 8px; border: 1px solid #E2E8F0; font-size: 12px; }
.recs { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 16px; border-radius: 8px; }
.footer { margin-top: 30px; font-size: 11px; color: #94A3B8; }
.bar { height: 20px; background: #E2E8F0; border-radius: 4px; overflow: hidden; margin: 8px 0; display: flex; }
.bar-segment { display: flex; align-items: center; justify-content: center; font-size: 9px; color: white; }
.tag { display: inline-block; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 4px; padding: 2px 8px; font-size: 11px; margin: 2px; }
</style></head><body>
<h1>🌍 ${result.fieldName} — Land Analysis Report</h1>
<p>Generated: ${new Date(result.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>

<div class="card" style="text-align:center">
  <p style="font-size:48px;margin:0">${c.icon}</p>
  <h2 style="margin:4px 0">${LAND_CLASS_LABELS[c.primaryClass]}</h2>
  <p>Classification Confidence: <span class="confidence">${c.confidence}%</span></p>
  <p style="color:#64748B;font-size:13px">${c.description}</p>
</div>

<h2>🌿 Satellite Indices</h2>
<table>
<tr><th>Index</th><th>Value</th><th>Interpretation</th></tr>
<tr><td>NDVI (Vegetation)</td><td>${result.ndvi.toFixed(4)}</td><td>${result.ndvi > 0.5 ? 'Dense vegetation' : result.ndvi > 0.2 ? 'Moderate cover' : 'Sparse'}</td></tr>
<tr><td>NDWI (Water)</td><td>${result.ndwi.toFixed(4)}</td><td>${result.ndwi > 0.3 ? 'Water body' : result.ndwi > 0 ? 'Moist' : 'Dry'}</td></tr>
<tr><td>SAVI (Soil)</td><td>${result.savi.toFixed(4)}</td><td>${result.savi > 0.4 ? 'Healthy soil veg' : result.savi > 0.15 ? 'Moderate' : 'Low'}</td></tr>
</table>

<h2>⛰️ Terrain & Location</h2>
<table>
<tr><th>Property</th><th>Value</th></tr>
<tr><td>Elevation</td><td>${result.elevation ? result.elevation.elevation.toFixed(0) + 'm' : 'Unknown'}</td></tr>
<tr><td>Slope</td><td>${result.slope}</td></tr>
<tr><td>Aspect</td><td>${result.aspect}</td></tr>
<tr><td>Center</td><td>${result.center.lat.toFixed(6)}, ${result.center.lng.toFixed(6)}</td></tr>
<tr><td>Area</td><td>${result.areaHa.toFixed(4)} ha</td></tr>
</table>

<h2>🗺️ Land Composition</h2>
<div class="bar">${c.allClasses.map(cls => `<div class="bar-segment" style="width:${cls.percentage}%;background:${LAND_CLASS_COLORS[cls.class]}">${cls.percentage}%</div>`).join('')}</div>
<p style="font-size:11px;color:#64748B">${c.allClasses.map(cls => LAND_CLASS_LABELS[cls.class] + ' (' + cls.percentage + '%)').join(' · ')}</p>

<h2>📋 Suitability</h2>
<p>${c.suitableFor.map(s => `<span class="tag">${s}</span>`).join(' ')}</p>

<h2>💡 Recommendations</h2>
<div class="recs">${c.recommendations.map(r => '<p>' + r + '</p>').join('')}</div>

<h2>📍 OpenStreetMap Data</h2>
<p style="font-size:12px;color:#64748B">${result.osmSummary}</p>

<p class="footer">KhetMap — Free Satellite-Powered Land Analysis<br>
Sources: NASA GIBS (MODIS) · Open-Meteo (SRTM Elevation) · OpenStreetMap (Overpass API)<br>
Data refreshes with latest satellite pass. Analysis generated ${new Date(result.timestamp).toLocaleString('en-IN')}</p>
</body></html>`;
}
