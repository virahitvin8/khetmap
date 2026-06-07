export default function NDWILegend() {
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
        color: '#42A5F5',
        letterSpacing: '0.1em',
        marginBottom: 6,
        textTransform: 'uppercase',
      }}>
        Water Index
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, width: 14 }}>
        <div style={{
          width: 14,
          height: 60,
          borderRadius: 4,
          background: 'linear-gradient(to top, #1A237E, #1565C0 25%, #42A5F5 50%, #90CAF9 75%, #FFF9C4)',
          border: '1px solid #1565C0',
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 2 }}>
          <span style={{ fontSize: 8, color: '#6B8E6B', lineHeight: 1.4 }}>1.0</span>
          <span style={{ fontSize: 8, color: '#6B8E6B', lineHeight: 1.4 }}>0.5</span>
          <span style={{ fontSize: 8, color: '#6B8E6B', lineHeight: 1.4 }}>0.0</span>
        </div>
      </div>
      <div style={{
        display: 'flex',
        gap: 6,
        marginTop: 6,
        paddingTop: 6,
        borderTop: '1px solid #1B4D2E',
      }}>
        <span style={{ fontSize: 8, color: '#1565C0' }}>Water</span>
        <span style={{ fontSize: 8, color: '#90CAF9' }}>Moist</span>
        <span style={{ fontSize: 8, color: '#FFF9C4' }}>Dry</span>
      </div>
    </div>
  );
}
