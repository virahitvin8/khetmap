import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Leaf, Plus, MapIcon, Calendar, Maximize, Edit3, Trash2, Search, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { subscribeToFarms, deleteFarm, updateFarm, Farm } from '../../services/database';
import { toast } from 'sonner';

type SortMode = 'newest' | 'oldest' | 'az';

export default function Farms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [filterCrop, setFilterCrop] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSort, setShowSort] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToFarms(user.uid, setFarms);
    return unsub;
  }, [user]);

  const cropTypes = useMemo(() => {
    const types = new Set(farms.map(f => f.cropType).filter(Boolean));
    return ['all', ...Array.from(types)] as string[];
  }, [farms]);

  const filteredFarms = useMemo(() => {
    let result = [...farms];

    // Filter by crop
    if (filterCrop !== 'all') {
      result = result.filter(f => f.cropType === filterCrop);
    }

    // Search by name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(q));
    }

    // Sort
    switch (sortMode) {
      case 'newest': result.sort((a, b) => b.createdAt - a.createdAt); break;
      case 'oldest': result.sort((a, b) => a.createdAt - b.createdAt); break;
      case 'az': result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    return result;
  }, [farms, filterCrop, searchQuery, sortMode]);

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString();
  const formatArea = (ha: number) => ha < 1 ? `${(ha * 100).toFixed(0)} cents` : `${ha.toFixed(1)} ha`;

  const handleRename = async (farmId: string) => {
    if (!user || !editName.trim()) return;
    try {
      await updateFarm(user.uid, farmId, { name: editName.trim() } as any);
      setEditingId(null);
      toast.success('Field renamed');
    } catch {
      toast.error('Failed to rename');
    }
  };

  const handleDelete = async (farmId: string) => {
    if (!user) return;
    try {
      await deleteFarm(user.uid, farmId);
      setShowDeleteId(null);
      toast.success(t('farms.deletedone'));
    } catch {
      toast.error('Failed to delete field');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0A1F0A]">
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-[#E8F5E9]">{t('farms.title')}</h1>
          <span className="text-sm text-[#6B8E6B]">{t('farms.count', { count: farms.length })}</span>
        </div>

        {/* Search bar */}
        <div className="relative mt-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8E6B]" />
          <input
            type="text"
            placeholder={t('farms.filter')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: 36,
              background: '#0D2818',
              border: '1px solid #1B4D2E',
              borderRadius: 10,
              padding: '0 32px',
              fontSize: 13,
              color: '#E8F5E9',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 8, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#6B8E6B',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter/sort chips */}
        <div className="flex gap-2 mt-3 overflow-auto pb-1">
          {cropTypes.slice(0, 5).map(crop => (
            <button
              key={crop}
              onClick={() => setFilterCrop(crop)}
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: filterCrop === crop ? 600 : 400,
                background: filterCrop === crop ? '#52B788' : '#0D2818',
                color: filterCrop === crop ? '#0A1F0A' : '#6B8E6B',
                border: `1px solid ${filterCrop === crop ? '#52B788' : '#1B4D2E'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {crop === 'all' ? t('farms.all') : crop}
            </button>
          ))}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 11,
                background: '#0D2818',
                color: '#6B8E6B',
                border: '1px solid #1B4D2E',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
              }}
            >
              <ChevronDown size={12} />
              {sortMode === 'newest' ? t('farms.sortnew') : sortMode === 'oldest' ? t('farms.sortold') : t('farms.sortaz')}
            </button>
            {showSort && (
              <>
                <div onClick={() => setShowSort(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  background: '#132A1A',
                  border: '1px solid #1B4D2E',
                  borderRadius: 8,
                  overflow: 'hidden',
                  zIndex: 1000,
                  minWidth: 140,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {(['newest', 'oldest', 'az'] as SortMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => { setSortMode(mode); setShowSort(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 14px',
                        border: 'none',
                        background: sortMode === mode ? 'rgba(82,183,136,0.1)' : 'transparent',
                        color: sortMode === mode ? '#52B788' : '#E8F5E9',
                        fontSize: 12,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {mode === 'newest' ? t('farms.sortnew') : mode === 'oldest' ? t('farms.sortold') : t('farms.sortaz')}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 pb-4">
        {filteredFarms.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center -mt-10">
            <div className="w-20 h-20 rounded-full bg-[#0D2818] flex items-center justify-center mb-4">
              <MapIcon size={36} className="text-[#6B8E6B]" />
            </div>
            <h3 className="text-lg font-semibold text-[#E8F5E9] mb-2">
              {searchQuery || filterCrop !== 'all' ? 'No matching fields' : t('farms.empty')}
            </h3>
            <p className="text-sm text-[#6B8E6B] text-center mb-6 leading-relaxed">
              {searchQuery || filterCrop !== 'all'
                ? 'Try a different search or filter'
                : t('farms.emptydesc')}
            </p>
            {!searchQuery && filterCrop === 'all' && (
              <button
                onClick={() => navigate('/map')}
                className="flex items-center gap-2 bg-[#52B788] text-[#0A1F0A] rounded-xl px-5 py-3 font-semibold text-sm hover:bg-[#40916C] transition-colors"
              >
                <Plus size={18} />
                {t('farms.add')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFarms.map((farm) => (
              <div
                key={farm.id}
                className="bg-[#132A1A] rounded-xl border border-[#1B4D2E] hover:border-[#52B788]/50 transition-colors overflow-hidden"
              >
                {/* Main clickable area */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => navigate(`/farms/${farm.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#52B788]/15 flex items-center justify-center">
                      <Leaf size={22} className="text-[#52B788]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingId === farm.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleRename(farm.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              background: '#0D2818',
                              border: '1px solid #52B788',
                              borderRadius: 6,
                              padding: '4px 8px',
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#E8F5E9',
                              outline: 'none',
                              width: '100%',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      ) : (
                        <h3 className="font-semibold text-[#E8F5E9] text-sm truncate">{farm.name}</h3>
                      )}
                      <p className="text-xs text-[#6B8E6B] mt-0.5">
                        {formatArea(farm.areaHa)} · {farm.cropType || t('farms.notset')}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-[#6B8E6B]" />
                  </div>
                  <div className="flex gap-4 mt-3 pt-3 border-t border-[#0A1F0A]">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#6B8E6B]" />
                      <span className="text-[10px] text-[#6B8E6B]">{formatDate(farm.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Maximize size={12} className="text-[#6B8E6B]" />
                      <span className="text-[10px] text-[#6B8E6B]">{farm.areaHa.toFixed(2)} ha</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex border-t border-[#0A1F0A]">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingId(farm.id); setEditName(farm.name); }}
                    className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] text-[#6B8E6B] hover:text-[#52B788] hover:bg-[#0D2818]/50 transition-colors"
                  >
                    <Edit3 size={12} />
                    {t('farms.edit')}
                  </button>
                  <div className="w-px bg-[#0A1F0A]" />
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/map?focus=${farm.id}`); }}
                    className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] text-[#6B8E6B] hover:text-[#52B788] hover:bg-[#0D2818]/50 transition-colors"
                  >
                    <MapIcon size={12} />
                    {t('farms.locate')}
                  </button>
                  <div className="w-px bg-[#0A1F0A]" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteId(farm.id); }}
                    className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] text-[#6B8E6B] hover:text-[#EF5350] hover:bg-[#0D2818]/50 transition-colors"
                  >
                    <Trash2 size={12} />
                    {t('farms.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {showDeleteId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#132A1A', borderRadius: 16,
            border: '1px solid #1B4D2E',
            width: '85%', maxWidth: 300,
            padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <h3 className="text-lg font-bold text-[#E8F5E9]" style={{ margin: '0 0 8px' }}>Delete field?</h3>
            <p className="text-sm text-[#6B8E6B]" style={{ margin: '0 0 20px' }}>
              This action cannot be undone. All analysis data for this field will be lost.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteId(null)}
                className="flex-1 py-3 rounded-xl border border-[#1B4D2E] bg-[#0D2818] text-[#E8F5E9] text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteId)}
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

function ChevronRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
