import { useState, useMemo } from 'react'
import { useLabStore, TUTORIAL_STEPS, SCREWABLE, DEPENDENCIES, C } from '../../store/useLabStore'

const CABLE_GUIDE = {
  [C.POWER_CABLE]: { from: 'PSU (bottom)', to: '24-Pin ATX header (right edge of motherboard)', path: 'Route through cable routing holes behind motherboard tray' },
  [C.SATA_DATA]: { from: 'Motherboard SATA port (bottom-right)', to: 'HDD/SSD data connector', path: 'Flat ribbon cable — keeps data flowing to drives' },
  [C.SATA_POWER]: { from: 'PSU SATA power output', to: 'HDD/SSD power connector', path: 'Provides +3.3V, +5V, +12V power to your storage drives' },
  [C.FRONT_PANEL]: { from: 'Case front panel (top-front)', to: 'F_PANEL header (bottom-right of motherboard)', path: 'Tiny 2-pin connectors — Power SW, Reset SW, HDD LED' },
  [C.MAIN_POWER]: { from: 'PSU power inlet (rear)', to: 'Wall outlet / Rack PDU', path: 'C13 power cord — connects your build to electricity' },
}

const INFRA_CABLE_GUIDE = [
  { id: 'power', name: 'Power Cable', color: '#f43f5e', from: 'Any Device PWR port', to: 'UPS battery outlets (OUT1 - OUT6)', path: 'Delivers AC electricity to turn on devices.' },
  { id: 'cat6', name: 'CAT6 Cable', color: '#00aaff', from: 'LAN / WAN network ports', to: 'Switch, Router, or Server ports', path: 'Standard local copper data connection (up to 10Gbps).' },
  { id: 'fiber', name: 'Fiber SFP+', color: '#39ff14', from: 'SFP+ optical interface', to: 'High-speed Switch or Server link', path: 'High-bandwidth optical fiber for fast server uplinks.' }
]

const INFRA_TIPS = [
  { icon: '⚡', text: 'Select a cable in your sidebar or checklist, and compatible ports will instantly pulse in 3D!', color: '#f59e0b' },
  { icon: '🚫', text: 'Active port validation prevents invalid cross-wiring (e.g. plugging data into power outlets).', color: '#ef4444' },
  { icon: '🟢', text: 'Devices will show green or colored blinking LED lights as soon as they have power cabled.', color: '#10b981' },
  { icon: '💻', text: 'Once all cabled connections are complete, go to the Admin Terminal on the desk to run diagnostics!', color: '#00aaff' },
  { icon: '🔄', text: 'Left-drag to Orbit the camera, right-drag to Pan, and use the scroll wheel to Zoom in closely to tiny ports.', color: '#94a3b8' }
]

