import { useLabStore } from '../../store/useLabStore'
import { useIsMobile } from '../../hooks/useIsMobile'

const typeStyles = {
  success: { border: 'rgba(16,185,129,0.5)',  text: '#10b981', glow: 'rgba(16,185,129,0.3)',  icon: '✅' },
  danger:  { border: 'rgba(239,68,68,0.5)',   text: '#ef4444', glow: 'rgba(239,68,68,0.3)',   icon: '❌' },
  warn:    { border: 'rgba(245,158,11,0.5)',   text: '#f59e0b', glow: 'rgba(245,158,11,0.3)',  icon: '⚠️' },
  info:    { border: 'rgba(0,170,255,0.5)',    text: '#00aaff', glow: 'rgba(0,170,255,0.3)',   icon: 'ℹ️' },
  xp:      { border: 'rgba(251,191,36,0.7)',   text: '#fbbf24', glow: 'rgba(251,191,36,0.3)',  icon: '⭐' },
}

export default function ToastStack() {
  const toasts = useLabStore(s => s.toasts)
  const isMobile = useIsMobile()

  if (toasts.length === 0) return null

  /* ── MOBILE: ultra-lightweight pill toasts (no blur, no glow, GPU-friendly) ── */
  if (isMobile) {
    // Only show the last 1 toast on mobile to avoid any stacking lag
    const latest = toasts[toasts.length - 1]
    const s = typeStyles[latest.type] || typeStyles.info
    return (
      <div style={{
        position: 'fixed',
        top: 52,            // just below the top bar
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        pointerEvents: 'none',
        animation: 'fadeInUp 0.2s ease',
      }}>
        <div style={{
          background: '#0d1526',        // solid — no blur needed
          border: `1px solid ${s.border}`,
          borderRadius: 20,
          padding: '5px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 11 }}>{s.icon}</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: s.text,
            letterSpacing: 0.3,
          }}>
            {latest.message}
          </span>
        </div>
      </div>
    )
  }

  /* ── DESKTOP: full glass-panel stack ── */
  return (
    <div style={{
      position: 'absolute',
      bottom: 70,           // above XPBar
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      zIndex: 50,
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => {
        const s = typeStyles[toast.type] || typeStyles.info
        return (
          <div key={toast.id} className="toast glass-panel" style={{
            padding: '10px 20px',
            borderColor: s.border,
            minWidth: 260,
            textAlign: 'center',
            boxShadow: `0 0 16px ${s.glow}`,
            animation: 'fadeInUp 0.25s ease',
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: '#e2e8f0',
              letterSpacing: 0.5,
            }}>
              {s.icon} {toast.message}
            </span>
          </div>
        )
      })}
    </div>
  )
}
