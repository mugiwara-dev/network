import { useLabStore } from '../../store/useLabStore'

const OSI_INFO = {
  7: 'Application: Generating HTTP GET Request',
  6: 'Presentation: Formatting data (ASCII/UTF-8), Encrypting (TLS)',
  5: 'Session: Establishing connection state to Web Server',
  4: 'Transport: Adding TCP Header - Source Port: 443',
  3: 'Network: Adding IP Header - Dest: 8.8.8.8',
  2: 'Data Link: Adding Ethernet Frame - Source MAC: [PC_MAC]',
  1: 'Physical: Converting to 1s and 0s for cable transmission',
}

export default function PacketInspector() {
  const { packetState, currentOsiLayer, startPacketAnimation, packetData } = useLabStore()

  return (
    <div className="glass-panel" style={{
      position: 'absolute', top: '80px', right: '16px', width: '340px',
      padding: '16px', zIndex: 20, animation: 'fadeInUp 0.6s ease both'
    }}>
      <div className="corner-decoration corner-tl" /><div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" /><div className="corner-decoration corner-br" />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(0, 170, 255, 0.2)', paddingBottom: '8px' }}>
        <span style={{ fontSize: '14px' }}>📡</span>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: '#00aaff', textTransform: 'uppercase' }}>
          Packet Inspector
        </h2>
      </div>

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '16px' }}>
        Observe the journey of data from your assembled PC to the wider network. Watch how data is encapsulated as it descends the OSI model.
      </p>

      <button 
        className="cyber-btn" 
        onClick={startPacketAnimation}
        disabled={packetState === 'animating'}
        style={{
          width: '100%', marginBottom: '16px', padding: '10px', fontSize: '11px',
          borderColor: packetState === 'animating' ? '#64748b' : '#00ffc8',
          color: packetState === 'animating' ? '#64748b' : '#00ffc8',
          background: packetState === 'animating' ? 'rgba(100,116,139,0.05)' : 'rgba(0,255,200,0.05)',
        }}
      >
        {packetState === 'animating' ? 'TRANSMITTING...' : '🚀 SEND DATA'}
      </button>

      <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '10px' }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#64748b', letterSpacing: '1px', marginBottom: '8px' }}>
          LIVE TELEMETRY
        </div>
        
        {packetState === null && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#4a5568', fontStyle: 'italic' }}>
            Awaiting transmission...
          </div>
        )}

        {packetState === 'animating' && currentOsiLayer > 0 && (
          <div style={{ animation: 'fadeInUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#e2e8f0' }}>Layer {currentOsiLayer} Encapsulation</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#00ffc8', background: 'rgba(0,255,200,0.1)', padding: '6px', borderRadius: '4px', borderLeft: '2px solid #00ffc8' }}>
              {OSI_INFO[currentOsiLayer]}
            </div>
          </div>
        )}

        {packetState === 'animating' && currentOsiLayer === 0 && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#f59e0b', animation: 'pulse-glow 1s infinite' }}>
            {"->"} Packet traversing physical medium...
          </div>
        )}

        {packetState === 'done' && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#10b981' }}>
            ✅ Packet Received by Web Server!
          </div>
        )}
      </div>

      {packetData && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#64748b', letterSpacing: '1px', marginBottom: '6px' }}>ENCAPSULATION STACK</div>
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '2px' }}>
            {[1, 2, 3, 4, 5, 6, 7].map(l => (
              <div key={l} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '4px 8px', borderRadius: '3px',
                background: packetData[`layer${l}`] ? 'rgba(0, 170, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${packetData[`layer${l}`] ? 'rgba(0, 170, 255, 0.3)' : 'transparent'}`,
                transition: 'all 0.3s ease'
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', color: packetData[`layer${l}`] ? '#00aaff' : '#4a5568' }}>Layer {l}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', color: packetData[`layer${l}`] ? '#e2e8f0' : '#4a5568' }}>
                  {packetData[`layer${l}`] ? 'ADDED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
