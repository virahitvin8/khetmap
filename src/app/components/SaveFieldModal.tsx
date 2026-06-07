import { useState } from 'react';
import { X, MapPin, Leaf, Ruler, Check } from 'lucide-react';

interface Vertex { lat: number; lng: number; }

interface SaveFieldModalProps {
  vertices: Vertex[];
  areaHa: number;
  center: Vertex;
  onSave: (name: string, cropType: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const CROP_TYPES = [
  'Paddy', 'Wheat', 'Maize', 'Cotton', 'Sugarcane',
  'Groundnut', 'Pulses', 'Vegetables', 'Fruits', 'Mixed', 'Other',
];

export default function SaveFieldModal({ vertices, areaHa, center, onSave, onCancel, isSaving }: SaveFieldModalProps) {
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('');

  const formatArea = (ha: number) => {
    if (ha < 0.001) return `${(ha * 10000).toFixed(1)} m²`;
    if (ha < 1) return `${(ha * 100).toFixed(2)} cents`;
    return `${ha.toFixed(4)} ha`;
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), cropType);
  };

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] w-[90%] max-w-[360px] max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-5 pb-0">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B] m-0">Save Field</h2>
            <p className="text-xs text-[#64748B] mt-1">{vertices.length} points drawn</p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#94A3B8] flex items-center justify-center hover:bg-[#F8FAFC] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-2 px-5 pt-4">
          <div className="flex-1 bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
            <div className="flex items-center gap-1.5 mb-1">
              <Ruler size={14} className="text-[#2563EB]" />
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium">Area</span>
            </div>
            <span className="text-base font-bold text-[#2563EB]">{formatArea(areaHa)}</span>
          </div>
          <div className="flex-1 bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={14} className="text-[#2563EB]" />
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-medium">Center</span>
            </div>
            <span className="text-[11px] text-[#1E293B] font-mono">{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</span>
          </div>
        </div>

        {/* Name input */}
        <div className="px-5 pt-4">
          <label className="text-xs font-semibold text-[#475569] mb-1.5 block">Field Name *</label>
          <input
            type="text"
            placeholder="e.g., North Rice Field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full h-11 border border-[#E2E8F0] rounded-xl px-3.5 text-sm text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all box-border"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>

        {/* Crop type selector */}
        <div className="px-5 pt-4">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#475569] mb-2">
            <Leaf size={14} className="text-[#2563EB]" />
            Crop Type (optional)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CROP_TYPES.map(crop => (
              <button
                key={crop}
                onClick={() => setCropType(crop === cropType ? '' : crop)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  cropType === crop
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#93C5FD]'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 p-5">
          <button onClick={onCancel}
            className="flex-1 h-11 rounded-xl border border-[#E2E8F0] bg-white text-[#475569] text-sm font-medium hover:bg-[#F8FAFC] transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!name.trim() || isSaving}
            className={`flex-1 h-11 rounded-xl border-none text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
              name.trim() && !isSaving
                ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm'
                : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
            }`}>
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Check size={18} /> Save Field</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
