import { useState, useRef, useCallback, useMemo } from 'react';

interface Vertex {
  lat: number;
  lng: number;
}

interface ParsedField {
  name: string;
  vertices: Vertex[];
}

interface FileUploadProps {
  onFieldsParsed: (fields: ParsedField[]) => void;
  onClose: () => void;
}

function parseKML(xmlText: string): ParsedField[] {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');

  // Namespace-agnostic: find all elements whose local name is 'Placemark'
  const placemarks = Array.from(xml.querySelectorAll('*')).filter(
    el => el.tagName === 'Placemark' || el.tagName.endsWith(':Placemark')
  );

  const fields: ParsedField[] = [];

  placemarks.forEach((pm: Element) => {
    const nameEl = pm.querySelector('name') || pm.querySelector('*');
    const name = nameEl?.textContent?.trim() || 'Imported Field';

    // Namespace-agnostic coords query
    const coordsEl = Array.from(pm.querySelectorAll('*')).find(
      el => el.tagName === 'coordinates' || el.tagName.endsWith(':coordinates')
    );
    if (!coordsEl?.textContent) return;

    const coordPairs = coordsEl.textContent.trim().split(/\s+/);
    const vertices: Vertex[] = [];

    coordPairs.forEach((pair: string) => {
      const [lng, lat] = pair.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        vertices.push({ lat, lng });
      }
    });

    if (vertices.length >= 3) {
      fields.push({ name, vertices });
    }
  });

  return fields;
}

function parseCSV(csvText: string): ParsedField[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(',');
  const latIdx = headers.findIndex(h => h.includes('lat'));
  const lngIdx = headers.findIndex(h => h.includes('lon') || h.includes('lng'));
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('field'));

  if (latIdx === -1 || lngIdx === -1) return [];

  const vertices: Vertex[] = [];
  let name = 'CSV Field';

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const lat = parseFloat(cols[latIdx]?.trim());
    const lng = parseFloat(cols[lngIdx]?.trim());

    if (!isNaN(lat) && !isNaN(lng)) {
      vertices.push({ lat, lng });
    }
  }

  if (vertices.length >= 3) {
    return [{ name, vertices }];
  }
  return [];
}

export default function FileUpload({ onFieldsParsed, onClose }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedFields, setParsedFields] = useState<ParsedField[]>([]);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setErrorMsg('');
    setParsedFields([]);
    const ext = file.name.split('.').pop()?.toLowerCase();
    const text = await file.text();

    try {
      let fields: ParsedField[] = [];

      if (ext === 'kml') {
        fields = parseKML(text);
      } else if (ext === 'csv') {
        fields = parseCSV(text);
      } else if (ext === 'geojson' || ext === 'json') {
        const geo = JSON.parse(text);
        if (geo.features) {
          geo.features.forEach((f: any) => {
            if (f.geometry?.type === 'Polygon') {
              const coords = f.geometry.coordinates[0];
              const vertices = coords.map((c: number[]) => ({
                lat: c[1],
                lng: c[0],
              }));
              if (vertices.length >= 3) {
                fields.push({
                  name: f.properties?.name || f.properties?.Name || 'GeoJSON Field',
                  vertices,
                });
              }
            }
          });
        }
      } else {
        return; // Unsupported format
      }

      if (fields.length > 0) {
        setParsedFields(fields);
      } else {
        setErrorMsg('No valid field boundaries found. Check your file format.');
      }
    } catch {
      setErrorMsg('Failed to parse file. Supported formats: KML, CSV, GeoJSON');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleImport = () => {
    if (parsedFields.length > 0) {
      onFieldsParsed(parsedFields);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#132A1A',
        borderRadius: 16,
        border: '1px solid #1B4D2E',
        width: '90%',
        maxWidth: 400,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        padding: 24,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#E8F5E9' }}>
              Import Field Data
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6B8E6B' }}>
              KML · CSV · GeoJSON
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32,
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
            <X size={16} />
          </button>
        </div>

        {/* Drop zone */}
        {parsedFields.length === 0 ? (
          <>
            {errorMsg && (
              <div style={{
                background: 'rgba(239,83,80,0.1)',
                border: '1px solid rgba(239,83,80,0.3)',
                borderRadius: 8,
                padding: '8px 12px',
                marginBottom: 12,
                fontSize: 12,
                color: '#EF5350',
              }}>
                {errorMsg}
              </div>
            )}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? '#52B788' : '#1B4D2E'}`,
                borderRadius: 12,
                padding: 40,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: isDragging ? 'rgba(82,183,136,0.08)' : 'transparent',
              }}
            >
              <Upload size={36} color={isDragging ? '#52B788' : '#6B8E6B'} style={{ marginBottom: 12 }} />
              <p style={{ margin: 0, fontSize: 13, color: '#E8F5E9', fontWeight: 500 }}>
                Drag & drop your file here, or click to browse
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 10, color: '#6B8E6B' }}>
                Supports: .kml .csv .geojson
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".kml,.csv,.geojson,.json"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />

            <div style={{
              display: 'flex',
              gap: 6,
              marginTop: 16,
              padding: '12px 14px',
              background: '#0D2818',
              borderRadius: 10,
              border: '1px solid #1B4D2E',
            }}>
              <FileText size={16} color="#6B8E6B" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: 0, fontSize: 11, color: '#A5D6A7', lineHeight: 1.5 }}>
                  <strong>KML:</strong> Google Earth polygons (any namespace)<br />
                  <strong>CSV:</strong> Columns named <em>lat</em>, <em>lon</em>/<em>lng</em><br />
                  <strong>GeoJSON:</strong> Polygon FeatureCollection
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Parsed results */
          <div>
            <div style={{
              background: 'rgba(82,183,136,0.1)',
              border: '1px solid rgba(82,183,136,0.3)',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <Check size={18} color="#52B788" />
              <div>
                <p style={{ margin: 0, fontSize: 13, color: '#52B788', fontWeight: 600 }}>
                  {parsedFields.length} field(s) found in {fileName}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6B8E6B' }}>
                  {parsedFields.map(f => f.name).join(', ')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setParsedFields([]); setFileName(''); }}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  border: '1px solid #1B4D2E',
                  background: '#0D2818',
                  color: '#E8F5E9',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Choose Another
              </button>
              <button
                onClick={handleImport}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  border: 'none',
                  background: '#52B788',
                  color: '#0A1F0A',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Check size={16} />
                Import Fields
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}

function Upload({ size, color }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function FileText({ size, color, style: _style }: { size: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );
}

function Check({ size, color }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
