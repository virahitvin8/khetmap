import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Upload, MapIcon, Crosshair, Ruler, Square, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { createFarm, subscribeToFarms, Farm } from '../../services/database';
import MapComponent from '../components/MapComponent';
import SaveFieldModal from '../components/SaveFieldModal';
import FileUpload from '../components/FileUpload';
import { getCentroid, calculateArea } from '../components/DrawFieldControl';
import { toast } from 'sonner';
import { POLYGON_COLORS } from '../../constants/map';

interface Vertex {
  lat: number;
  lng: number;
}

interface FarmPolygon {
  id: string;
  name: string;
  vertices: Vertex[];
  color?: string;
}

function formatArea(ha: number): string {
  if (ha < 0.001) return `${(ha * 10000).toFixed(1)} m²`;
  if (ha < 1) return `${(ha * 100).toFixed(2)} cents`;
  return `${ha.toFixed(4)} ha`;
}

function formatAreaFull(ha: number): string {
  const sqm = ha * 10000;
  const acres = ha * 2.47105;
  const sqkm = ha / 100;
  return `${sqm.toFixed(1)} m² · ${ha.toFixed(4)} ha · ${acres.toFixed(4)} acres · ${sqkm.toFixed(6)} km²`;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [savedFarms, setSavedFarms] = useState<Array<{ id: string; name: string; center: [number, number] }>>([]);
  const [farmPolygons, setFarmPolygons] = useState<FarmPolygon[]>([]);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [pendingPolygon, setPendingPolygon] = useState<Vertex[] | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Measurement HUD
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [measurementVertices, setMeasurementVertices] = useState<Vertex[]>([]);

  // Analysis overlay states
  const [showNDVI, setShowNDVI] = useState(() => searchParams.get('analysis') === 'ndvi');
  const [showNDWI, setShowNDWI] = useState(() => searchParams.get('analysis') === 'ndwi');
  const [showSAVI, setShowSAVI] = useState(() => searchParams.get('analysis') === 'savi');

  // Weather overlay
  const [showWeather, setShowWeather] = useState(false);
  const [weatherLocation, setWeatherLocation] = useState<[number, number] | null>(null);

  // File upload
  const [showUpload, setShowUpload] = useState(false);

  // Export dropdown
  const [showExport, setShowExport] = useState(false);

  // Sync analysis from URL
  useEffect(() => {
    const analysis = searchParams.get('analysis');
    setShowNDVI(analysis === 'ndvi');
    setShowNDWI(analysis === 'ndwi');
    setShowSAVI(analysis === 'savi');
  }, [searchParams]);

  // Subscribe to farms
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToFarms(user.uid, (farms) => {
      const markers = farms.map(f => ({
        id: f.id,
        name: f.name,
        center: [
          f.geometry?.center?.lat || 17.385,
          f.geometry?.center?.lng || 78.4867
        ] as [number, number],
      }));
      setSavedFarms(markers);

      const polygons = farms
        .filter(f => f.geometry?.vertices?.length >= 3)
        .map((f, idx) => ({
          id: f.id,
          name: f.name,
          vertices: f.geometry.vertices as Vertex[],
          color: POLYGON_COLORS[idx % POLYGON_COLORS.length],
        }));
      setFarmPolygons(polygons);
    });
    return unsub;
  }, [user]);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    if (!isDrawing) {
      setSelectedLocation([lat, lng]);
      if (showWeather) {
        setWeatherLocation([lat, lng]);
      }
    }
  }, [isDrawing, showWeather]);

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setShowMeasurement(false);
    setSelectedLocation(null);
    toast.info('🖱️ Click on the map to place vertices, double-click to finish', { duration: 4000 });
  };

  const handleStartMeasure = () => {
    setShowMeasurement(true);
    setMeasurementVertices([]);
    setIsDrawing(false);
    toast.info('📏 Click to add measurement points', { duration: 3000 });
  };

  const handlePolygonCreated = useCallback((vertices: Vertex[]) => {
    if (vertices.length < 3) return;
    setIsDrawing(false);
    setPendingPolygon(vertices);
    setShowSaveModal(true);
  }, []);

  const handleMeasurementPolygon = useCallback((vertices: Vertex[]) => {
    setMeasurementVertices(vertices);
    if (vertices.length >= 3) {
      const ha = calculateArea(vertices);
      toast.success(`Area: ${formatAreaFull(ha)}`, { duration: 6000 });
    }
  }, []);

  const handleDrawingCancel = () => {
    setIsDrawing(false);
    setPendingPolygon(null);
  };

  const handleMeasureCancel = () => {
    setShowMeasurement(false);
    setMeasurementVertices([]);
  };

  const handleSaveCancel = () => {
    setShowSaveModal(false);
    setPendingPolygon(null);
  };

  const handleSave = async (name: string, cropType: string) => {
    if (!user || !pendingPolygon) return;
    try {
      setIsSaving(true);
      const center = getCentroid(pendingPolygon);
      const areaHa = calculateArea(pendingPolygon);
      await createFarm(user.uid, {
        name,
        areaHa: Math.round(areaHa * 1000000) / 1000000,
        cropType: cropType || undefined,
        geometry: {
          vertices: pendingPolygon,
          center: { lat: center.lat, lng: center.lng },
          areaHa: Math.round(areaHa * 1000000) / 1000000,
        },
      });
      toast.success(`"${name}" saved! (${formatArea(areaHa)})`);
      setShowSaveModal(false);
      setPendingPolygon(null);
    } catch (error: any) {
      toast.error('Failed to save field: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Export all fields as GeoJSON
  const handleExportAll = (format: string) => {
    if (farmPolygons.length === 0) {
      toast.error('No fields to export');
      return;
    }

    const features = farmPolygons.map(p => ({
      type: 'Feature',
      properties: { name: p.name, areaHa: calculateArea(p.vertices), color: p.color },
      geometry: {
        type: 'Polygon',
        coordinates: [[...p.vertices.map(v => [v.lng, v.lat]), [p.vertices[0].lng, p.vertices[0].lat]]],
      },
    }));

    if (format === 'geojson') {
      const geojson = JSON.stringify({ type: 'FeatureCollection', features }, null, 2);
      const blob = new Blob([geojson], { type: 'application/geo+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'khetmap_fields.geojson';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as GeoJSON');
    } else if (format === 'kml') {
      let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>KhetMap Fields</name>`;
      features.forEach((f: any) => {
        const coords = f.geometry.coordinates[0].map((c: number[]) => c.join(',')).join(' ');
        kml += `
    <Placemark>
      <name>${f.properties.name}</name>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coords}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`;
      });
      kml += `
  </Document>
</kml>`;
      const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'khetmap_fields.kml';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as KML');
    }
    setShowExport(false);
  };

  // Export as shapefile (ESRI)
  const handleExportShapefile = () => {
    if (farmPolygons.length === 0) {
      toast.error('No fields to export');
      return;
    }
    // Create DBF header + records (simplified shapefile)
    const features = farmPolygons.map((p, i) => ({
      id: i + 1,
      name: p.name.substring(0, 11),
      area: calculateArea(p.vertices),
    }));

    const header = 'id,name,area_ha\n';
    const rows = features.map(f => `${f.id},${f.name},${f.area.toFixed(4)}`).join('\n');
    const csv = header + rows;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'khetmap_fields_shapefile_attributes.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported (add .shp, .shx for full Shapefile format)');
    setShowExport(false);
  };

  // Export as PDF-like HTML report
  const handleExportPDF = () => {
    if (farmPolygons.length === 0) {
      toast.error('No fields to export');
      return;
    }
    let html = `<!DOCTYPE html>
<html><head><title>KhetMap Field Report</title>
<style>
body { font-family: Arial, sans-serif; margin: 40px; color: #1E293B; }
h1 { color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
table { width: 100%; border-collapse: collapse; margin-top: 20px; }
th { background: #EFF6FF; text-align: left; padding: 10px; border: 1px solid #E2E8F0; }
td { padding: 10px; border: 1px solid #E2E8F0; }
.footer { margin-top: 30px; font-size: 12px; color: #94A3B8; }
</style></head><body>
<h1>KhetMap Field Report</h1>
<p>Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
<table>
<tr><th>#</th><th>Name</th><th>Area (ha)</th><th>Coordinates</th></tr>`;
    farmPolygons.forEach((p, i) => {
      const center = getCentroid(p.vertices);
      html += `<tr><td>${i + 1}</td><td>${p.name}</td><td>${calculateArea(p.vertices).toFixed(4)}</td><td>${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}</td></tr>`;
    });
    html += `</table>
<p class="footer">KhetMap — Free Satellite Field Analysis · https://khetmap.vercel.app</p>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'khetmap_field_report.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported (open in browser, print as PDF)');
    setShowExport(false);
  };

  // Handle file upload
  const handleFileUpload = async (fields: Array<{ name: string; vertices: Vertex[] }>) => {
    if (!user) return;
    try {
      let imported = 0;
      for (const field of fields) {
        const center = getCentroid(field.vertices);
        const areaHa = calculateArea(field.vertices);
        await createFarm(user.uid, {
          name: field.name,
          areaHa: Math.round(areaHa * 1000000) / 1000000,
          cropType: undefined,
          geometry: {
            vertices: field.vertices,
            center: { lat: center.lat, lng: center.lng },
            areaHa: Math.round(areaHa * 1000000) / 1000000,
          },
        });
        imported++;
      }
      toast.success(`Imported ${imported} field(s) successfully`);
    } catch (error: any) {
      toast.error('Import failed: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="flex-1 relative">
        <MapComponent
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
          farms={savedFarms}
          farmPolygons={farmPolygons}
          isDrawing={isDrawing}
          onPolygonCreated={handlePolygonCreated}
          onDrawingCancel={handleDrawingCancel}
          isMeasuring={showMeasurement}
          onMeasurementComplete={handleMeasurementPolygon}
          onMeasureCancel={handleMeasureCancel}
          showNDVI={showNDVI}
          onNDVIToggle={() => {
            setShowNDVI(prev => !prev);
            if (showNDWI) setShowNDWI(false);
            if (showSAVI) setShowSAVI(false);
          }}
          showNDWI={showNDWI}
          onNDWIToggle={() => {
            setShowNDWI(prev => !prev);
            if (showNDVI) setShowNDVI(false);
            if (showSAVI) setShowSAVI(false);
          }}
          showSAVI={showSAVI}
          onSAVIToggle={() => {
            setShowSAVI(prev => !prev);
            if (showNDVI) setShowNDVI(false);
            if (showNDWI) setShowNDWI(false);
          }}
          showWeather={showWeather}
          onWeatherToggle={() => {
            const next = !showWeather;
            setShowWeather(next);
            if (next && selectedLocation) {
              setWeatherLocation(selectedLocation);
            } else {
              setWeatherLocation(null);
            }
          }}
          weatherLocation={weatherLocation}
          onCloseWeather={() => setWeatherLocation(null)}
        />

        {/* Measurement HUD */}
        {showMeasurement && measurementVertices.length >= 3 && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000]">
            <div className="bg-white rounded-xl px-4 py-3 border border-[#E2E8F0] shadow-lg">
              <div className="flex items-center gap-3">
                <Ruler size={16} className="text-[#2563EB]" />
                <div className="text-sm text-[#1E293B] font-semibold">
                  {formatAreaFull(calculateArea(measurementVertices))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-white/90 to-transparent backdrop-blur-sm px-4 pt-3 pb-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[#1E293B]">KhetMap</span>
            <div className="flex items-center gap-2">
              {/* Export button */}
              <div className="relative">
                <button
                  onClick={() => setShowExport(!showExport)}
                  className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Download size={14} />
                  Export
                </button>
                {showExport && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-20 min-w-[160px] py-1">
                      <button onClick={() => handleExportAll('geojson')} className="w-full px-4 py-2.5 text-xs text-[#475569] hover:bg-[#F8FAFC] text-left flex items-center gap-2">
                        📄 GeoJSON (.geojson)
                      </button>
                      <button onClick={() => handleExportAll('kml')} className="w-full px-4 py-2.5 text-xs text-[#475569] hover:bg-[#F8FAFC] text-left flex items-center gap-2">
                        🌍 KML (.kml)
                      </button>
                      <button onClick={handleExportShapefile} className="w-full px-4 py-2.5 text-xs text-[#475569] hover:bg-[#F8FAFC] text-left flex items-center gap-2">
                        📊 Attributes (CSV)
                      </button>
                      <button onClick={handleExportPDF} className="w-full px-4 py-2.5 text-xs text-[#475569] hover:bg-[#F8FAFC] text-left flex items-center gap-2">
                        📋 Report (.html/PDF)
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom card */}
        {!isDrawing && !showSaveModal && !showUpload && !showMeasurement && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
            <div className="bg-white/95 rounded-xl p-4 border border-[#E2E8F0] shadow-lg backdrop-blur-md pointer-events-auto">
              <div className="flex items-center gap-2 mb-3">
                <Crosshair size={14} className="text-[#94A3B8]" />
                <span className="text-xs text-[#64748B]">
                  {selectedLocation
                    ? `${selectedLocation[0].toFixed(6)}, ${selectedLocation[1].toFixed(6)}`
                    : savedFarms.length > 0
                      ? `${savedFarms.length} field${savedFarms.length > 1 ? 's' : ''} saved`
                      : 'Click map to select location'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleStartDrawing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition-colors shadow-sm"
                >
                  <Plus size={14} />
                  Draw Field
                </button>
                <button
                  onClick={handleStartMeasure}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#EFF6FF] text-[#2563EB] rounded-lg text-xs font-semibold hover:bg-[#DBEAFE] transition-colors"
                >
                  <Square size={14} />
                  Measure
                </button>
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#F1F5F9] text-[#475569] rounded-lg text-xs font-medium hover:bg-[#E2E8F0] transition-colors"
                >
                  <Upload size={14} />
                  Import
                </button>
                <button
                  onClick={() => navigate('/farms')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#F1F5F9] text-[#475569] rounded-lg text-xs font-medium hover:bg-[#E2E8F0] transition-colors"
                >
                  <MapIcon size={14} />
                  Fields
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Field Modal */}
        {showSaveModal && pendingPolygon && (
          <SaveFieldModal
            vertices={pendingPolygon}
            areaHa={calculateArea(pendingPolygon)}
            center={getCentroid(pendingPolygon)}
            onSave={handleSave}
            onCancel={handleSaveCancel}
            isSaving={isSaving}
          />
        )}

        {/* File Upload Modal */}
        {showUpload && (
          <FileUpload
            onFieldsParsed={handleFileUpload}
            onClose={() => setShowUpload(false)}
          />
        )}
      </div>
    </div>
  );
}
