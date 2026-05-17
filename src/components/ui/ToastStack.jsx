import { useLabStore } from '../../store/useLabStore'

/**
 * Toast notification stack — displays temporary messages at bottom-center.
 */
export default function ToastStack() {
  const { toasts } = useLabStore()

  const typeStyles = {
    success: { borderColor: 'rgba(16, 185, 129, 0.4)', iconColor: '#10b981' },
    danger: { borderColor: 'rgba(239, 68, 68, 0.4)', iconColor: '#ef4444' },
    warn: { borderColor: 'rgba(245, 158, 11, 0.4)', iconColor: '#f59e0b' },
    info: { borderColor: 'rgba(0, 170, 255, 0.4)', iconColor: '#00aaff' },
  }

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 50,
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => {
        const style = typeStyles[toast.type] || typeStyles.info
        return (
          <div
            key={toast.id}
            className="toast glass-panel"
            style={{
              padding: '10px 20px',
              borderColor: style.borderColor,
              minWidth: '280px',
              textAlign: 'center',
              boxShadow: `0 0 20px ${style.borderColor}`,
            }}
          >
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: '#e2e8f0',
              letterSpacing: '0.5px',
            }}>
              {toast.message}
            </span>
          </div>
        )
      })}
    </div>
  )
}
