export default function NDVILegend() {
  const steps = [
    { label: '0.0', color: '#2B2B2B' },
    { label: '0.2', color: '#8B3A3A' },
    { label: '0.4', color: '#C4903D' },
    { label: '0.6', color: '#68A84A' },
    { label: '0.8', color: '#3B7A3B' },
    { label: '1.0', color: '#1A4A1A' },
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: 100,
      left: 12,
      zIndex: 1000,
      background: 'rgba(10, 31, 10, 0.92)',
      border: '1px solid #1B4D2E',
      borderRadius: 10,
      padding: '10px 12px',
      backdropFilter: 'blur(8px)',
      userSelect: 'none',
    }}>
      <div style={{
        fontSize: 9,
        fontWeight: 700,
        color: '#95D5B2',
        letterSpacing: '0.1em',
        marginBottom: 6,
        textTransform: 'uppercase',
      }}>
        NDVI
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, width: 14 }}>
        <div style={{
          width: 14,
          height: 60,
          borderRadius: 4,
          background: 'linear-gradient(to top, #2B2B2B, #8B3A3A 20%, #C4903D 40%, #68A84A 60%, #3B7A3B 80%, #1A4A1A)',
          border: '1px solid #2D6A4F',
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 2 }}>
          {steps.filter((_, i) => i % 2 === 0).map((s) => (
            <span key={s.label} style={{ fontSize: 8, color: '#6B8E6B', lineHeight: 1.4 }}>
              {s.label}
            </span>
          ))}
        </div>
      </div>
      <div style={{
        display: 'flex',
        gap: 6,
        marginTop: 6,
        paddingTop: 6,
        borderTop: '1px solid #1B4D2E',
      }}>
        <span style={{ fontSize: 8, color: '#8B3A3A' }}>Bare</span>
        <span style={{ fontSize: 8, color: '#68A84A' }}>Sparse</span>
        <span style={{ fontSize: 8, color: '#1A4A1A' }}>Dense</span>
      </div>
    </div>
  );
}
