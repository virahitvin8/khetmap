export default function NDWILegend() {
  return (
    <div className="absolute bottom-6 left-3 z-[1000] bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">💧</span>
        <span className="text-xs font-semibold text-[#1E293B]">NDWI (Water Index)</span>
      </div>
      <div className="flex items-center gap-0.5">
        <span className="text-[9px] text-[#64748B] w-5">Dry</span>
        {['#F5F5DC', '#C2DFFF', '#64B5F6', '#2196F3', '#1565C0'].map((color, i) => (
          <div key={i} className="w-5 h-3 border-[0.5px] border-[#E2E8F0]" style={{ background: color }} />
        ))}
        <span className="text-[9px] text-[#64748B] w-5 text-right">Wet</span>
      </div>
    </div>
  );
}
