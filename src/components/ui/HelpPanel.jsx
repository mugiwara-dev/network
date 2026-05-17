import { useState } from 'react'
import { useLabStore, TUTORIAL_STEPS, SCREWABLE, DEPENDENCIES, C } from '../../store/useLabStore'

const CABLE_GUIDE = {
  [C.POWER_CABLE]: { from: 'PSU (bottom)', to: '24-Pin ATX header (right edge of motherboard)', path: 'Route through cable routing holes behind motherboard tray' },
  [C.SATA_DATA]: { from: 'Motherboard SATA port (bottom-right)', to: 'HDD/SSD data connector', path: 'Flat ribbon cable — keeps data flowing to drives' },
  [C.SATA_POWER]: { from: 'PSU SATA power output', to: 'HDD/SSD power connector', path: 'Provides +3.3V, +5V, +12V power to your storage drives' },
  [C.FRONT_PANEL]: { from: 'Case front panel (top-front)', to: 'F_PANEL header (bottom-right of motherboard)', path: 'Tiny 2-pin connectors — Power SW, Reset SW, HDD LED' },
  [C.MAIN_POWER]: { from: 'PSU power inlet (rear)', to: 'Wall outlet / Rack PDU', path: 'C13 power cord — connects your build to electricity' },
}

export default function HelpPanel() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeGuide, setActiveGuide] = useState('steps') // 'steps' | 'cables' | 'tips'
  const { components, selectedComponent, setSelected, installComponent, isComponentLocked } = useLabStore()

  // Find current tutorial step
  const currentStepIdx = TUTORIAL_STEPS.findIndex(step => {
    const comp = components.find(c => c.id === step.component)
    return comp && !comp.installed
  })
  const currentStep = currentStepIdx >= 0 ? TUTORIAL_STEPS[currentStepIdx] : null

  // Get all cables
  const cableComponents = components.filter(c => c.category === 'cable')

  return (
    <div className="glass-panel help-panel" style={{
      position: 'absolute', top: '80px', left: '16px',
      width: isExpanded ? '320px' : '48px',
      padding: isExpanded ? '12px 14px' : '10px',
      zIndex: 20, animation: 'fadeInUp 0.8s ease both',
      transition: 'width 0.3s ease, padding 0.3s ease',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
    }}>
      {/* Collapse/Expand toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer', marginBottom: isExpanded ? '10px' : '0',
          paddingBottom: isExpanded ? '8px' : '0',
          borderBottom: isExpanded ? '1px solid rgba(0,170,255,0.15)' : 'none',
        }}
      >
        <span style={{ fontSize: '14px' }}>{isExpanded ? '📖' : '❓'}</span>
        {isExpanded && (
          <span style={{
            fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 600,
            letterSpacing: '1.5px', color: '#00aaff', textTransform: 'uppercase', flex: 1,
          }}>Assembly Guide</span>
        )}
        <span style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#64748b',
          transition: 'transform 0.3s', transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
        }}>{isExpanded ? '◀' : '▶'}</span>
      </div>

      {!isExpanded ? null : (
        <>
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
            {[
              { id: 'steps', label: '📋 Steps', color: '#00aaff' },
              { id: 'cables', label: '🔌 Cables', color: '#ff6b9d' },
              { id: 'tips', label: '💡 Tips', color: '#f59e0b' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveGuide(tab.id)}
                style={{
                  flex: 1,
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: '7px',
                  letterSpacing: '1px',
                  padding: '5px 4px',
                  border: `1px solid ${activeGuide === tab.id ? tab.color + '80' : 'rgba(100,116,139,0.2)'}`,
                  borderRadius: 6,
                  background: activeGuide === tab.id ? tab.color + '15' : 'transparent',
                  color: activeGuide === tab.id ? tab.color : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── STEPS TAB ─── */}
          {activeGuide === 'steps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Current step highlight */}
              {currentStep && (
                <div style={{
                  background: 'rgba(0,170,255,0.08)',
                  border: '1px solid rgba(0,170,255,0.3)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: '4px',
                  animation: 'fadeInUp 0.3s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00aaff, #00ffc8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 900,
                      color: '#030712',
                    }}>{currentStep.id}</div>
                    <div>
                      <div style={{
                        fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 700,
                        letterSpacing: '1px', color: '#00aaff', textTransform: 'uppercase',
                      }}>NOW: {currentStep.title}</div>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "'Inter',sans-serif", fontSize: '10px', color: '#94a3b8',
                    lineHeight: '1.6', marginBottom: '8px',
                  }}>{currentStep.desc}</div>

                  {/* Quick action button */}
                  {(() => {
                    const comp = components.find(c => c.id === currentStep.component)
                    const locked = isComponentLocked(currentStep.component)
                    if (!comp || comp.installed) return null
                    return (
                      <button
                        className="cyber-btn"
                        disabled={locked}
                        onClick={() => {
                          setSelected(currentStep.component)
                          if (!locked) installComponent(currentStep.component)
                        }}
                        style={{
                          width: '100%', fontSize: '8px', padding: '5px 10px',
                          borderColor: locked ? '#64748b' : '#00aaff',
                          color: locked ? '#64748b' : '#00aaff',
                        }}
                      >
                        {locked ? '🔒 Dependencies needed' : `👆 Select & ${SCREWABLE.includes(currentStep.component) ? 'Place' : 'Install'} ${comp.name}`}
                      </button>
                    )
                  })()}
                </div>
              )}

              {!currentStep && (
                <div style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: "'Orbitron',sans-serif", fontSize: '11px', fontWeight: 700,
                    color: '#10b981', marginBottom: '4px',
                  }}>✅ ALL STEPS COMPLETE</div>
                  <div style={{
                    fontFamily: "'Inter',sans-serif", fontSize: '9px', color: '#a7f3d0',
                  }}>Click ⏻ Power On to run POST test</div>
                </div>
              )}

              {/* Step list */}
              {TUTORIAL_STEPS.map((step, i) => {
                const comp = components.find(c => c.id === step.component)
                const isDone = comp?.installed
                const isCurrent = currentStepIdx === i
                return (
                  <div
                    key={step.id}
                    onClick={() => !isDone && setSelected(step.component)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '6px 8px', borderRadius: 6,
                      background: isCurrent ? 'rgba(0,170,255,0.05)' : 'transparent',
                      border: `1px solid ${isCurrent ? 'rgba(0,170,255,0.2)' : 'transparent'}`,
                      cursor: isDone ? 'default' : 'pointer',
                      opacity: isDone ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      background: isDone ? '#10b981' : isCurrent ? '#00aaff' : '#1e293b',
                      border: `2px solid ${isDone ? '#10b981' : isCurrent ? '#00aaff' : '#334155'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Orbitron',sans-serif", fontSize: '7px', fontWeight: 900,
                      color: isDone || isCurrent ? '#fff' : '#64748b',
                    }}>{isDone ? '✓' : step.id}</div>
                    <div>
                      <div style={{
                        fontFamily: "'Orbitron',sans-serif", fontSize: '8px',
                        color: isDone ? '#64748b' : isCurrent ? '#00aaff' : '#94a3b8',
                        textDecoration: isDone ? 'line-through' : 'none',
                        letterSpacing: '0.5px',
                      }}>{step.title}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ─── CABLES TAB ─── */}
          {activeGuide === 'cables' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                fontFamily: "'Inter',sans-serif", fontSize: '9px', color: '#94a3b8',
                lineHeight: '1.5', marginBottom: '4px',
                padding: '6px 8px', background: 'rgba(255,107,157,0.05)',
                border: '1px solid rgba(255,107,157,0.15)', borderRadius: 6,
              }}>
                <strong style={{ color: '#ff6b9d' }}>💡 Where do cables go?</strong><br />
                Look for <span style={{ color: '#ff6b9d' }}>glowing dots</span> inside the chassis — 
                they show connector port locations. Select a cable to see its route highlighted.
              </div>

              {cableComponents.map(cable => {
                const guide = CABLE_GUIDE[cable.id]
                if (!guide) return null
                const locked = isComponentLocked(cable.id)
                const deps = (DEPENDENCIES[cable.id] || [])
                const missing = deps.filter(d => !components.find(c => c.id === d)?.installed)

                return (
                  <div
                    key={cable.id}
                    onClick={() => setSelected(cable.id)}
                    style={{
                      padding: '8px 10px', borderRadius: 8,
                      background: cable.installed
                        ? 'rgba(16,185,129,0.06)'
                        : selectedComponent === cable.id
                        ? `${cable.color}15`
                        : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${cable.installed
                        ? 'rgba(16,185,129,0.3)'
                        : selectedComponent === cable.id
                        ? cable.color + '40'
                        : 'rgba(255,255,255,0.06)'}`,
                      cursor: cable.installed ? 'default' : 'pointer',
                      opacity: cable.installed ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: 2,
                          background: cable.color,
                          boxShadow: `0 0 6px ${cable.color}80`,
                        }} />
                        <span style={{
                          fontFamily: "'Orbitron',sans-serif", fontSize: '9px', fontWeight: 700,
                          color: cable.color, letterSpacing: '0.5px',
                        }}>{cable.name}</span>
                      </div>
                      {cable.installed && (
                        <span style={{
                          fontFamily: "'JetBrains Mono',monospace", fontSize: '7px',
                          color: '#10b981', background: 'rgba(16,185,129,0.1)',
                          padding: '1px 5px', borderRadius: 3,
                        }}>CONNECTED</span>
                      )}
                    </div>

                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '7.5px', color: '#94a3b8', marginBottom: '3px' }}>
                      <span style={{ color: '#00ffc8' }}>FROM:</span> {guide.from}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '7.5px', color: '#94a3b8', marginBottom: '3px' }}>
                      <span style={{ color: '#ff6b9d' }}>TO:</span> {guide.to}
                    </div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '7.5px', color: '#64748b', fontStyle: 'italic' }}>
                      {guide.path}
                    </div>

                    {locked && missing.length > 0 && (
                      <div style={{
                        fontFamily: "'JetBrains Mono',monospace", fontSize: '7px',
                        color: '#f59e0b', marginTop: '4px',
                        background: 'rgba(245,158,11,0.08)',
                        border: '1px solid rgba(245,158,11,0.15)',
                        borderRadius: 3, padding: '2px 5px',
                      }}>
                        ⚠ Need first: {missing.map(d => d.replace(/_/g, ' ').toUpperCase()).join(', ')}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ─── TIPS TAB ─── */}
          {activeGuide === 'tips' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { icon: '👁️', text: 'Ghost outlines inside the chassis show WHERE each part goes. Brighter = next step!', color: '#00aaff' },
                { icon: '🖱️', text: 'Click a component card on the right, then click it again to install/place it.', color: '#00ffc8' },
                { icon: '🔌', text: 'Glowing dots inside the case show cable connector ports. Select a cable to see its route.', color: '#ff6b9d' },
                { icon: '🪛', text: 'PSU, HDD, & SSD need 4 screw clicks — look for the amber screw hole markers on the 3D model.', color: '#f59e0b' },
                { icon: '🔓', text: 'Unlock the RAM slot retention clips BEFORE inserting the DDR4 stick.', color: '#00ffc8' },
                { icon: '⚡', text: 'Install PSU first → it unlocks power cable, SATA cable, and main power.', color: '#f59e0b' },
                { icon: '🧊', text: 'CPU Cooler requires CPU installed first — it sits directly on top of the processor.', color: '#f97316' },
                { icon: '💾', text: 'SATA data & power cables both require PSU + HDD installed first.', color: '#06d6a0' },
                { icon: '🔊', text: 'POST beep codes trigger if RAM or CPU fan is missing when you try to power on.', color: '#ef4444' },
                { icon: '🖥️', text: 'No discrete GPU needed — this build uses Intel UHD 630 integrated graphics.', color: '#7b5ea7' },
                { icon: '🔄', text: 'Orbit: Left-drag · Zoom: Scroll wheel · Camera is locked to the case.', color: '#94a3b8' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  padding: '5px 6px', borderRadius: 4,
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'background 0.2s',
                }}>
                  <span style={{ fontSize: '11px', marginTop: '0px', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{
                    fontFamily: "'Inter',sans-serif", fontSize: '9px',
                    color: '#b0bec5', lineHeight: '1.5',
                  }}>{item.text}</span>
                </div>
              ))}

              {/* Hardware Spec Summary */}
              <div style={{
                marginTop: '6px', paddingTop: '8px',
                borderTop: '1px solid rgba(0,170,255,0.1)',
              }}>
                <div style={{
                  fontFamily: "'Orbitron',sans-serif", fontSize: '7px', letterSpacing: '1.5px',
                  color: '#64748b', textTransform: 'uppercase', marginBottom: '4px',
                }}>Build Specs</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
                  {[
                    'i3-10100 · UHD 630',
                    'H410M Micro-ATX',
                    '8GB DDR4-2666',
                    '500W 80+ Silver',
                    '120GB SSD + 500GB HDD',
                    'TESDA NC II Standard',
                  ].map((spec, i) => (
                    <div key={i} style={{
                      fontFamily: "'JetBrains Mono',monospace", fontSize: '6.5px',
                      color: '#4a6585', background: 'rgba(0,170,255,0.04)',
                      borderRadius: 2, padding: '2px 4px',
                    }}>{spec}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