export default function HelpPanel() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeGuide, setActiveGuide] = useState('steps') // 'steps' | 'cables' | 'tips'
  const { components, selectedComponent, setSelected, installComponent, isComponentLocked } = useLabStore()
  
  // Infrastructure state
  const activeTab = useLabStore(s => s.activeTab)
  const infraCables = useLabStore(s => s.infraCables)
  const setInfraSelectedCable = useLabStore(s => s.setInfraSelectedCable)
  const infraSelectedCable = useLabStore(s => s.infraSelectedCable)

  // 1. Calculate Hardware steps
  const currentStepIdx = TUTORIAL_STEPS.findIndex(step => {
    const comp = components.find(c => c.id === step.component)
    return comp && !comp.installed
  })
  const currentStep = currentStepIdx >= 0 ? TUTORIAL_STEPS[currentStepIdx] : null
  const cableComponents = components.filter(c => c.category === 'cable')

  // 2. Calculate Infrastructure steps dynamically
  const isSrvPowered = useMemo(() => infraCables.some(c => !c.isFaulty && c.type === 'power' && ((c.source.id === 'srv1_pwr' && c.dest.id.startsWith('ups')) || (c.dest.id === 'srv1_pwr' && c.source.id.startsWith('ups')))), [infraCables])
  const isSwitchPowered = useMemo(() => infraCables.some(c => !c.isFaulty && c.type === 'power' && ((c.source.id === 'switch_pwr' && c.dest.id.startsWith('ups')) || (c.dest.id === 'switch_pwr' && c.source.id.startsWith('ups')))), [infraCables])
  const isRouterPowered = useMemo(() => infraCables.some(c => !c.isFaulty && c.type === 'power' && ((c.source.id === 'router_pwr' && c.dest.id.startsWith('ups')) || (c.dest.id === 'router_pwr' && c.source.id.startsWith('ups')))), [infraCables])
  const isSrvToSwitch = useMemo(() => infraCables.some(c => !c.isFaulty && c.type !== 'power' && ((c.source.id.startsWith('srv1_p') && c.dest.id.startsWith('switch')) || (c.dest.id.startsWith('srv1_p') && c.source.id.startsWith('switch')))), [infraCables])
  const isSwitchToRouter = useMemo(() => infraCables.some(c => !c.isFaulty && c.type !== 'power' && ((c.source.id.startsWith('switch') && c.dest.id.startsWith('router_lan')) || (c.dest.id.startsWith('switch') && c.source.id.startsWith('router_lan')))), [infraCables])
  const isRouterToISP = useMemo(() => infraCables.some(c => !c.isFaulty && c.type !== 'power' && ((c.source.id === 'router_wan' && c.dest.id === 'external_wan') || (c.dest.id === 'router_wan' && c.source.id === 'external_wan'))), [infraCables])

  const INFRA_STEPS = [
    { id: 1, title: 'Power Server (SRV-01)', desc: 'Connect SRV-01 Power (PWR) to any UPS Outlet using a Power Cable.', isDone: isSrvPowered, cable: 'power' },
    { id: 2, title: 'Power Switch', desc: 'Connect Switch Power (PWR) to any UPS Outlet using a Power Cable.', isDone: isSwitchPowered, cable: 'power' },
    { id: 3, title: 'Power Router', desc: 'Connect Router Power (PWR) to any UPS Outlet using a Power Cable.', isDone: isRouterPowered, cable: 'power' },
    { id: 4, title: 'Link Server to Switch', desc: 'Connect SRV-01 LAN 1 to Switch (any port 1-24) using a CAT6 Cable.', isDone: isSrvToSwitch, cable: 'cat6' },
    { id: 5, title: 'Link Switch to Router', desc: 'Connect Switch (any port 1-24) to Router LAN L1-L4 using a CAT6 Cable.', isDone: isSwitchToRouter, cable: 'cat6' },
    { id: 6, title: 'Uplink Router to ISP', desc: 'Connect Router WAN to ISP DEMARC (ISP) using a CAT6 Cable to enable web connection.', isDone: isRouterToISP, cable: 'cat6' },
  ]

  const currentInfraStep = INFRA_STEPS.find(s => !s.isDone)

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
      <div className="corner-decoration corner-tl" /><div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" /><div className="corner-decoration corner-br" />

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
          }}>
            {activeTab === 'infra' ? 'Cabling Tutorial' : 'Assembly Guide'}
          </span>
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

          {/* ============================================================== */}
          {/* ─────── INFRASTRUCTURE MODE (activeTab === 'infra') ─────── */}
          {/* ============================================================== */}
          {activeTab === 'infra' && (
            <>
              {/* ─── INFRA STEPS TAB ─── */}
              {activeGuide === 'steps' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentInfraStep ? (
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
                        }}>{currentInfraStep.id}</div>
                        <div>
                          <div style={{
                            fontFamily: "'Orbitron',sans-serif", fontSize: '10px', fontWeight: 700,
                            letterSpacing: '1px', color: '#00aaff', textTransform: 'uppercase',
                          }}>TASK: {currentInfraStep.title}</div>
                        </div>
                      </div>
                      
                      <div style={{
                        fontFamily: "'Inter',sans-serif", fontSize: '10px', color: '#cbd5e1',
                        lineHeight: '1.6', marginBottom: '10px',
                      }}>
                        {currentInfraStep.desc}
                      </div>

                      {/* Cable Quick Action Button */}
                      <button
                        onClick={() => setInfraSelectedCable(currentInfraStep.cable)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: infraSelectedCable === currentInfraStep.cable 
                            ? (currentInfraStep.cable === 'power' ? 'rgba(244,63,94,0.15)' : 'rgba(0,255,200,0.15)') 
                            : 'rgba(0,170,255,0.1)',
                          border: `1px solid ${infraSelectedCable === currentInfraStep.cable 
                            ? (currentInfraStep.cable === 'power' ? '#f43f5e' : '#00ffc8') 
                            : '#00aaff'}`,
                          color: infraSelectedCable === currentInfraStep.cable 
                            ? (currentInfraStep.cable === 'power' ? '#f43f5e' : '#00ffc8') 
                            : '#00aaff',
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: '8px',
                          fontWeight: 'bold',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          boxShadow: infraSelectedCable === currentInfraStep.cable 
                            ? `0 0 8px ${currentInfraStep.cable === 'power' ? 'rgba(244,63,94,0.3)' : 'rgba(0,255,200,0.3)'}` 
                            : 'none',
                          transition: 'all 0.2s',
                          marginBottom: '10px'
                        }}
                      >
                        {infraSelectedCable === currentInfraStep.cable 
                          ? `🔌 ${currentInfraStep.cable.toUpperCase()} CABLE ACTIVE - CLICK 3D PORTS`
                          : `👆 Click to Grab ${currentInfraStep.cable.toUpperCase()} Cable`}
                      </button>

                      {/* Step-by-step visual connector guide */}
                      {currentInfraStep.cable === 'power' && (
                        <div style={{
                          padding: '10px',
                          background: 'rgba(244, 63, 94, 0.08)',
                          border: '1px solid rgba(244, 63, 94, 0.2)',
                          borderRadius: '6px',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '9px',
                          color: '#fca5a5',
                          lineHeight: '1.4',
                          animation: 'fadeInUp 0.3s ease'
                        }}>
                          <div style={{ fontWeight: 'bold', color: '#f43f5e', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>⚡ POWER CABLING GUIDE:</span>
                          </div>
                          <ol style={{ paddingLeft: '14px', margin: '4px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <li>Click the <strong>"Grab POWER Cable"</strong> button above (it will activate and glow <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>Rose Pink</span>).</li>
                            <li>Locate the target device in the rack: <strong>{currentInfraStep.title.includes('Server') ? 'SRV-01 (middle)' : currentInfraStep.title.includes('Switch') ? 'Switch (upper-middle)' : 'Router (top)'}</strong>.</li>
                            <li>Click the flashing <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>PWR port</span> on the <strong>far-left</strong> of that device.</li>
                            <li>Scroll/drag down to the bottom of the rack to find the **UPS battery unit** (labeled "UPS" in amber).</li>
                            <li>Click any of the flashing <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>OUT1 - OUT6</span> ports to plug it in!</li>
                          </ol>
                          <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '6px', fontStyle: 'italic', borderTop: '1px solid rgba(244,63,94,0.1)', paddingTop: '4px' }}>
                            💡 Note: Power ports will blink green as soon as they receive electricity!
                          </div>
                        </div>
                      )}

                      {currentInfraStep.cable === 'cat6' && (
                        <div style={{
                          padding: '10px',
                          background: 'rgba(0, 170, 255, 0.08)',
                          border: '1px solid rgba(0, 170, 255, 0.2)',
                          borderRadius: '6px',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '9px',
                          color: '#bae6fd',
                          lineHeight: '1.4',
                          animation: 'fadeInUp 0.3s ease'
                        }}>
                          <div style={{ fontWeight: 'bold', color: '#00aaff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>🌐 DATA CABLING GUIDE:</span>
                          </div>
                          <ol style={{ paddingLeft: '14px', margin: '4px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <li>Click the <strong>"Grab CAT6 Cable"</strong> button above (it glows <span style={{ color: '#00aaff', fontWeight: 'bold' }}>Neon Blue</span>).</li>
                            {currentInfraStep.id === 4 && (
                              <>
                                <li>Click the flashing <span style={{ color: '#00aaff', fontWeight: 'bold' }}>LAN 1</span> port on the Server (SRV-01).</li>
                                <li>Click any flashing <span style={{ color: '#00aaff', fontWeight: 'bold' }}>Switch port (1-24)</span> in the middle of the rack to connect it.</li>
                              </>
                            )}
                            {currentInfraStep.id === 5 && (
                              <>
                                <li>Click any flashing <span style={{ color: '#00aaff', fontWeight: 'bold' }}>Switch port (1-24)</span> in the middle of the rack.</li>
                                <li>Click any flashing <span style={{ color: '#00aaff', fontWeight: 'bold' }}>LAN port (L1-L4)</span> on the Router above it to link them.</li>
                              </>
                            )}
                            {currentInfraStep.id === 6 && (
                              <>
                                <li>Click the flashing red <span style={{ color: '#ef4444', fontWeight: 'bold' }}>WAN port</span> on the Router (middle-right).</li>
                                <li>Click the flashing <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>ISP port</span> on the External Demarc box next to the rack.</li>
                              </>
                            )}
                          </ol>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: 8,
                      padding: '12px',
                      textAlign: 'center',
                      marginBottom: '4px'
                    }}>
                      <div style={{
                        fontFamily: "'Orbitron',sans-serif", fontSize: '11px', fontWeight: 700,
                        color: '#10b981', marginBottom: '4px',
                      }}>✅ ALL CABLING WORK COMPLETE</div>
                      <div style={{
                        fontFamily: "'Inter',sans-serif", fontSize: '9px', color: '#a7f3d0',
                        lineHeight: '1.4'
                      }}>
                        All power and network routes are linked! Go to the [ Network ] tab and test data packet flows.
                      </div>
                    </div>
                  )}

                  {/* Checklist display */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                    {INFRA_STEPS.map(step => (
                      <div
                        key={step.id}
                        onClick={() => !step.isDone && setInfraSelectedCable(step.cable)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '6px 8px', borderRadius: 6,
                          background: currentInfraStep?.id === step.id ? 'rgba(0,170,255,0.04)' : 'transparent',
                          border: `1px solid ${currentInfraStep?.id === step.id ? 'rgba(0,170,255,0.15)' : 'transparent'}`,
                          cursor: step.isDone ? 'default' : 'pointer',
                          opacity: step.isDone ? 0.5 : 1,
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                          background: step.isDone ? '#10b981' : currentInfraStep?.id === step.id ? '#00aaff' : '#1e293b',
                          border: `2px solid ${step.isDone ? '#10b981' : currentInfraStep?.id === step.id ? '#00aaff' : '#334155'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: "'Orbitron',sans-serif", fontSize: '7px', fontWeight: 900,
                          color: step.isDone || currentInfraStep?.id === step.id ? '#fff' : '#64748b',
                        }}>{step.isDone ? '✓' : step.id}</div>
                        
                        <div style={{
                          fontFamily: "'Orbitron',sans-serif", fontSize: '8.5px',
                          color: step.isDone ? '#64748b' : currentInfraStep?.id === step.id ? '#00aaff' : '#cbd5e1',
                          textDecoration: step.isDone ? 'line-through' : 'none',
                          letterSpacing: '0.5px',
                        }}>{step.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── INFRA CABLES TAB ─── */}
              {activeGuide === 'cables' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {INFRA_CABLE_GUIDE.map(cable => (
                    <div
                      key={cable.id}
                      onClick={() => setInfraSelectedCable(cable.id)}
                      style={{
                        padding: '8px 10px', borderRadius: 8,
                        background: infraSelectedCable === cable.id ? `${cable.color}15` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${infraSelectedCable === cable.id ? cable.color + '40' : 'rgba(255,255,255,0.06)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: 2,
                          background: cable.color,
                          boxShadow: `0 0 6px ${cable.color}80`
                        }} />
                        <span style={{
                          fontFamily: "'Orbitron',sans-serif", fontSize: '9px', fontWeight: 700,
                          color: cable.color, letterSpacing: '0.5px'
                        }}>{cable.name}</span>
                      </div>

                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '7.5px', color: '#94a3b8', marginBottom: '3px' }}>
                        <span style={{ color: '#00ffc8' }}>SOURCE:</span> {cable.from}
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '7.5px', color: '#94a3b8', marginBottom: '3px' }}>
                        <span style={{ color: '#ff6b9d' }}>TARGET:</span> {cable.to}
                      </div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: '7.5px', color: '#64748b', fontStyle: 'italic' }}>
                        {cable.path}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ─── INFRA TIPS TAB ─── */}
              {activeGuide === 'tips' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {INFRA_TIPS.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '8px',
                      padding: '6px 8px', borderRadius: 4,
                      background: 'rgba(255,255,255,0.02)',
                    }}>
                      <span style={{ fontSize: '11px', flexShrink: 0 }}>{item.icon}</span>
                      <span style={{
                        fontFamily: "'Inter',sans-serif", fontSize: '9px',
                        color: '#b0bec5', lineHeight: '1.5'
                      }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ============================================================== */}
          {/* ─────── HARDWARE MODE (activeTab === 'hardware') ─────── */}
          {/* ============================================================== */}
          {activeTab === 'hardware' && (
            <>
              {/* ─── HARDWARE STEPS TAB ─── */}
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

              {/* ─── HARDWARE TIPS TAB ─── */}
              {activeGuide === 'tips' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { icon: '👁️', text: 'Ghost outlines inside the chassis show WHERE each part goes. Brighter = next step!', color: '#00aaff' },
                    { icon: '🖱️', text: 'Click a component card on the right, then click it again to install/place it.', color: '#00ffc8' },
                    { icon: '🔌', text: 'Glowing dots inside the case show cable connector ports. Select a cable to see its route.', color: '#ff6b9d' },
                    { icon: '📦', text: 'PSU, HDD, & SSD are mounted instantly when placed, bypassing slow screw installation.', color: '#00ffc8' },
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
        </>
      )}
    </div>
  )
}
