import { useState } from 'react';
import { X, MapPin, Leaf, Ruler, Check } from 'lucide-react';

interface Vertex {
  lat: number;
  lng: number;
}

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

const COLORS = {
  bg: '#0A1F0A',
  surface: '#0D2818',
  card: '#132A1A',
  border: '#1B4D2E',
  accent: '#52B788',
  text: '#E8F5E9',
  textSecondary: '#A5D6A7',
  textMuted: '#6B8E6B',
};

export default function SaveFieldModal({ vertices, areaHa, center, onSave, onCancel, isSaving }: SaveFieldModalProps) {
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('');

  const formatArea = (ha: number) => {
    if (ha < 0.01) return `${(ha * 10000).toFixed(0)} m²`;
    if (ha < 1) return `${(ha * 100).toFixed(1)} cents`;
    return `${ha.toFixed(2)} ha`;
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), cropType);
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: COLORS.card,
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        width: '90%',
        maxWidth: 360,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 20px 0',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.text }}>
              Save Field
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: COLORS.textMuted }}>
              {vertices.length} points drawn
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              width: 32, height: 32,
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              color: COLORS.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '16px 20px 0',
        }}>
          <div style={{
            flex: 1,
            background: COLORS.surface,
            borderRadius: 10,
            padding: '10px 12px',
            border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Ruler size={14} color={COLORS.accent} />
              <span style={{ fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Area</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.accent }}>
              {formatArea(areaHa)}
            </span>
          </div>
          <div style={{
            flex: 1,
            background: COLORS.surface,
            borderRadius: 10,
            padding: '10px 12px',
            border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <MapPin size={14} color={COLORS.accent} />
              <span style={{ fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Center</span>
            </div>
            <span style={{ fontSize: 11, color: COLORS.text, fontFamily: 'monospace' }}>
              {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Name input */}
        <div style={{ padding: '16px 20px 0' }}>
          <label style={{
            fontSize: 11,
            fontWeight: 600,
            color: COLORS.textSecondary,
            marginBottom: 6,
            display: 'block',
          }}>
            Field Name *
          </label>
          <input
            type="text"
            placeholder="e.g., North Paddy Field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              height: 46,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: '0 14px',
              fontSize: 14,
              color: COLORS.text,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>

        {/* Crop type selector */}
        <div style={{ padding: '16px 20px 0' }}>
          <label style={{
            fontSize: 11,
            fontWeight: 600,
            color: COLORS.textSecondary,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <Leaf size={14} color={COLORS.accent} />
            Crop Type (optional)
          </label>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}>
            {CROP_TYPES.map(crop => (
              <button
                key={crop}
                onClick={() => setCropType(crop === cropType ? '' : crop)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: cropType === crop ? 600 : 400,
                  background: cropType === crop ? COLORS.accent : COLORS.surface,
                  color: cropType === crop ? COLORS.bg : COLORS.textMuted,
                  border: `1px solid ${cropType === crop ? COLORS.accent : COLORS.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '20px',
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              color: COLORS.text,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 10,
              border: 'none',
              background: COLORS.accent,
              color: COLORS.bg,
              fontSize: 14,
              fontWeight: 600,
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              opacity: name.trim() ? 1 : 0.4,
            }}
          >
            {isSaving ? (
              <div style={{
                width: 18, height: 18,
                border: '2px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            ) : (
              <>
                <Check size={18} />
                Save Field
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
