import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MapPin, Leaf, Ruler, Calendar, FileDown, Download, Edit3, Trash2, Globe, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { subscribeToFarms, deleteFarm, updateFarm, Farm } from '../../services/database';
import NDVIHistoryChart from '../components/NDVIHistoryChart';
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
    if (ha < 0.01) return `${(ha * 10000).toFixed(0)} m²`;
    if (ha < 1) return `${(ha * 100).toFixed(1)} cents`;
    return `${ha.toFixed(2)} ha (${(ha * 2.471).toFixed(2)} acres)`;
  };

  const handleRename = async () => {
    if (!user || !farm || !newName.trim()) return;
    try {
      await updateFarm(user.uid, farm.id, { name: newName.trim() } as any);
      setEditingName(false);
      toast.success('Field renamed');
    } catch {
      toast.error('Failed to rename');
    }
  };

  const handleDelete = async () => {
    if (!user || !farm) return;
    try {
      await deleteFarm(user.uid, farm.id);
      toast.success(t('farms.deletedone'));
      navigate('/farms');
    } catch {
      toast.error('Failed to delete field');
    }
  };

  const handleSaveNote = async () => {
    if (!user || !farm) return;
    try {
      setSaving(true);
      await updateFarm(user.uid, farm.id, { notes: note } as any);
      toast.success(t('detail.notesaved'));
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = (format: 'geojson' | 'kml' | 'csv') => {
    if (!farm?.geometry?.vertices) return;
    const vertices = farm.geometry.vertices as Array<{ lat: number; lng: number }>;
    const coords = vertices.map(v => [v.lng, v.lat]);
    // Close polygon
    coords.push(coords[0]);

    let content = '';
    let filename = '';
    let mime = '';

    if (format === 'geojson') {
      content = JSON.stringify({
        type: 'Feature',
        properties: { name: farm.name, areaHa: farm.areaHa, cropType: farm.cropType },
        geometry: { type: 'Polygon', coordinates: [coords] },
      }, null, 2);
      filename = `${farm.name.replace(/\s+/g, '_')}.geojson`;
      mime = 'application/geo+json';
    } else if (format === 'kml') {
      content = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>${farm.name}</name>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coords.map(c => c.join(',')).join(' ')}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;
      filename = `${farm.name.replace(/\s+/g, '_')}.kml`;
      mime = 'application/vnd.google-earth.kml+xml';
    } else {
      const header = 'lat,lon\n';
      const rows = vertices.map(v => `${v.lat},${v.lng}`).join('\n');
      content = header + rows;
      filename = `${farm.name.replace(/\s+/g, '_')}.csv`;
      mime = 'text/csv';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('detail.exported'));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0A1F0A]">
        <div className="w-8 h-8 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0A1F0A] px-6">
        <AlertTriangle size={40} color="#6B8E6B" />
        <p className="text-[#E8F5E9] mt-4 text-lg font-semibold">Field not found</p>
        <button onClick={() => navigate('/farms')} className="mt-4 text-sm text-[#52B788] underline">
          Back to my fields
        </button>
      </div>
    );
  }

  const vertices = farm.geometry?.vertices as Array<{ lat: number; lng: number }> | undefined;
  const center = farm.geometry?.center as { lat: number; lng: number } | undefined;

  return (
    <div className="h-full flex flex-col bg-[#0A1F0A] overflow-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/farms')}
          className="w-9 h-9 rounded-lg bg-[#0D2818] border border-[#1B4D2E] flex items-center justify-center text-[#A5D6A7] hover:bg-[#1A3A2A] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          {editingName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                style={{
                  background: '#0D2818',
                  border: '1px solid #52B788',
                  borderRadius: 8,
                  padding: '6px 10px',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#E8F5E9',
                  outline: 'none',
                  width: '100%',
                }}
              />
              <button
                onClick={handleRename}
                style={{
                  background: '#52B788',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#0A1F0A',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#E8F5E9] truncate">{farm.name}</h1>
              <button
                onClick={() => { setNewName(farm.name); setEditingName(true); }}
                className="text-[#6B8E6B] hover:text-[#52B788] transition-colors"
              >
                <Edit3 size={14} />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowDelete(true)}
          className="w-9 h-9 rounded-lg bg-[#EF5350]/10 border border-[#EF5350]/30 flex items-center justify-center text-[#EF5350] hover:bg-[#EF5350]/20 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="px-5 pb-6 space-y-4">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-[#132A1A] rounded-xl p-3 border border-[#1B4D2E]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Ruler size={12} color="#52B788" />
              <span className="text-[9px] text-[#6B8E6B] uppercase tracking-wider">{t('detail.area')}</span>
            </div>
            <p className="text-sm font-bold text-[#52B788]">{formatArea(farm.areaHa)}</p>
          </div>
          <div className="bg-[#132A1A] rounded-xl p-3 border border-[#1B4D2E]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Leaf size={12} color="#52B788" />
              <span className="text-[9px] text-[#6B8E6B] uppercase tracking-wider">{t('detail.crop')}</span>
            </div>
            <p className="text-sm font-bold text-[#E8F5E9]">{farm.cropType || t('farms.notset')}</p>
          </div>
          <div className="bg-[#132A1A] rounded-xl p-3 border border-[#1B4D2E]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar size={12} color="#52B788" />
              <span className="text-[9px] text-[#6B8E6B] uppercase tracking-wider">{t('detail.created')}</span>
            </div>
            <p className="text-sm font-bold text-[#E8F5E9]">{formatDate(farm.createdAt)}</p>
          </div>
        </div>

        {/* Coordinates */}
        {center && (
          <div className="bg-[#0D2818] rounded-xl p-3 border border-[#1B4D2E] flex items-center gap-3">
            <MapPin size={16} color="#52B788" />
            <div>
              <p className="text-[10px] text-[#6B8E6B]">{t('detail.coordinates')}</p>
              <p className="text-xs text-[#E8F5E9] font-mono">
                {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/map?focus=${farm.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#52B788] text-[#0A1F0A] rounded-lg text-xs font-semibold hover:bg-[#40916C] transition-colors"
          >
            <MapPin size={14} />
            {t('farms.locate')}
          </button>
          <button
            onClick={() => navigate(`/map?analysis=ndvi&focus=${farm.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#52B788]/10 text-[#52B788] rounded-lg text-xs font-semibold hover:bg-[#52B788]/20 transition-colors"
          >
            <Globe size={14} />
            {t('farms.analyze')}
          </button>
        </div>

        {/* NDVI History Chart */}
        {vertices && vertices.length >= 3 && (
          <NDVIHistoryChart fieldName={farm.name} />
        )}

        {/* Notes */}
        <div>
          <label className="text-[10px] font-semibold text-[#6B8E6B] tracking-widest uppercase mb-2 block">
            {t('detail.notes')}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('detail.placeholder')}
            rows={3}
            style={{
              width: '100%',
              background: '#0D2818',
              border: '1px solid #1B4D2E',
              borderRadius: 10,
              padding: 12,
              fontSize: 13,
              color: '#E8F5E9',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          {note && (
            <button
              onClick={handleSaveNote}
              disabled={saving}
              style={{
                marginTop: 8,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#52B788',
                color: '#0A1F0A',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? t('common.saving') : t('detail.savenote')}
            </button>
          )}
        </div>

        {/* Export */}
        <div>
          <label className="text-[10px] font-semibold text-[#6B8E6B] tracking-widest uppercase mb-2 block">
            Export
          </label>
          <div className="flex gap-2">
            {[
              { format: 'geojson' as const, label: 'GeoJSON', icon: FileDown },
              { format: 'kml' as const, label: 'KML', icon: Globe },
              { format: 'csv' as const, label: 'CSV', icon: Download },
            ].map(({ format, label, icon: Icon }) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#0D2818] border border-[#1B4D2E] rounded-lg text-xs text-[#A5D6A7] hover:bg-[#1A3A2A] transition-colors"
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#132A1A', borderRadius: 16,
            border: '1px solid #EF5350/30',
            width: '85%', maxWidth: 320,
            padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#EF5350]/15 flex items-center justify-center">
                <AlertTriangle size={20} color="#EF5350" />
              </div>
              <h3 className="text-lg font-bold text-[#E8F5E9]" style={{ margin: 0 }}>
                Delete "{farm.name}"?
              </h3>
            </div>
            <p className="text-sm text-[#6B8E6B] mb-6" style={{ margin: '0 0 20px' }}>
              This will permanently delete this field and all its analysis data.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 py-3 rounded-xl border border-[#1B4D2E] bg-[#0D2818] text-[#E8F5E9] text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl border-none bg-[#EF5350] text-white text-sm font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
