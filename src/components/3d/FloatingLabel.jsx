import { Html } from '@react-three/drei'

/**
 * Antigravity floating label — appears above components on hover.
 * Uses drei's <Html /> for DOM-in-3D overlay with a cybernetic glass style.
 */
export default function FloatingLabel({ visible, name, detail, color = '#00ffc8', position = [0, 1.2, 0] }) {
  if (!visible) return null

  return (
    <group position={position}>
      <Html
        center
        distanceFactor={6}
        style={{
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          style={{
            animation: 'float-label 3s ease-in-out infinite',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {/* Connector line */}
          <div
            style={{
              width: '1px',
              height: '30px',
              background: `linear-gradient(to top, transparent, ${color})`,
              marginBottom: '-2px',
            }}
          />

          {/* Main label card */}
          <div
            style={{
              background: 'rgba(3, 7, 18, 0.92)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${color}40`,
              borderRadius: '10px',
              padding: '10px 16px',
              minWidth: '180px',
              textAlign: 'center',
              boxShadow: `0 0 25px ${color}20, 0 0 50px ${color}10, inset 0 0 15px ${color}05`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Scanline effect */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
                pointerEvents: 'none',
                borderRadius: '10px',
              }}
            />

            {/* Corner decorations */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
              const isTop = corner.includes('top')
              const isLeft = corner.includes('left')
              return (
                <div
                  key={corner}
                  style={{
                    position: 'absolute',
                    width: '8px',
                    height: '8px',
                    [isTop ? 'top' : 'bottom']: '4px',
                    [isLeft ? 'left' : 'right']: '4px',
                    borderColor: color,
                    borderStyle: 'solid',
                    borderWidth: `${isTop ? '1' : '0'}px ${isLeft ? '0' : '1'}px ${isTop ? '0' : '1'}px ${isLeft ? '1' : '0'}px`,
                    opacity: 0.6,
                  }}
                />
              )
            })}

            {/* Status indicator dot */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '4px',
              }}
            >
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 8px ${color}`,
                  animation: 'pulse-glow 2s ease-in-out infinite',
                }}
              />
              <span
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: color,
                  textShadow: `0 0 10px ${color}80`,
                  textTransform: 'uppercase',
                }}
              >
                {name}
              </span>
            </div>

            {/* Detail text */}
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px',
                color: '#94a3b8',
                letterSpacing: '0.5px',
                lineHeight: '1.4',
              }}
            >
              {detail}
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}
