import { useState, useRef, useCallback } from 'react';
import { X, Upload, Check, FileText } from 'lucide-react';

interface Vertex { lat: number; lng: number; }
interface ParsedField { name: string; vertices: Vertex[]; }
interface FileUploadProps {
  onFieldsParsed: (fields: ParsedField[]) => void;
  onClose: () => void;
}

function parseKML(xmlText: string): ParsedField[] {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');
  const placemarks = Array.from(xml.querySelectorAll('*')).filter(
    el => el.tagName === 'Placemark' || el.tagName.endsWith(':Placemark')
  );
  const fields: ParsedField[] = [];
  placemarks.forEach((pm: Element) => {
    const nameEl = pm.querySelector('name') || pm.querySelector('*');
    const name = nameEl?.textContent?.trim() || 'Imported Field';
    const coordsEl = Array.from(pm.querySelectorAll('*')).find(
      el => el.tagName === 'coordinates' || el.tagName.endsWith(':coordinates')
    );
    if (!coordsEl?.textContent) return;
    const coordPairs = coordsEl.textContent.trim().split(/\s+/);
    const vertices: Vertex[] = [];
    coordPairs.forEach((pair: string) => {
      const [lng, lat] = pair.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) vertices.push({ lat, lng });
    });
    if (vertices.length >= 3) fields.push({ name, vertices });
  });
  return fields;
}

function parseCSV(csvText: string): ParsedField[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].toLowerCase().split(',');
  const latIdx = headers.findIndex(h => h.includes('lat'));
  const lngIdx = headers.findIndex(h => h.includes('lon') || h.includes('lng'));
  if (latIdx === -1 || lngIdx === -1) return [];
  const vertices: Vertex[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const lat = parseFloat(cols[latIdx]?.trim());
    const lng = parseFloat(cols[lngIdx]?.trim());
    if (!isNaN(lat) && !isNaN(lng)) vertices.push({ lat, lng });
  }
  return vertices.length >= 3 ? [{ name: 'CSV Field', vertices }] : [];
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
      if (ext === 'kml') fields = parseKML(text);
      else if (ext === 'csv') fields = parseCSV(text);
      else if (ext === 'geojson' || ext === 'json') {
        const geo = JSON.parse(text);
        if (geo.features) {
          geo.features.forEach((f: any) => {
            if (f.geometry?.type === 'Polygon') {
              const coords = f.geometry.coordinates[0];
              const vertices = coords.map((c: number[]) => ({ lat: c[1], lng: c[0] }));
              if (vertices.length >= 3) {
                fields.push({ name: f.properties?.name || 'GeoJSON Field', vertices });
              }
            }
          });
        }
      }
      if (fields.length > 0) setParsedFields(fields);
      else setErrorMsg('No valid field boundaries found.');
    } catch {
      setErrorMsg('Failed to parse file. Supported: KML, CSV, GeoJSON');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] w-[90%] max-w-[400px] max-h-[90vh] overflow-auto shadow-2xl p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B] m-0">Import Field Data</h2>
            <p className="text-[11px] text-[#64748B] mt-1">KML · CSV · GeoJSON</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#94A3B8] flex items-center justify-center hover:bg-[#F8FAFC]"><X size={16} /></button>
        </div>

        {parsedFields.length === 0 ? (
          <>
            {errorMsg && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2 mb-3 text-xs text-[#EF4444]">{errorMsg}</div>
            )}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                isDragging ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] hover:border-[#93C5FD]'
              }`}
            >
              <Upload size={36} className={`mx-auto mb-3 ${isDragging ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`} />
              <p className="text-sm text-[#475569] font-medium m-0">Drag & drop or click to browse</p>
              <p className="text-[10px] text-[#94A3B8] mt-2">Supports: .kml .csv .geojson</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".kml,.csv,.geojson,.json" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} className="hidden" />

            <div className="flex gap-2 mt-4 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <FileText size={16} className="text-[#94A3B8] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-[#475569] leading-relaxed m-0">
                  <strong>KML:</strong> Google Earth polygons<br />
                  <strong>CSV:</strong> Columns named <em>lat</em>, <em>lon</em><br />
                  <strong>GeoJSON:</strong> Polygon FeatureCollection
                </p>
              </div>
            </div>
          </>
        ) : (
          <div>
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3 mb-4 flex items-center gap-2.5">
              <Check size={18} className="text-[#2563EB]" />
              <div>
                <p className="text-sm font-semibold text-[#2563EB] m-0">{parsedFields.length} field(s) found</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">{parsedFields.map(f => f.name).join(', ')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setParsedFields([]); setFileName(''); }}
                className="flex-1 h-11 rounded-xl border border-[#E2E8F0] bg-white text-[#475569] text-sm font-medium hover:bg-[#F8FAFC]">Choose Another</button>
              <button onClick={() => { onFieldsParsed(parsedFields); onClose(); }}
                className="flex-1 h-11 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] flex items-center justify-center gap-1.5 shadow-sm">
                <Check size={16} /> Import Fields
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
