import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, Check, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ParsedField {
  name: string;
  vertices: { lat: number; lng: number }[];
  areaHa?: number;
}

interface KMLUploaderProps {
  onFieldsParsed: (fields: ParsedField[]) => void;
  onClose: () => void;
}

// ─── KML Parser ──────────────────────────────────────────────────
function parseKML(text: string): ParsedField[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const placemarks = Array.from(doc.querySelectorAll('Placemark'));
  const fields: ParsedField[] = [];

  for (const pm of placemarks) {
    const name = pm.querySelector('name')?.textContent || 'Imported Field';
    const coordsEl = pm.querySelector('coordinates');
    if (!coordsEl) continue;

    const raw = coordsEl.textContent?.trim() || '';
    const vertices = raw
      .split(/\s+/)
      .map(c => {
        const parts = c.split(',');
        if (parts.length < 2) return null;
        const lng = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        if (isNaN(lat) || isNaN(lng)) return null;
        return { lat, lng };
      })
      .filter(Boolean) as { lat: number; lng: number }[];

    if (vertices.length >= 3) {
      fields.push({ name, vertices });
    }
  }
  return fields;
}

// ─── GeoJSON Parser ───────────────────────────────────────────────
function parseGeoJSON(text: string): ParsedField[] {
  const geo = JSON.parse(text);
  const fields: ParsedField[] = [];

  const processGeometry = (name: string, geometry: any) => {
    if (!geometry) return;
    let coords: number[][] = [];

    if (geometry.type === 'Polygon') {
      coords = geometry.coordinates[0];
    } else if (geometry.type === 'MultiPolygon') {
      coords = geometry.coordinates[0][0];
    }

    const vertices = coords.map(([lng, lat]) => ({ lat, lng })).filter(v => !isNaN(v.lat));
    if (vertices.length >= 3) fields.push({ name, vertices });
  };

  if (geo.type === 'FeatureCollection') {
    geo.features?.forEach((f: any, i: number) => {
      processGeometry(f.properties?.name || `Field ${i + 1}`, f.geometry);
    });
  } else if (geo.type === 'Feature') {
    processGeometry(geo.properties?.name || 'Imported Field', geo.geometry);
  }

  return fields;
}

// ─── CSV Parser ───────────────────────────────────────────────────
function parseCSV(text: string): ParsedField[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const latIdx = header.findIndex(h => h.includes('lat'));
  const lngIdx = header.findIndex(h => h.includes('lng') || h.includes('lon'));

  if (latIdx === -1 || lngIdx === -1) return [];

  const vertices = lines.slice(1).map(line => {
    const parts = line.split(',');
    return {
      lat: parseFloat(parts[latIdx]),
      lng: parseFloat(parts[lngIdx]),
    };
  }).filter(v => !isNaN(v.lat) && !isNaN(v.lng));

  return vertices.length >= 3 ? [{ name: 'Imported Field (CSV)', vertices }] : [];
}

export default function KMLUploader({ onFieldsParsed, onClose }: KMLUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parsed, setParsed] = useState<ParsedField[] | null>(null);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
      let fields: ParsedField[] = [];
      if (ext === 'kml') fields = parseKML(text);
      else if (ext === 'geojson' || ext === 'json') fields = parseGeoJSON(text);
      else if (ext === 'csv') fields = parseCSV(text);
      else { toast.error('Unsupported format. Use .kml, .geojson, or .csv'); return; }

      if (fields.length === 0) { toast.error('No valid field boundaries found in file'); return; }
      setParsed(fields);
      toast.success(`${fields.length} field(s) found in file`);
    } catch {
      toast.error('Could not read file. Check format and try again.');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleConfirm = () => {
    if (parsed) {
      onFieldsParsed(parsed);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-end"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full bg-[#0A1F0A] border-t border-[#1B4D2E] rounded-t-3xl p-6"
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-[#1B4D2E] rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[#E8F5E9] font-bold text-lg">Import Field</h3>
            <p className="text-[#6B8E6B] text-xs">KML · GeoJSON · CSV supported</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0D2818] text-[#6B8E6B] hover:text-[#E8F5E9] transition-colors">
            <X size={16} />
          </button>
        </div>

        {!parsed ? (
          <>
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging ? 'border-[#52B788] bg-[#52B788]/10' : 'border-[#1B4D2E] hover:border-[#52B788]/50'
              }`}
            >
              <Upload size={32} className="mx-auto text-[#52B788] mb-3" />
              <p className="text-[#E8F5E9] font-medium text-sm mb-1">Drag & drop your field file</p>
              <p className="text-[#6B8E6B] text-xs">or tap to browse</p>
              <div className="flex justify-center gap-2 mt-4">
                {['.kml', '.geojson', '.csv'].map(ext => (
                  <span key={ext} className="text-xs px-2.5 py-1 rounded-full bg-[#0D2818] border border-[#1B4D2E] text-[#95D5B2]">{ext}</span>
                ))}
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".kml,.geojson,.json,.csv"
              className="hidden"
              onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}
            />

            <p className="text-center text-[#3A5A3A] text-xs mt-4">
              Export from Google My Maps, QGIS, Copernicus, or any GIS tool
            </p>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-[#0D2818] border border-[#1B4D2E] rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#52B788]/20 flex items-center justify-center">
                  <FileText size={16} className="text-[#52B788]" />
                </div>
                <div>
                  <p className="text-[#E8F5E9] text-sm font-medium">{fileName}</p>
                  <p className="text-[#52B788] text-xs">{parsed.length} field{parsed.length > 1 ? 's' : ''} detected</p>
                </div>
              </div>
              {parsed.map((f, i) => (
                <div key={i} className="flex items-center gap-2 py-2 border-t border-[#1B4D2E]/50">
                  <Map size={14} className="text-[#6B8E6B]" />
                  <span className="text-[#95D5B2] text-xs flex-1">{f.name}</span>
                  <span className="text-[#6B8E6B] text-xs">{f.vertices.length} points</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setParsed(null)} className="flex-1 py-3 rounded-xl bg-[#0D2818] border border-[#1B4D2E] text-[#6B8E6B] text-sm hover:border-[#52B788] transition-colors">
                Try another file
              </button>
              <button onClick={handleConfirm} className="flex-1 py-3 rounded-xl bg-[#52B788] text-[#0A1F0A] font-bold text-sm hover:bg-[#40916C] transition-all flex items-center justify-center gap-2">
                <Check size={16} />
                Add to Map
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
