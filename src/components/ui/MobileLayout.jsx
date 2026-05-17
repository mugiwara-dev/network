import { useState } from 'react'
import LabScene from '../3d/LabScene'
import NetworkScene from '../3d/NetworkScene'
import InfraScene from '../3d/InfraScene'
import ITSandboxSimulator from './ITSandboxSimulator'
import PacketInspector from './PacketInspector'
import AdminTerminal from './AdminTerminal'
import ToastStack from './ToastStack'
import { QuizModal, AchievementPopup } from './GamificationUI'
import { useLabStore, TUTORIAL_STEPS, SCREWABLE, SCREWS_REQUIRED, ACHIEVEMENTS, DEPENDENCIES } from '../../store/useLabStore'

/* ─── MOBILE NAV TABS ─── */
const TABS = [
  { id:'hardware', icon:'🔧', label:'Build' },
  { id:'network',  icon:'🌐', label:'Network' },
  { id:'infra',    icon:'🖥️', label:'Infra' },
  { id:'simulator',icon:'💡', label:'Learn' },
]

/* ─── MOBILE BOTTOM DRAWER ─── */
function MobileDrawer({ open, onClose, children, title, color='#00ffc8' }) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div onClick={onClose} style={{
          position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',
          zIndex:80,backdropFilter:'blur(2px)'
        }}/>
      )}
      {/* Drawer */}
      <div style={{
        position:'fixed',bottom:0,left:0,right:0,zIndex:90,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition:'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        background:'rgba(3,7,18,0.98)',
        borderTop:`1px solid ${color}40`,
        borderRadius:'16px 16px 0 0',
        maxHeight:'72vh',display:'flex',flexDirection:'column',
      }}>
        {/* Handle */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'12px 16px',borderBottom:`1px solid rgba(255,255,255,0.06)`}}>
          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,
            fontWeight:700,color,letterSpacing:2,textTransform:'uppercase'}}>
            {title}
          </span>
          <button onClick={onClose} style={{background:'none',border:'none',
            color:'#64748b',fontSize:18,cursor:'pointer',padding:'0 4px'}}>✕</button>
        </div>
        {/* Content */}
        <div style={{overflowY:'auto',flex:1,padding:'12px 14px'}}>
          {children}
        </div>
      </div>
    </>
  )
}

