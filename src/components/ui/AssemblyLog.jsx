import { useLabStore } from '../../store/useLabStore'

/**
 * Assembly log — a scrollable terminal-style log at bottom-left showing all actions.
 */
export default function AssemblyLog() {
  const { assemblyLog } = useLabStore()

  return (
    <div className="glass-panel assembly-log" style={{
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      width: '320px',
      maxHeight: '180px',
      padding: '12px 14px',
      zIndex: 20,
      animation: 'fadeInUp 0.7s ease both',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '8px',
        paddingBottom: '6px',
        borderBottom: '1px solid rgba(0, 255, 200, 0.1)',
      }}>
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: '#00ffc8',
          boxShadow: '0 0 6px rgba(0, 255, 200, 0.6)',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }} />
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '1.5px',
          color: '#00ffc8',
          textTransform: 'uppercase',
        }}>
          Assembly Log
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '8px',
          color: '#4a5568',
          marginLeft: 'auto',
        }}>
          [{assemblyLog.length} entries]
        </span>
      </div>

      {/* Log entries */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
      }}>
        {assemblyLog.length === 0 ? (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: '#4a5568',
            fontStyle: 'italic',
            padding: '8px 0',
          }}>
            <span style={{ animation: 'blink-cursor 1s infinite', marginRight: '4px' }}>▌</span>
            Awaiting assembly actions...
          </div>
        ) : (
          assemblyLog.map((entry, i) => (
            <div key={i} style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px',
              color: '#94a3b8',
              lineHeight: '1.4',
              padding: '2px 0',
              animation: 'fadeInUp 0.3s ease both',
            }}>
              <span style={{ color: '#4a5568', marginRight: '6px' }}>{entry.time}</span>
              {entry.action}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
