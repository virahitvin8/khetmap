import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Upload, Search, User, Crosshair, MapIcon } from 'lucide-react';
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

  // Analysis overlay states
  const [showNDVI, setShowNDVI] = useState(() => searchParams.get('analysis') === 'ndvi');
  const [showNDWI, setShowNDWI] = useState(() => searchParams.get('analysis') === 'ndwi');
  const [showSAVI, setShowSAVI] = useState(() => searchParams.get('analysis') === 'savi');

  // Weather overlay
  const [showWeather, setShowWeather] = useState(false);
  const [weatherLocation, setWeatherLocation] = useState<[number, number] | null>(null);

  // File upload
  const [showUpload, setShowUpload] = useState(false);

  // Sync analysis from URL
  useEffect(() => {
    const analysis = searchParams.get('analysis');
    setShowNDVI(analysis === 'ndvi');
    setShowNDWI(analysis === 'ndwi');
    setShowSAVI(analysis === 'savi');
  }, [searchParams]);

  // Subscribe to farms from Firestore
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
    setSelectedLocation(null);
    toast.info(t('draw.start'), { duration: 4000 });
  };

  const handlePolygonCreated = useCallback((vertices: Vertex[]) => {
    if (vertices.length < 3) return;
    setIsDrawing(false);
    setPendingPolygon(vertices);
    setShowSaveModal(true);
  }, []);

  const handleDrawingCancel = () => {
    setIsDrawing(false);
    setPendingPolygon(null);
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
        areaHa: Math.round(areaHa * 100) / 100,
        cropType: cropType || undefined,
        geometry: {
          vertices: pendingPolygon,
          center: { lat: center.lat, lng: center.lng },
          areaHa: Math.round(areaHa * 100) / 100,
        },
      });
      toast.success(`"${name}" saved! (${areaHa < 1 ? (areaHa * 100).toFixed(1) + ' cents' : areaHa.toFixed(2) + ' ha'})`);
      setShowSaveModal(false);
      setPendingPolygon(null);
    } catch (error: any) {
      toast.error('Failed to save field: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (fields: Array<{ name: string; vertices: Vertex[] }>) => {
    if (!user) return;
    try {
      let imported = 0;
      for (const field of fields) {
        const center = getCentroid(field.vertices);
        const areaHa = calculateArea(field.vertices);
        await createFarm(user.uid, {
          name: field.name,
          areaHa: Math.round(areaHa * 100) / 100,
          cropType: undefined,
          geometry: {
            vertices: field.vertices,
            center: { lat: center.lat, lng: center.lng },
            areaHa: Math.round(areaHa * 100) / 100,
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
    <div className="h-full flex flex-col bg-[#0A1F0A]">
      <div className="flex-1 relative">
        <MapComponent
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
          farms={savedFarms}
          farmPolygons={farmPolygons}
          isDrawing={isDrawing}
          onPolygonCreated={handlePolygonCreated}
          onDrawingCancel={handleDrawingCancel}
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

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-center pointer-events-none">
          <span className="text-white font-extrabold text-xl drop-shadow-lg pointer-events-auto">
            KhetMap
          </span>
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center pointer-events-auto hover:bg-black/80 transition-colors backdrop-blur-sm border border-white/10"
          >
            <User size={20} className="text-white" />
          </button>
        </div>

        {/* Bottom card */}
        {!isDrawing && !showSaveModal && !showUpload && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
            <div className="bg-[#0D2818]/95 rounded-xl p-4 border border-[#1B4D2E] backdrop-blur-md pointer-events-auto">
              <div className="flex items-center gap-2 mb-3">
                <Crosshair size={14} className="text-[#6B8E6B]" />
                <span className="text-xs text-[#6B8E6B]">
                  {selectedLocation
                    ? `${selectedLocation[0].toFixed(4)}, ${selectedLocation[1].toFixed(4)}`
                    : savedFarms.length > 0
                      ? `${savedFarms.length} field${savedFarms.length > 1 ? 's' : ''} saved`
                      : t('map.clicktoselect')}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleStartDrawing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#52B788] text-[#0A1F0A] rounded-lg text-xs font-semibold hover:bg-[#40916C] transition-colors"
                >
                  <Plus size={14} />
                  {t('map.draw')}
                </button>
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#52B788]/10 rounded-lg text-xs text-[#52B788] hover:bg-[#52B788]/20 transition-colors"
                >
                  <Upload size={14} />
                  {t('map.upload')}
                </button>
                <button
                  onClick={() => navigate('/farms')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#52B788]/10 rounded-lg text-xs text-[#52B788] hover:bg-[#52B788]/20 transition-colors"
                >
                  <MapIcon size={14} />
                  {t('map.myfields')}
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
