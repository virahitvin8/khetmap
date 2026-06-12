import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToFarms, deleteFarm, Farm } from '../../services/database';
import { MapPin, Trash2, BarChart2, Plus, Leaf, Droplets, AlertTriangle } from 'lucide-react';
import { ndviToHealthScore } from '../../services/satelliteService';
import { toast } from 'sonner';

function HealthBadge({ ndvi }: { ndvi: number }) {
  const h = ndviToHealthScore(ndvi);
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
      <span className="text-xs font-semibold" style={{ color: h.color }}>{h.label}</span>
      <span className="text-xs text-[#6B8E6B]">({h.score})</span>
    </div>
  );
}

// Mini NDVI bar
function NDVIBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const color = value > 0.5 ? '#52B788' : value > 0.3 ? '#F4A261' : '#E76F51';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#1B4D2E] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-[#6B8E6B] w-8 text-right">{pct.toFixed(0)}</span>
    </div>
  );
}

export default function Farms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeToFarms(user.uid, (data) => {
      setFarms(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleDelete = async (farm: Farm) => {
    if (!user) return;
    setDeletingId(farm.id);
    try {
      await deleteFarm(user.uid, farm.id);
      toast.success(`"${farm.name}" deleted`);
    } catch {
      toast.error('Could not delete farm');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnalyze = (farm: Farm) => {
    navigate(`/analyze?farmId=${farm.id}`);
  };

  const totalArea = farms.reduce((s, f) => s + (f.areaHa || 0), 0);

  return (
    <div className="h-full flex flex-col bg-[#050D05] overflow-hidden">
      {/* ─── Header ─── */}
      <div className="px-4 pt-10 pb-4 bg-gradient-to-b from-[#0A1F0A] to-transparent">
        <h1 className="text-2xl font-black text-[#E8F5E9]">My Fields</h1>
        <p className="text-[#6B8E6B] text-sm">मेरे खेत</p>

        {/* ─── Summary cards ─── */}
        {farms.length > 0 && (
          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-[#0D2818] border border-[#1B4D2E] rounded-xl p-3">
              <p className="text-[#6B8E6B] text-xs mb-1">Total Fields</p>
              <p className="text-[#52B788] text-2xl font-black">{farms.length}</p>
            </div>
            <div className="flex-1 bg-[#0D2818] border border-[#1B4D2E] rounded-xl p-3">
              <p className="text-[#6B8E6B] text-xs mb-1">Total Area</p>
              <p className="text-[#52B788] text-2xl font-black">{totalArea.toFixed(1)}<span className="text-sm font-medium text-[#6B8E6B]"> ha</span></p>
            </div>
            <div className="flex-1 bg-[#0D2818] border border-[#1B4D2E] rounded-xl p-3">
              <p className="text-[#6B8E6B] text-xs mb-1">Avg Health</p>
              <p className="text-[#52B788] text-2xl font-black">
                {farms.length ? Math.round(farms.reduce((s, _) => s + 52, 0) / farms.length) : '--'}
                <span className="text-sm font-medium text-[#6B8E6B]">/100</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Farm list ─── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : farms.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-60 text-center">
            <span className="text-5xl mb-4">🌾</span>
            <p className="text-[#E8F5E9] font-bold text-lg mb-2">No fields yet</p>
            <p className="text-[#6B8E6B] text-sm mb-6">Go to the map and draw your first field boundary</p>
            <button
              onClick={() => navigate('/map')}
              className="flex items-center gap-2 px-6 py-3 bg-[#52B788] text-[#0A1F0A] rounded-xl font-bold text-sm hover:bg-[#40916C] transition-all"
            >
              <Plus size={16} /> Draw First Field
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {farms.map((farm, i) => {
              // Mock NDVI for demo — in production this comes from satellite API
              const mockNDVI = 0.35 + (i * 0.1) % 0.45;
              const health = ndviToHealthScore(mockNDVI);

              return (
                <motion.div
                  key={farm.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#0A1F0A] border border-[#1B4D2E] rounded-2xl overflow-hidden"
                >
                  {/* Health color stripe */}
                  <div className="h-1" style={{ backgroundColor: health.color }} />

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-[#E8F5E9] font-bold text-base">{farm.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {farm.cropType && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#0D2818] border border-[#1B4D2E] text-[#95D5B2]">
                              🌾 {farm.cropType}
                            </span>
                          )}
                          {farm.areaHa && (
                            <span className="text-xs text-[#6B8E6B]">
                              {farm.areaHa < 1 ? `${(farm.areaHa * 100).toFixed(1)} cents` : `${farm.areaHa.toFixed(2)} ha`}
                            </span>
                          )}
                        </div>
                      </div>
                      <HealthBadge ndvi={mockNDVI} />
                    </div>

                    {/* NDVI bar */}
                    <div className="mb-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-[#6B8E6B]">NDVI Score</span>
                        <span className="text-xs text-[#6B8E6B]">Updated 3 days ago</span>
                      </div>
                      <NDVIBar value={mockNDVI} />
                    </div>

                    {/* Alert if low */}
                    {mockNDVI < 0.35 && (
                      <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-[#F4A261]/10 border border-[#F4A261]/30 rounded-lg">
                        <AlertTriangle size={14} className="text-[#F4A261]" />
                        <span className="text-xs text-[#F4A261]">Low NDVI — check for stress</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/map?farmId=${farm.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#0D2818] border border-[#1B4D2E] text-[#95D5B2] text-xs hover:border-[#52B788] transition-colors"
                      >
                        <MapPin size={13} /> View on Map
                      </button>
                      <button
                        onClick={() => handleAnalyze(farm)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#52B788]/10 border border-[#52B788]/30 text-[#52B788] text-xs hover:bg-[#52B788]/20 transition-colors"
                      >
                        <BarChart2 size={13} /> Analyze
                      </button>
                      <button
                        onClick={() => handleDelete(farm)}
                        disabled={deletingId === farm.id}
                        className="w-10 flex items-center justify-center py-2.5 rounded-lg bg-[#E76F51]/10 border border-[#E76F51]/20 text-[#E76F51] text-xs hover:bg-[#E76F51]/20 transition-colors disabled:opacity-50"
                      >
                        {deletingId === farm.id
                          ? <div className="w-3 h-3 border border-[#E76F51] border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ─── Add farm FAB ─── */}
      <div className="px-4 pb-6">
        <button
          onClick={() => navigate('/map')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#52B788] to-[#40916C] text-[#0A1F0A] font-black text-base hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Add New Field
        </button>
      </div>
    </div>
  );
}
