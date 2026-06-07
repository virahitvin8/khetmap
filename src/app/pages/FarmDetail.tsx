import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MapPin, Leaf, Ruler, Calendar, FileDown, Download, Edit3, Trash2, Globe, AlertTriangle, FlaskConical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { subscribeToFarms, deleteFarm, updateFarm, Farm } from '../../services/database';
import NDVIHistoryChart from '../components/NDVIHistoryChart';
import FieldAnalysisReport from '../components/FieldAnalysisReport';
import { toast } from 'sonner';

export default function FarmDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    const unsub = subscribeToFarms(user.uid, (farms) => {
      const found = farms.find(f => f.id === id);
      setFarm(found || null);
      if (found?.notes) setNote(found.notes);
      setLoading(false);
    });
    return unsub;
  }, [user, id]);

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const formatArea = (ha: number) => {
    const sqm = ha * 10000;
    const acres = ha * 2.47105;
    const sqkm = ha / 100;
    if (ha < 0.001) return `${sqm.toFixed(1)} m²`;
    if (ha < 1) return `${(ha * 100).toFixed(2)} cents (${acres.toFixed(4)} acres)`;
    return `${ha.toFixed(4)} ha · ${acres.toFixed(4)} acres · ${sqkm.toFixed(6)} km²`;
  };

  const handleRename = async () => {
    if (!user || !farm || !newName.trim()) return;
    try {
      await updateFarm(user.uid, farm.id, { name: newName.trim() } as any);
      setEditingName(false);
      toast.success('Field renamed');
    } catch { toast.error('Failed to rename'); }
  };

  const handleDelete = async () => {
    if (!user || !farm) return;
    try {
      await deleteFarm(user.uid, farm.id);
      toast.success(t('farms.deletedone'));
      navigate('/farms');
    } catch { toast.error('Failed to delete field'); }
  };

  const handleSaveNote = async () => {
    if (!user || !farm) return;
    try {
      setSaving(true);
      await updateFarm(user.uid, farm.id, { notes: note } as any);
      toast.success(t('detail.notesaved'));
    } catch { toast.error('Failed to save note'); }
    finally { setSaving(false); }
  };

  const handleExport = (format: string) => {
    if (!farm?.geometry?.vertices) return;
    const vertices = farm.geometry.vertices as Array<{ lat: number; lng: number }>;
    const coords = vertices.map((v: any) => [v.lng, v.lat]);
    coords.push(coords[0]);

    if (format === 'geojson') {
      const content = JSON.stringify({
        type: 'Feature',
        properties: { name: farm.name, areaHa: farm.areaHa, cropType: farm.cropType },
        geometry: { type: 'Polygon', coordinates: [coords] },
      }, null, 2);
      downloadFile(content, `${farm.name.replace(/\s+/g, '_')}.geojson`, 'application/geo+json');
      toast.success('Exported as GeoJSON');
    } else if (format === 'kml') {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>${farm.name}</name>
      <description>Area: ${farm.areaHa.toFixed(4)} ha</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coords.map((c: number[]) => c.join(',')).join(' ')}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;
      downloadFile(content, `${farm.name.replace(/\s+/g, '_')}.kml`, 'application/vnd.google-earth.kml+xml');
      toast.success('Exported as KML');
    } else if (format === 'csv') {
      const header = 'lat,lon,point_number\n';
      const rows = vertices.map((v: any, i: number) => `${v.lat},${v.lng},${i + 1}`).join('\n');
      downloadFile(header + rows, `${farm.name.replace(/\s+/g, '_')}.csv`, 'text/csv');
      toast.success('Exported as CSV');
    } else if (format === 'report') {
      const center = farm.geometry.center as { lat: number; lng: number } | undefined;
      const html = `<!DOCTYPE html>
<html><head><title>${farm.name} - Field Report</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; color: #1E293B; }
h1 { color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
table { width: 100%; border-collapse: collapse; margin-top: 20px; }
th { background: #EFF6FF; text-align: left; padding: 10px; border: 1px solid #E2E8F0; }
td { padding: 10px; border: 1px solid #E2E8F0; }
.footer { margin-top: 30px; font-size: 12px; color: #94A3B8; }
</style></head><body>
<h1>${farm.name}</h1>
<p>Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
<table>
<tr><th>Property</th><th>Value</th></tr>
<tr><td>Crop Type</td><td>${farm.cropType || 'Not set'}</td></tr>
<tr><td>Area</td><td>${farm.areaHa.toFixed(4)} ha (${(farm.areaHa * 2.47105).toFixed(4)} acres, ${(farm.areaHa * 10000).toFixed(1)} m²)</td></tr>
<tr><td>Coordinates</td><td>${center ? `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}` : 'N/A'}</td></tr>
<tr><td>Vertices</td><td>${vertices.length}</td></tr>
<tr><td>Created</td><td>${formatDate(farm.createdAt)}</td></tr>
</table>
<p class="footer">KhetMap — Free Satellite Field Analysis</p>
</body></html>`;
      downloadFile(html, `${farm.name.replace(/\s+/g, '_')}_report.html`, 'text/html');
      toast.success('Report exported (open in browser, print as PDF)');
    }
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  // Generate shareable web link
  const handleShareLink = async () => {
    if (!farm?.geometry?.vertices) return;
    const data = {
      name: farm.name,
      vertices: farm.geometry.vertices,
      center: farm.geometry.center,
      areaHa: farm.areaHa,
    };
    const encoded = btoa(JSON.stringify(data));
    const shareUrl = `${window.location.origin}/map?import=${encoded}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  if (loading) {
    return (<div className="h-full flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
    </div>);
  }

  if (!farm) {
    return (<div className="h-full flex flex-col items-center justify-center bg-[#F8FAFC] px-6">
      <AlertTriangle size={40} className="text-[#94A3B8]" />
      <p className="text-[#1E293B] mt-4 text-lg font-semibold">Field not found</p>
      <button onClick={() => navigate('/farms')} className="mt-4 text-sm text-[#2563EB] underline">Back to my fields</button>
    </div>);
  }

  const vertices = farm.geometry?.vertices as Array<{ lat: number; lng: number }> | undefined;
  const center = farm.geometry?.center as { lat: number; lng: number } | undefined;

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] overflow-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => navigate('/farms')}
          className="w-9 h-9 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#475569] hover:bg-[#F8FAFC] transition-colors shadow-sm">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          {editingName ? (
            <div className="flex gap-2">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="w-full bg-white border border-[#2563EB] rounded-lg px-3 py-1.5 text-lg font-bold text-[#1E293B] outline-none box-border" />
              <button onClick={handleRename}
                className="px-3 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition-colors">Save</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#1E293B] truncate">{farm.name}</h1>
              <button onClick={() => { setNewName(farm.name); setEditingName(true); }}
                className="text-[#94A3B8] hover:text-[#2563EB] transition-colors">
                <Edit3 size={14} />
              </button>
            </div>
          )}
        </div>
        <button onClick={() => setShowDelete(true)}
          className="w-9 h-9 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444] hover:bg-[#FEE2E2] transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="px-5 pb-6 space-y-4">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white rounded-xl p-3 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Ruler size={12} className="text-[#2563EB]" />
              <span className="text-[9px] text-[#64748B] uppercase tracking-wider font-medium">Area</span>
            </div>
            <p className="text-sm font-bold text-[#2563EB]">{formatArea(farm.areaHa)}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Leaf size={12} className="text-[#2563EB]" />
              <span className="text-[9px] text-[#64748B] uppercase tracking-wider font-medium">Crop</span>
            </div>
            <p className="text-sm font-bold text-[#1E293B]">{farm.cropType || 'Not set'}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar size={12} className="text-[#2563EB]" />
              <span className="text-[9px] text-[#64748B] uppercase tracking-wider font-medium">Created</span>
            </div>
            <p className="text-sm font-bold text-[#1E293B]">{formatDate(farm.createdAt)}</p>
          </div>
        </div>

        {/* Coordinates */}
        {center && (
          <div className="bg-white rounded-xl p-3 border border-[#E2E8F0] shadow-sm flex items-center gap-3">
            <MapPin size={16} className="text-[#2563EB]" />
            <div>
              <p className="text-[10px] text-[#64748B] font-medium">Coordinates</p>
              <p className="text-xs text-[#1E293B] font-mono">{center.lat.toFixed(6)}, {center.lng.toFixed(6)}</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button onClick={() => navigate(`/map?focus=${farm.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition-colors shadow-sm">
            <MapPin size={14} /> Locate on Map
          </button>
          <button onClick={() => navigate(`/map?analysis=ndvi&focus=${farm.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg text-xs font-semibold hover:bg-[#DBEAFE] transition-colors">
            <Globe size={14} /> Analyze NDVI
          </button>
          <button onClick={() => setShowAnalysis(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg text-xs font-semibold hover:bg-[#DBEAFE] transition-colors">
            <FlaskConical size={14} /> Deep Analysis
          </button>
        </div>

        {/* NDVI History */}
        {vertices && vertices.length >= 3 && (
          <NDVIHistoryChart fieldName={farm.name} />
        )}

        {/* Notes */}
        <div>
          <label className="text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase mb-2 block">Notes</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about this field..."
            rows={3}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-sm text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all resize-vertical font-inherit box-border" />
          {note && (
            <button onClick={handleSaveNote} disabled={saving}
              className={`mt-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                saving ? 'bg-[#E2E8F0] text-[#94A3B8]' : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
              }`}>
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          )}
        </div>

        {/* Export */}
        <div>
          <label className="text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase mb-2 block">Export</label>
          <div className="flex flex-wrap gap-2">
            {[
              { format: 'geojson', label: 'GeoJSON', icon: FileDown },
              { format: 'kml', label: 'KML', icon: Globe },
              { format: 'csv', label: 'CSV', icon: Download },
              { format: 'report', label: 'Report (PDF)', icon: FileDown },
            ].map(({ format, label, icon: Icon }) => (
              <button key={format} onClick={() => handleExport(format)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#475569] hover:bg-[#F8FAFC] hover:border-[#93C5FD] transition-all shadow-sm">
                <Icon size={14} /> {label}
              </button>
            ))}
            <button onClick={handleShareLink}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#475569] hover:bg-[#F8FAFC] hover:border-[#93C5FD] transition-all shadow-sm">
              🔗 Share Link
            </button>
          </div>
        </div>

        {/* Vertices info */}
        {vertices && (
          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
            <p className="text-[10px] text-[#64748B] font-medium">Field Vertices ({vertices.length})</p>
            <div className="mt-1.5 grid grid-cols-2 gap-1 max-h-32 overflow-auto">
              {vertices.map((v, i) => (
                <span key={i} className="text-[10px] text-[#475569] font-mono">
                  {i + 1}: {v.lat.toFixed(6)}, {v.lng.toFixed(6)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Deep Field Analysis Modal */}
      {showAnalysis && vertices && vertices.length >= 3 && (
        <FieldAnalysisReport
          fieldName={farm.name}
          vertices={vertices}
          areaHa={farm.areaHa}
          onClose={() => setShowAnalysis(false)}
        />
      )}

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] w-[85%] max-w-[320px] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center">
                <AlertTriangle size={20} className="text-[#EF4444]" />
              </div>
              <h3 className="text-lg font-bold text-[#1E293B]">Delete "{farm.name}"?</h3>
            </div>
            <p className="text-sm text-[#64748B] mb-6">This will permanently delete this field and all its data.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#475569] text-sm font-medium hover:bg-[#F8FAFC] transition-colors">Cancel</button>
              <button onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-[#EF4444] text-white text-sm font-semibold hover:bg-[#DC2626] transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
