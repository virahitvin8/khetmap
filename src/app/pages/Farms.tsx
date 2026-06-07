import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Leaf, Plus, MapIcon, Calendar, Search, X, ChevronDown, Edit3, Trash2 } from 'lucide-react';
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
    if (filterCrop !== 'all') result = result.filter(f => f.cropType === filterCrop);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(q));
    }
    switch (sortMode) {
      case 'newest': result.sort((a, b) => b.createdAt - a.createdAt); break;
      case 'oldest': result.sort((a, b) => a.createdAt - b.createdAt); break;
      case 'az': result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return result;
  }, [farms, filterCrop, searchQuery, sortMode]);

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString();
  const formatArea = (ha: number) => ha < 1 ? `${(ha * 100).toFixed(1)} cents` : `${ha.toFixed(2)} ha`;

  const handleRename = async (farmId: string) => {
    if (!user || !editName.trim()) return;
    try {
      await updateFarm(user.uid, farmId, { name: editName.trim() } as any);
      setEditingId(null);
      toast.success('Field renamed');
    } catch { toast.error('Failed to rename'); }
  };

  const handleDelete = async (farmId: string) => {
    if (!user) return;
    try {
      await deleteFarm(user.uid, farmId);
      setShowDeleteId(null);
      toast.success(t('farms.deletedone'));
    } catch { toast.error('Failed to delete field'); }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-[#1E293B]">{t('farms.title')}</h1>
          <span className="text-sm text-[#64748B]">{farms.length} fields</span>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder={t('farms.filter')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-8 text-sm text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mt-3 overflow-auto pb-1">
          {cropTypes.slice(0, 5).map(crop => (
            <button key={crop} onClick={() => setFilterCrop(crop)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${
                filterCrop === crop
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#93C5FD]'
              }`}>
              {crop === 'all' ? t('farms.all') : crop}
            </button>
          ))}
          {/* Sort */}
          <div className="relative">
            <button onClick={() => setShowSort(!showSort)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#93C5FD] flex items-center gap-1 whitespace-nowrap transition-all">
              <ChevronDown size={12} />
              {sortMode === 'newest' ? 'Newest' : sortMode === 'oldest' ? 'Oldest' : 'A-Z'}
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-20 min-w-[130px] py-1">
                  {(['newest', 'oldest', 'az'] as SortMode[]).map(mode => (
                    <button key={mode} onClick={() => { setSortMode(mode); setShowSort(false); }}
                      className={`w-full block px-4 py-2 text-xs text-left hover:bg-[#F8FAFC] ${
                        sortMode === mode ? 'text-[#2563EB] font-semibold bg-[#EFF6FF]' : 'text-[#475569]'
                      }`}>
                      {mode === 'newest' ? 'Newest first' : mode === 'oldest' ? 'Oldest first' : 'A to Z'}
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
            <div className="w-20 h-20 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-4">
              <MapIcon size={36} className="text-[#93C5FD]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
              {searchQuery || filterCrop !== 'all' ? 'No matching fields' : t('farms.empty')}
            </h3>
            <p className="text-sm text-[#64748B] text-center mb-6 leading-relaxed">
              {searchQuery || filterCrop !== 'all' ? 'Try a different search or filter' : t('farms.emptydesc')}
            </p>
            {!searchQuery && filterCrop === 'all' && (
              <button onClick={() => navigate('/map')}
                className="flex items-center gap-2 bg-[#2563EB] text-white rounded-xl px-5 py-3 font-semibold text-sm hover:bg-[#1D4ED8] transition-colors shadow-sm">
                <Plus size={18} />
                {t('farms.add')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFarms.map((farm) => (
              <div key={farm.id}
                className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#93C5FD] transition-all shadow-sm overflow-hidden">
                <div className="p-4 cursor-pointer" onClick={() => navigate(`/farms/${farm.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                      <Leaf size={22} className="text-[#2563EB]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingId === farm.id ? (
                        <div className="flex gap-2">
                          <input type="text" value={editName}
                            onChange={(e) => setEditName(e.target.value)} autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleRename(farm.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-[#F8FAFC] border border-[#2563EB] rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[#1E293B] outline-none box-border" />
                        </div>
                      ) : (
                        <h3 className="font-semibold text-[#1E293B] text-sm truncate">{farm.name}</h3>
                      )}
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {formatArea(farm.areaHa)} · {farm.cropType || 'Not set'}
                      </p>
                    </div>
                    <ChevronIcon size={16} className="text-[#94A3B8]" />
                  </div>
                  <div className="flex gap-4 mt-3 pt-3 border-t border-[#F1F5F9]">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#94A3B8]" />
                      <span className="text-[10px] text-[#64748B]">{formatDate(farm.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex border-t border-[#F1F5F9]">
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(farm.id); setEditName(farm.name); }}
                    className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] text-[#64748B] hover:text-[#2563EB] hover:bg-[#F8FAFC] transition-colors">
                    <Edit3 size={12} /> Edit
                  </button>
                  <div className="w-px bg-[#F1F5F9]" />
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/map?focus=${farm.id}`); }}
                    className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] text-[#64748B] hover:text-[#2563EB] hover:bg-[#F8FAFC] transition-colors">
                    <MapIcon size={12} /> Locate
                  </button>
                  <div className="w-px bg-[#F1F5F9]" />
                  <button onClick={(e) => { e.stopPropagation(); setShowDeleteId(farm.id); }}
                    className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {showDeleteId && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] w-[85%] max-w-[300px] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#1E293B] mb-2">Delete field?</h3>
            <p className="text-sm text-[#64748B] mb-5">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteId(null)}
                className="flex-1 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[#475569] text-sm font-medium hover:bg-[#F8FAFC] transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(showDeleteId)}
                className="flex-1 py-3 rounded-xl bg-[#EF4444] text-white text-sm font-semibold hover:bg-[#DC2626] transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ size, className }: { size: number; className?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>);
}
