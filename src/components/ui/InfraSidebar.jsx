import { useLabStore } from '../../store/useLabStore'

const CABLE_TYPES = [
  { id: 'cat6', name: 'CAT6 Cable', color: '#00aaff', desc: '10Gbps up to 55 meters.' },
  { id: 'fiber', name: 'Fiber SFP+', color: '#39ff14', desc: 'High-speed optical link.' },
  { id: 'cat5e', name: 'CAT5e Cable', color: '#ffff00', desc: 'Up to 1Gbps, shorter runs.' },
  { id: 'cat6a', name: 'CAT6a Cable', color: '#bd00ff', desc: '10Gbps up to 100 meters.' },
  { id: 'power', name: 'Power Cable', color: '#f43f5e', desc: 'AC power to devices.' },
]

export default function InfraSidebar() {
  const { infraSelectedCable, setInfraSelectedCable, infraCables } = useLabStore()

  return (
    <div className="glass-panel infra-sidebar" style={{
      position: 'absolute', top: '80px', right: '16px', width: '300px',
      padding: '16px', zIndex: 20, animation: 'fadeInUp 0.5s ease both',
      maxHeight: 'calc(100vh - 100px)', overflowY: 'auto',
    }}>
      <div className="corner-decoration corner-tl" /><div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" /><div className="corner-decoration corner-br" />

      <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: '#e879f9', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid rgba(232, 121, 249, 0.2)', paddingBottom: '8px' }}>
        Infra Components
      </h2>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#64748b', marginBottom: '10px' }}>
          [A. PHYSICAL HARDWARE]
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            '1x Enterprise Edge Router (Layer 3 - ISP Link)', 
            '1x Core Network Switch (24-port)', 
            '1x Patch Panel (24-port)', 
            '2x 1U Rack Servers'
          ].map((item, i) => (
            <li key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#e879f9' }}>▸</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#64748b', marginBottom: '10px' }}>
          [B. CABLE INVENTORY]
        </h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.4' }}>
          Select a cable type, then click on two ports in the 3D view to connect them.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {CABLE_TYPES.map(cable => (
            <div 
              key={cable.id}
              onClick={() => setInfraSelectedCable(cable.id)}
              style={{
                padding: '10px', borderRadius: '4px', cursor: 'pointer',
                background: infraSelectedCable === cable.id ? `${cable.color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${infraSelectedCable === cable.id ? cable.color : 'transparent'}`,
                borderLeft: `3px solid ${cable.color}`,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: cable.color, fontWeight: 'bold' }}>
                {cable.name}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '8px', color: '#94a3b8', marginTop: '4px' }}>
                {cable.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {infraCables.length > 0 && (
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#64748b', marginBottom: '8px' }}>
            ACTIVE CONNECTIONS ({infraCables.length})
          </h3>
          <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {infraCables.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${CABLE_TYPES.find(t=>t.id===c.type)?.color}40`, borderRadius: '4px' }}>
                <span style={{ color: c.isFaulty ? '#f97316' : '#fff', fontSize: '10px' }}>{c.source.name} ↔ {c.dest.name} {c.isFaulty && '⚠️'}</span>
                <span style={{ color: c.isFaulty ? '#f97316' : CABLE_TYPES.find(t=>t.id===c.type)?.color, fontSize: '10px', fontWeight: 'bold' }}>{c.type.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button 
          onClick={useLabStore.getState().triggerRandomFault}
          style={{ width: '100%', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', fontFamily: "'Orbitron', sans-serif", fontSize: '10px', cursor: 'pointer', borderRadius: '4px', textTransform: 'uppercase', transition: 'all 0.2s' }}
          onMouseOver={e => e.target.style.background = 'rgba(239, 68, 68, 0.3)'}
          onMouseOut={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
        >
          ⚡ INJECT HARDWARE FAULT
        </button>
      </div>
    </div>
  )
}