/* ─── MOBILE HARDWARE PANEL ─── */
function MobileHardwarePanel({ onClose }) {
  const {
    components, ramSlotUnlocked, toggleRamSlot,
    installComponent, uninstallComponent, isComponentLocked,
    getInstallProgress, attemptPowerOn, powerOnState,
    screwProgress, addScrew, placedComponents, selectedComponent,
    setSelected, xp, level, achievements, quizCorrect, quizTotal
  } = useLabStore()
  const progress = getInstallProgress()
  const pct = Math.round((progress.done / progress.total) * 100)

  const currentStep = TUTORIAL_STEPS.find(step => {
    const comp = components.find(c => c.id === step.component)
    return comp && !comp.installed
  }) || null

  const catOrder = ['hardware','cooling','storage','power','cable']
  const catLabels = { hardware:'⚙️ Hardware', cooling:'❄️ Cooling', storage:'💾 Storage', power:'⚡ Power', cable:'🔌 Cables' }

  const [tab, setTab] = useState('build')

  return (
    <div>
      {/* XP + Level */}
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <div style={{flex:1,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',
          borderRadius:8,padding:'6px 10px',display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:6,background:'linear-gradient(135deg,#f59e0b,#fbbf24)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:900,color:'#000'}}>{level}</div>
          <div>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:'#f59e0b',letterSpacing:1}}>LEVEL {level}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:'#64748b'}}>{xp} XP</div>
          </div>
        </div>
        <div style={{flex:1,background:'rgba(0,255,200,0.06)',border:'1px solid rgba(0,255,200,0.2)',
          borderRadius:8,padding:'6px 10px'}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'#64748b',marginBottom:2}}>PROGRESS</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,color:'#00ffc8',fontWeight:700}}>{progress.done}/{progress.total}</div>
          <div style={{height:3,background:'rgba(0,255,200,0.1)',borderRadius:2,marginTop:4}}>
            <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#00ffc8,#00aaff)',
              borderRadius:2,transition:'width 0.5s ease'}}/>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:12}}>
        {[['build','⚙️ Build'],['awards','🏅 Awards']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            flex:1,padding:'7px 0',fontFamily:"'Orbitron',sans-serif",fontSize:8,
            letterSpacing:1,textTransform:'uppercase',cursor:'pointer',borderRadius:6,
            background: tab===id ? 'rgba(0,255,200,0.12)' : 'rgba(255,255,255,0.03)',
            border:`1px solid ${tab===id ? 'rgba(0,255,200,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: tab===id ? '#00ffc8' : '#64748b',transition:'all 0.2s'
          }}>{label}</button>
        ))}
      </div>

      {tab === 'awards' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'#64748b'}}>Quiz: {quizCorrect}/{quizTotal} correct</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'#f59e0b'}}>{achievements.length}/{ACHIEVEMENTS.length} unlocked</span>
          </div>
          {ACHIEVEMENTS.map(ach => {
            const unlocked = achievements.includes(ach.id)
            return (
              <div key={ach.id} style={{
                display:'flex',alignItems:'center',gap:10,padding:'8px',borderRadius:6,marginBottom:4,
                background: unlocked ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                border:`1px solid ${unlocked ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)'}`,
                opacity: unlocked ? 1 : 0.5,
              }}>
                <span style={{fontSize:20,filter:unlocked?'none':'grayscale(1)'}}>{ach.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,fontWeight:700,
                    color:unlocked?'#f59e0b':'#64748b'}}>{ach.title}</div>
                  <div style={{fontFamily:"'Inter',sans-serif",fontSize:7,color:'#475569'}}>{ach.desc}</div>
                </div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,
                  color:unlocked?'#f59e0b':'#475569'}}>{unlocked?`+${ach.xp}`:`${ach.xp}xp`}</div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'build' && <>
        {/* Current Step guide */}
        {currentStep && (
          <div style={{background:'rgba(0,170,255,0.06)',border:'1px solid rgba(0,170,255,0.2)',
            borderRadius:8,padding:'8px 10px',marginBottom:10}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:600,
              color:'#00aaff',letterSpacing:1,marginBottom:4}}>
              📋 STEP {currentStep.id}: {currentStep.title}
            </div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:'#94a3b8',lineHeight:1.5}}>
              {currentStep.desc}
            </div>
            {SCREWABLE.includes(currentStep.component) && (
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'#f59e0b',marginTop:4}}>
                🪛 Requires 4 manual screw clicks
              </div>
            )}
          </div>
        )}

        {/* RAM toggle */}
        <div style={{background:ramSlotUnlocked?'rgba(0,255,200,0.06)':'rgba(245,158,11,0.06)',
          border:`1px solid ${ramSlotUnlocked?'rgba(0,255,200,0.2)':'rgba(245,158,11,0.2)'}`,
          borderRadius:6,padding:'8px 10px',marginBottom:8,
          display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,
            color:ramSlotUnlocked?'#00ffc8':'#f59e0b'}}>
            {ramSlotUnlocked?'🔓 RAM Slot Open':'🔒 RAM Slot Locked'}
          </div>
          <button className="cyber-btn" onClick={toggleRamSlot}
            style={{fontSize:9,padding:'4px 10px',minHeight:32}}>
            {ramSlotUnlocked?'Lock':'Unlock'}
          </button>
        </div>

        {/* Power On */}
        <button className="cyber-btn" onClick={attemptPowerOn} style={{
          width:'100%',marginBottom:10,padding:'10px',fontSize:11,minHeight:40,
          borderColor:powerOnState==='success'?'#10b981':'#ff6b9d',
          color:powerOnState==='success'?'#10b981':'#ff6b9d',
          background:powerOnState==='success'?'rgba(16,185,129,0.08)':'rgba(255,107,157,0.05)',
        }}>
          {powerOnState==='success'?'🟢 System Running':'⏻ Power On (POST Test)'}
        </button>

        {/* Component list */}
        {catOrder.map(cat => {
          const cc = components.filter(c => c.category === cat)
          if (!cc.length) return null
          return (
            <div key={cat} style={{marginBottom:10}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,letterSpacing:1.5,
                color:'#64748b',textTransform:'uppercase',marginBottom:6,
                paddingBottom:4,borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                {catLabels[cat]}
              </div>
              {cc.map(comp => {
                const locked = isComponentLocked(comp.id)
                const isCable = comp.category === 'cable'
                const isScrewable = SCREWABLE.includes(comp.id)
                const screws = screwProgress[comp.id] || 0
                const isPlaced = placedComponents[comp.id] === true
                const missing = (DEPENDENCIES[comp.id]||[])
                  .filter(d=>!components.find(c=>c.id===d)?.installed)

                return (
                  <div key={comp.id}
                    style={{
                      padding:'10px',borderRadius:8,marginBottom:6,
                      background: comp.installed ? `${comp.color}10` : 'rgba(255,255,255,0.02)',
                      border:`1px solid ${comp.installed ? comp.color+'40' : 'rgba(255,255,255,0.08)'}`,
                      transition:'all 0.2s'
                    }}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:comp.color,
                          boxShadow:`0 0 6px ${comp.color}`,flexShrink:0}}/>
                        <div>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,
                            color:comp.color}}>{comp.name}</div>
                          <div style={{fontFamily:"'Inter',sans-serif",fontSize:8,color:'#64748b'}}>
                            {comp.detail}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontFamily:"'JetBrains Mono',monospace",fontSize:7,padding:'2px 6px',
                        borderRadius:3,
                        background: comp.installed ? `${comp.color}20` : locked ? 'rgba(100,116,139,0.1)' : 'rgba(0,255,200,0.1)',
                        border: `1px solid ${comp.installed ? comp.color+'60' : locked ? 'rgba(100,116,139,0.2)' : 'rgba(0,255,200,0.3)'}`,
                        color: comp.installed ? comp.color : locked ? '#64748b' : '#00ffc8',
                      }}>
                        {comp.installed ? (isCable?'WIRED':'INSTALLED') : isPlaced ? `🔩${screws}/${SCREWS_REQUIRED}` : locked ? 'LOCKED' : 'READY'}
                      </span>
                    </div>

                    {/* Screw progress */}
                    {isScrewable && isPlaced && !comp.installed && (
                      <div style={{marginBottom:6}}>
                        <div style={{height:4,background:'rgba(245,158,11,0.15)',borderRadius:2}}>
                          <div style={{height:'100%',width:`${(screws/SCREWS_REQUIRED)*100}%`,
                            background:'linear-gradient(90deg,#f59e0b,#00ffc8)',borderRadius:2,
                            transition:'width 0.3s ease'}}/>
                        </div>
                      </div>
                    )}

                    <div style={{display:'flex',gap:6}}>
                      {!comp.installed && !isPlaced && (
                        <button className="cyber-btn" disabled={locked}
                          onClick={e=>{e.stopPropagation();installComponent(comp.id)}}
                          style={{flex:1,fontSize:9,padding:'6px',minHeight:32,
                            borderColor:locked?'#64748b':comp.color,
                            color:locked?'#64748b':comp.color}}>
                          {locked?'🔒 Locked':isCable?'🔌 Connect':isScrewable?'📦 Place':'⬇ Install'}
                        </button>
                      )}
                      {isPlaced && !comp.installed && (
                        <button className="cyber-btn"
                          onClick={e=>{e.stopPropagation();addScrew(comp.id)}}
                          style={{flex:1,fontSize:9,padding:'6px',minHeight:32,
                            borderColor:'#f59e0b',color:'#f59e0b'}}>
                          🔩 Tighten ({screws}/{SCREWS_REQUIRED})
                        </button>
                      )}
                      {comp.installed && (
                        <button className="cyber-btn"
                          onClick={e=>{e.stopPropagation();uninstallComponent(comp.id)}}
                          style={{flex:1,fontSize:9,padding:'6px',minHeight:32,
                            borderColor:'#ef4444',color:'#ef4444'}}>
                          {isCable?'⬆ Disconnect':'⬆ Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Reset */}
        <button className="cyber-btn" onClick={useLabStore.getState().resetAll}
          style={{width:'100%',fontSize:9,padding:'8px',marginTop:4,
            borderColor:'#ef4444',color:'#ef4444'}}>
          ↺ Reset All Progress
        </button>
      </>}
    </div>
  )
}

const OSI_INFO = {
  7:'Application: Generating HTTP GET Request',
  6:'Presentation: Formatting data (ASCII/UTF-8), Encrypting (TLS)',
  5:'Session: Establishing connection state to Web Server',
  4:'Transport: Adding TCP Header — Source Port: 443',
  3:'Network: Adding IP Header — Dest: 8.8.8.8',
  2:'Data Link: Adding Ethernet Frame — Source MAC: [PC_MAC]',
  1:'Physical: Converting to 1s and 0s for cable transmission',
}

/* ─── MOBILE NETWORK PANEL ─── */
function MobileNetworkPanel() {
  const { packetState, currentOsiLayer, startPacketAnimation, packetData, powerOnState } = useLabStore()
  const ready = powerOnState === 'success'

  return (
    <div>
      {/* Status banner */}
      <div style={{
        padding:'10px 12px',borderRadius:8,marginBottom:12,
        background: ready ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
        border:`1px solid ${ready ? '#10b981' : '#ef4444'}40`,
        display:'flex',alignItems:'center',gap:8
      }}>
        <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,
          background: ready ? '#10b981' : '#ef4444',
          boxShadow:`0 0 8px ${ready ? '#10b981' : '#ef4444'}`}}/>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
          color: ready ? '#10b981' : '#ef4444'}}>
          {ready ? 'Hardware online — ready to transmit' : 'Complete Hardware POST first to enable networking'}
        </span>
      </div>

      {/* Send button */}
      <button className="cyber-btn" onClick={startPacketAnimation}
        disabled={packetState === 'animating' || !ready}
        style={{
          width:'100%',padding:'12px',fontSize:12,minHeight:44,marginBottom:14,
          borderColor: packetState==='animating' ? '#64748b' : '#00ffc8',
          color: packetState==='animating' ? '#64748b' : '#00ffc8',
          background: packetState==='animating' ? 'rgba(100,116,139,0.05)' : 'rgba(0,255,200,0.05)',
        }}>
        {packetState==='animating' ? '📡 TRANSMITTING...' : '🚀 SEND DATA PACKET'}
      </button>

      {/* Live OSI Telemetry */}
      <div style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.05)',
        borderRadius:8,padding:12,marginBottom:12}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:'#64748b',
          letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>
          Live Telemetry
        </div>

        {!packetState && (
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#4a5568',fontStyle:'italic'}}>
            Awaiting transmission...
          </div>
        )}
        {packetState==='animating' && currentOsiLayer > 0 && (
          <div style={{animation:'fadeInUp 0.3s ease'}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#e2e8f0',marginBottom:4}}>
              Layer {currentOsiLayer} Encapsulation
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#00ffc8',
              background:'rgba(0,255,200,0.1)',padding:'6px 8px',borderRadius:4,
              borderLeft:'2px solid #00ffc8',lineHeight:1.5}}>
              {OSI_INFO[currentOsiLayer]}
            </div>
          </div>
        )}
        {packetState==='animating' && currentOsiLayer===0 && (
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'#f59e0b'}}>
            → Packet traversing physical medium...
          </div>
        )}
        {packetState==='done' && (
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:'#10b981',fontWeight:700}}>
            ✅ Packet received by Web Server!
          </div>
        )}
      </div>

      {/* OSI Encapsulation Stack */}
      {packetData && (
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:'#64748b',
            letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>
            Encapsulation Stack
          </div>
          <div style={{display:'flex',flexDirection:'column-reverse',gap:3}}>
            {[1,2,3,4,5,6,7].map(l => (
              <div key={l} style={{
                display:'flex',justifyContent:'space-between',alignItems:'center',
                padding:'6px 10px',borderRadius:4,
                background: packetData[`layer${l}`] ? 'rgba(0,170,255,0.15)' : 'rgba(255,255,255,0.02)',
                border:`1px solid ${packetData[`layer${l}`] ? 'rgba(0,170,255,0.3)' : 'transparent'}`,
                transition:'all 0.3s'
              }}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                  color: packetData[`layer${l}`] ? '#00aaff' : '#4a5568'}}>
                  L{l} — {['Physical','Data Link','Network','Transport','Session','Presentation','Application'][l-1]}
                </span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,
                  color: packetData[`layer${l}`] ? '#10b981' : '#4a5568'}}>
                  {packetData[`layer${l}`] ? '✓ ADDED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const CABLE_TYPES = [
  { id:'cat6',  name:'CAT6 Cable',   color:'#00aaff', desc:'10 Gbps · up to 55m', icon:'🔵' },
  { id:'fiber', name:'Fiber SFP+',   color:'#39ff14', desc:'High-speed optical',  icon:'🟢' },
  { id:'cat5e', name:'CAT5e Cable',  color:'#ffff00', desc:'1 Gbps · short runs',  icon:'🟡' },
  { id:'cat6a', name:'CAT6a Cable',  color:'#bd00ff', desc:'10 Gbps · up to 100m', icon:'🟣' },
  { id:'power', name:'Power Cable',  color:'#f43f5e', desc:'AC power to devices',  icon:'🔴' },
]

/* ─── MOBILE INFRA PANEL ─── */
function MobileInfraPanel() {
  const { infraSelectedCable, setInfraSelectedCable, infraCables, removeInfraCable } = useLabStore()

  return (
    <div>
      {/* Instruction */}
      <div style={{background:'rgba(0,170,255,0.06)',border:'1px solid rgba(0,170,255,0.15)',
        borderRadius:8,padding:'8px 12px',marginBottom:12}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:'#00aaff',
          letterSpacing:1,marginBottom:4}}>HOW TO CONNECT</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#64748b',lineHeight:1.6}}>
          1. Select a cable type below<br/>
          2. Tap a source port on the 3D rack<br/>
          3. Tap the destination port to connect
        </div>
      </div>

      {/* Cable type selector */}
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:'#64748b',
        letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>
        Cable Inventory — tap to select
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
        {CABLE_TYPES.map(cable => (
          <button key={cable.id}
            onClick={() => setInfraSelectedCable(infraSelectedCable===cable.id ? null : cable.id)}
            style={{
              padding:'10px 12px',borderRadius:8,cursor:'pointer',textAlign:'left',
              background: infraSelectedCable===cable.id ? `${cable.color}20` : 'rgba(255,255,255,0.03)',
              border:`1px solid ${infraSelectedCable===cable.id ? cable.color : 'rgba(255,255,255,0.08)'}`,
              borderLeft:`4px solid ${cable.color}`,
              transition:'all 0.2s',minHeight:48,
              display:'flex',alignItems:'center',gap:12
            }}>
            <span style={{fontSize:16}}>{cable.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,
                color: infraSelectedCable===cable.id ? cable.color : '#cbd5e1',fontWeight:700}}>
                {cable.name}
              </div>
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:8,color:'#64748b',marginTop:2}}>
                {cable.desc}
              </div>
            </div>
            {infraSelectedCable===cable.id && (
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:7,
                color:cable.color,letterSpacing:1,padding:'2px 6px',
                border:`1px solid ${cable.color}`,borderRadius:3}}>
                SELECTED
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Active Connections */}
      {infraCables.length > 0 && (
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:'#64748b',
            letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>
            Active Connections ({infraCables.length})
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:12}}>
            {infraCables.map(c => {
              const cInfo = CABLE_TYPES.find(t=>t.id===c.type)
              return (
                <div key={c.id} style={{
                  display:'flex',alignItems:'center',gap:8,padding:'8px 10px',
                  background:'rgba(0,0,0,0.4)',
                  border:`1px solid ${c.isFaulty ? '#f97316' : (cInfo?.color||'#fff')}40`,
                  borderRadius:6
                }}>
                  <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,
                    background: c.isFaulty ? '#f97316' : (cInfo?.color||'#fff')}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                      color: c.isFaulty ? '#f97316' : '#cbd5e1',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {c.source.name} ↔ {c.dest.name} {c.isFaulty && '⚠️'}
                    </div>
                    <div style={{fontFamily:"'Inter',sans-serif",fontSize:7,
                      color: cInfo?.color||'#64748b'}}>{(cInfo?.name||c.type).toUpperCase()}</div>
                  </div>
                  <button onClick={() => removeInfraCable(c.id)} style={{
                    background:'none',border:'1px solid rgba(239,68,68,0.3)',
                    color:'#ef4444',borderRadius:4,padding:'2px 8px',
                    cursor:'pointer',fontSize:10,flexShrink:0,minHeight:28
                  }}>✕</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Hardware inventory */}
      <div style={{background:'rgba(232,121,249,0.05)',border:'1px solid rgba(232,121,249,0.15)',
        borderRadius:8,padding:'10px 12px',marginBottom:12}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:'#e879f9',
          letterSpacing:1,marginBottom:8}}>PHYSICAL HARDWARE</div>
        {['Enterprise Edge Router (L3 · ISP Link)','Core Switch (24-port)','Patch Panel (24-port)','2× 1U Rack Servers'].map((item,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
            <span style={{color:'#e879f9',fontSize:8}}>▸</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:9,color:'#cbd5e1'}}>{item}</span>
          </div>
        ))}
      </div>

      {/* Fault inject */}
      <button onClick={useLabStore.getState().triggerRandomFault}
        className="cyber-btn"
        style={{width:'100%',padding:'10px',fontSize:10,minHeight:40,
          borderColor:'#ef4444',color:'#ef4444',
          background:'rgba(239,68,68,0.08)'}}>
        ⚡ Inject Random Hardware Fault
      </button>
    </div>
  )
}

