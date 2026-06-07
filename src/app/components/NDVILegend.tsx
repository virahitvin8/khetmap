export default function NDVILegend() {
  return (
    <div className="absolute bottom-6 left-3 z-[1000] bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🌿</span>
        <span className="text-xs font-semibold text-[#1E293B]">NDVI (Crop Health)</span>
      </div>
      <div className="flex items-center gap-0.5">
        <span className="text-[9px] text-[#64748B] w-5">Bare</span>
        {['#D4E7C5', '#8BC48A', '#4CAF50', '#2E7D32', '#1B5E20'].map((color, i) => (
          <div key={i} className="w-5 h-3 border-[0.5px] border-[#E2E8F0]" style={{ background: color }} />
        ))}
        <span className="text-[9px] text-[#64748B] w-5 text-right">Dense</span>
      </div>
    </div>
  );
}