/* ─── MAIN MOBILE LAYOUT ─── */
export default function MobileLayout({ activeTab, powerOnState, packetState, isTerminalOpen }) {
  const setActiveTab = useLabStore(s => s.setActiveTab)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const drawerTitle = {
    hardware: '🔧 Build Panel',
    network: '🌐 Network',
    infra: '🖥️ Infrastructure',
    simulator: '💡 Learn',
  }[activeTab] || 'Panel'

  return (
    <div style={{width:'100%',height:'100%',position:'relative'}}>
      {/* 3D Scene — always full screen */}
      <div style={{position:'absolute',inset:0,zIndex:0}}>
        {activeTab==='hardware' && <LabScene />}
        {activeTab==='network' && <NetworkScene />}
        {activeTab==='infra' && <InfraScene />}
        {activeTab==='simulator' && <ITSandboxSimulator />}
      </div>

      {/* Toast + Modals */}
      <ToastStack />
      <QuizModal />
      <AchievementPopup />

      {/* ─── TOP BAR ─── */}
      <div style={{
        position:'absolute',top:0,left:0,right:0,zIndex:40,
        background:'rgba(3,7,18,0.92)',backdropFilter:'blur(12px)',
        borderBottom:'1px solid rgba(0,255,200,0.15)',
        padding:'8px 12px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
      }}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:16}}>🔧</span>
          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:900,
            background:'linear-gradient(135deg,#00ffc8,#00aaff)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            letterSpacing:2,textTransform:'uppercase'}}>
            IT Sandbox
          </span>
        </div>

        {/* Open drawer button */}
        <button onClick={() => setDrawerOpen(true)} style={{
          background:'rgba(0,255,200,0.1)',border:'1px solid rgba(0,255,200,0.3)',
          borderRadius:8,padding:'6px 12px',color:'#00ffc8',cursor:'pointer',
          fontFamily:"'Orbitron',sans-serif",fontSize:9,letterSpacing:1,
          display:'flex',alignItems:'center',gap:6,minHeight:36
        }}>
          <span>☰</span>
          <span>Panel</span>
        </button>
      </div>

      {/* ─── BOTTOM NAV BAR ─── */}
      <div style={{
        position:'absolute',bottom:0,left:0,right:0,zIndex:40,
        background:'rgba(3,7,18,0.95)',backdropFilter:'blur(12px)',
        borderTop:'1px solid rgba(255,255,255,0.08)',
        display:'flex',
      }}>
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => {
              // Bypass store gate on mobile — warning shown inside the drawer panel
              useLabStore.setState({ activeTab: tab.id })
              setDrawerOpen(false)
            }}
            style={{
              flex:1,padding:'10px 4px',background:'none',border:'none',cursor:'pointer',
              display:'flex',flexDirection:'column',alignItems:'center',gap:2,
              borderTop: activeTab===tab.id ? '2px solid #00ffc8' : '2px solid transparent',
              transition:'all 0.2s',
            }}>
            <span style={{fontSize:18}}>{tab.icon}</span>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:7,letterSpacing:0.5,
              color: activeTab===tab.id ? '#00ffc8' : '#64748b',
              textTransform:'uppercase',transition:'color 0.2s'}}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Success indicator (mobile compact) */}
      {powerOnState==='success' && activeTab==='hardware' && (
        <div style={{
          position:'absolute',top:56,left:'50%',transform:'translateX(-50%)',zIndex:50,
          background:'rgba(16,185,129,0.15)',border:'1px solid #10b981',borderRadius:20,
          padding:'4px 14px',display:'flex',alignItems:'center',gap:6
        }}>
          <div style={{width:6,height:6,borderRadius:'50%',background:'#10b981',
            boxShadow:'0 0 8px #10b981',animation:'pulse-glow 2s ease infinite'}}/>
          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:'#10b981',
            letterSpacing:1,textTransform:'uppercase'}}>System Online</span>
        </div>
      )}

      {/* Admin terminal */}
      {activeTab==='infra' && isTerminalOpen && <AdminTerminal />}

      {/* ─── BOTTOM DRAWER ─── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
      >
        {activeTab === 'hardware' && (
          <MobileHardwarePanel onClose={() => setDrawerOpen(false)} />
        )}
        {activeTab === 'network' && (
          <MobileNetworkPanel />
        )}
        {activeTab === 'infra' && (
          <MobileInfraPanel />
        )}
      </MobileDrawer>
    </div>
  )
}
