import { useLabStore, DEPENDENCIES, SCREWABLE, SCREWS_REQUIRED, TUTORIAL_STEPS } from '../../store/useLabStore'
import { useState } from 'react'
import { AchievementsList } from './GamificationUI'

const catLabels = { hardware:'⚙️ Hardware', cooling:'❄️ Cooling', storage:'💾 Storage', power:'⚡ Power', cable:'🔌 Cables' }
const catOrder = ['hardware','cooling','storage','power','cable']

export default function Sidebar() {
  const { components,ramSlotUnlocked,toggleRamSlot,installComponent,uninstallComponent,
    selectedComponent,setSelected,isComponentLocked,getInstallProgress,attemptPowerOn,powerOnState,
    screwProgress,addScrew,placedComponents,xp,level,achievements,quizCorrect,quizTotal } = useLabStore()
  const progress = getInstallProgress()
  const pct = Math.round((progress.done/progress.total)*100)
  const [tab, setTab] = useState('build') // 'build' | 'achievements'

  // Determine current tutorial step
  const currentStep = TUTORIAL_STEPS.find(step => {
    const comp = components.find(c => c.id === step.component)
    return comp && !comp.installed
  }) || null

  return <div className="glass-panel sidebar-panel" style={{
    position:'absolute',top:'80px',right:'16px',width:'290px',
    maxHeight:'calc(100vh - 100px)',overflowY:'auto',padding:'16px',zIndex:20,
    animation:'fadeInUp 0.6s ease both'}}>
    <div className="corner-decoration corner-tl"/><div className="corner-decoration corner-tr"/>
    <div className="corner-decoration corner-bl"/><div className="corner-decoration corner-br"/>

    {/* XP Header */}
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <div style={{width:5,height:5,borderRadius:'50%',background:'#00ffc8',boxShadow:'0 0 8px rgba(0,255,200,0.8)'}}/>
        <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:'11px',fontWeight:700,letterSpacing:'2px',color:'#00ffc8',textTransform:'uppercase'}}>Service IT Assembly</h2>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <div style={{background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.4)',borderRadius:4,padding:'2px 6px',display:'flex',alignItems:'center',gap:4}}>
          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:8,color:'#f59e0b',fontWeight:700}}>Lv.{level}</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7,color:'#64748b'}}>{xp}xp</span>
        </div>
      </div>
    </div>
    <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'8px',color:'#64748b',marginBottom:'10px'}}>TESDA NC II · Micro-ATX H410M Build</p>

    {/* Tab switcher */}
    <div style={{display:'flex',gap:4,marginBottom:'12px'}}>
      {[['build','⚙️ Build'],['achievements','🏅 Awards']].map(([id,label])=>(
        <button key={id} onClick={()=>setTab(id)} style={{
          flex:1,padding:'5px 0',fontFamily:"'Orbitron',sans-serif",fontSize:8,
          letterSpacing:1,textTransform:'uppercase',cursor:'pointer',borderRadius:4,
          background: tab===id ? 'rgba(0,255,200,0.12)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${tab===id ? 'rgba(0,255,200,0.4)' : 'rgba(255,255,255,0.08)'}`,
          color: tab===id ? '#00ffc8' : '#64748b',transition:'all 0.2s'
        }}>{label}</button>
      ))}
    </div>

    {/* Tutorial / Current Step Guide */}
    {currentStep && (
      <div style={{
        background:'rgba(0,170,255,0.06)',border:'1px solid rgba(0,170,255,0.2)',
        borderRadius:8,padding:'8px 10px',marginBottom:'12px',
        animation:'fadeInUp 0.3s ease'
      }}>
        <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'4px'}}>
          <span style={{fontSize:'10px'}}>📋</span>
          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',fontWeight:600,letterSpacing:'1px',color:'#00aaff',textTransform:'uppercase'}}>
            Step {currentStep.id}: {currentStep.title}
          </span>
        </div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:'8px',color:'#94a3b8',lineHeight:'1.5'}}>
          {currentStep.desc}
        </div>
        {SCREWABLE.includes(currentStep.component) && (
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'7px',color:'#f59e0b',marginTop:'4px'}}>
            🪛 This component requires 4 manual screw clicks to secure
          </div>
        )}
      </div>
    )}

    {/* ACHIEVEMENTS TAB */}
    {tab === 'achievements' && (
      <div>
        <div style={{marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'#64748b'}}>Quiz Score</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'#00ffc8'}}>{quizCorrect}/{quizTotal} correct</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'#64748b'}}>Achievements</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'#f59e0b'}}>{achievements.length}/10 unlocked</span>
          </div>
        </div>
        <AchievementsList />
      </div>
    )}

    {/* BUILD TAB */}
    {tab === 'build' && <>
    <div style={{marginBottom:'12px'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'8px',color:'#64748b',letterSpacing:'1px',textTransform:'uppercase'}}>Assembly Progress</span>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'9px',color:'#00ffc8'}}>{progress.done}/{progress.total}</span>
      </div>
      <div style={{height:3,background:'rgba(0,255,200,0.1)',borderRadius:2,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#00ffc8,#00aaff)',borderRadius:2,transition:'width 0.5s ease',boxShadow:'0 0 10px rgba(0,255,200,0.5)'}}/>
      </div>
    </div>

    {/* RAM toggle */}
    <div style={{background:ramSlotUnlocked?'rgba(0,255,200,0.06)':'rgba(245,158,11,0.06)',border:`1px solid ${ramSlotUnlocked?'rgba(0,255,200,0.2)':'rgba(245,158,11,0.2)'}`,borderRadius:6,padding:'6px 8px',marginBottom:'10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',letterSpacing:'1px',color:ramSlotUnlocked?'#00ffc8':'#f59e0b',textTransform:'uppercase'}}>{ramSlotUnlocked?'🔓 RAM Slot Open':'🔒 RAM Slot Locked'}</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'7px',color:'#64748b'}}>Toggle retention clips</div>
      </div>
      <button className="cyber-btn" onClick={toggleRamSlot} style={{fontSize:'8px',padding:'3px 8px'}}>{ramSlotUnlocked?'Lock':'Unlock'}</button>
    </div>

    {/* POWER ON button */}
    <button className="cyber-btn" onClick={attemptPowerOn} style={{
      width:'100%',marginBottom:'12px',padding:'8px',fontSize:'10px',
      borderColor:powerOnState==='success'?'#10b981':'#ff6b9d',
      color:powerOnState==='success'?'#10b981':'#ff6b9d',
      background:powerOnState==='success'?'rgba(16,185,129,0.08)':'rgba(255,107,157,0.05)',
    }}>
      {powerOnState==='success'?'🟢 System Running':'⏻ Power On (POST Test)'}
    </button>

    {/* Component cards */}
    {catOrder.map(cat=>{
      const cc=components.filter(c=>c.category===cat)
      if(!cc.length) return null
      return <div key={cat} style={{marginBottom:'10px'}}>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'8px',letterSpacing:'1.5px',color:'#64748b',textTransform:'uppercase',marginBottom:'5px',paddingBottom:'3px',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>{catLabels[cat]}</div>
        <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
          {cc.map((comp,i)=>{
            const locked=isComponentLocked(comp.id)
            const deps=DEPENDENCIES[comp.id]||[]
            const missing=deps.filter(d=>!components.find(c=>c.id===d)?.installed)
            const needsRam=comp.id==='ram'&&!ramSlotUnlocked
            const isCable=comp.category==='cable'
            const isScrewable = SCREWABLE.includes(comp.id)
            const screws = screwProgress[comp.id] || 0
            const isPlaced = placedComponents[comp.id] === true  // placed but not yet screwed

            let bc='badge-ready',bt='READY'
            if(comp.installed){bc='badge-installed';bt=isCable?'CONNECTED':'INSTALLED'}
            else if(isPlaced){bc='badge-ready';bt=`🔩 ${screws}/${SCREWS_REQUIRED}`}
            else if(locked){bc='badge-locked';bt='LOCKED'}

            return <div key={comp.id} onClick={()=>setSelected(comp.id)}
              className={`inventory-card ${comp.installed?'installed':''} ${locked&&!comp.installed?'locked':''}`}
              style={{animationDelay:`${i*0.06}s`,padding:'8px 10px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:22,height:22,borderRadius:4,background:`linear-gradient(135deg,${comp.color}30,${comp.color}10)`,border:`1px solid ${comp.color}40`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <div style={{width:6,height:6,borderRadius:2,background:comp.color,boxShadow:`0 0 6px ${comp.color}80`}}/>
                  </div>
                  <div>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'9px',fontWeight:700,color:comp.color,letterSpacing:'1px'}}>{comp.name}</div>
                    <div style={{fontFamily:"'Inter',sans-serif",fontSize:'7px',color:'#94a3b8'}}>{comp.fullName}</div>
                  </div>
                </div>
                <span className={`status-badge ${bc}`} style={{fontSize:'7px',padding:'1px 5px'}}>{bt}</span>
              </div>

              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'7px',color:'#64748b',marginBottom:5}}>{comp.detail}</div>

              {locked&&!comp.installed&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'7px',color:'#f59e0b',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.15)',borderRadius:3,padding:'2px 5px',marginBottom:5}}>
                {needsRam?'⚠ Unlock RAM slot first':missing.length>0?`⚠ Need: ${missing.map(d=>d.replace(/_/g,' ').toUpperCase()).join(', ')}`:''}
              </div>}

              {/* Screw progress bar - shows when component is placed */}
              {isScrewable && isPlaced && !comp.installed && (
                <div style={{marginBottom:5}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'7px',color:'#f59e0b'}}>🔩 Screws: {screws}/{SCREWS_REQUIRED}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'7px',color:'#64748b'}}>Click screw holes on model</span>
                  </div>
                  <div style={{height:3,background:'rgba(245,158,11,0.15)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${(screws/SCREWS_REQUIRED)*100}%`,background:'linear-gradient(90deg,#f59e0b,#00ffc8)',borderRadius:2,transition:'width 0.3s ease'}}/>
                  </div>
                </div>
              )}

              <div style={{display:'flex',gap:4}}>
                {/* Place button - only when not placed and not installed */}
                {!comp.installed && !isPlaced && <button className="cyber-btn" disabled={locked}
                  onClick={e=>{e.stopPropagation();installComponent(comp.id)}}
                  style={{flex:1,fontSize:'7px',padding:'3px 5px',borderColor:locked?'#64748b':comp.color,color:locked?'#64748b':comp.color}}>
                  {locked?'🔒 Locked':isCable?'🔌 Connect':isScrewable?'📦 Place':'⬇ Install'}</button>}

                {/* Screw button - shows when placed but not yet secured */}
                {isPlaced && !comp.installed && <button className="cyber-btn"
                  onClick={e=>{e.stopPropagation();addScrew(comp.id)}}
                  style={{flex:1,fontSize:'7px',padding:'3px 5px',borderColor:'#f59e0b',color:'#f59e0b',
                    cursor:'crosshair', animation: screws === 0 ? 'pulse-warn 1s ease infinite alternate' : 'none'}}>
                  🔩 Tighten Screw ({screws}/{SCREWS_REQUIRED})</button>}

                {comp.installed&&<button className="cyber-btn"
                  onClick={e=>{e.stopPropagation();uninstallComponent(comp.id)}}
                  style={{flex:1,fontSize:'7px',padding:'3px 5px',borderColor:'#ef4444',color:'#ef4444'}}>
                  {isCable?'⬆ Disconnect':'⬆ Remove'}</button>}
              </div>

              {selectedComponent===comp.id&&<div style={{marginTop:6,paddingTop:6,borderTop:'1px solid rgba(255,255,255,0.06)',animation:'fadeInUp 0.3s ease'}}>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:'8px',color:'#94a3b8',lineHeight:'1.4',marginBottom:5}}>{comp.description}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:2}}>
                  {comp.specs.map((s,si)=><div key={si} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'7px',color:'#64748b',background:'rgba(255,255,255,0.03)',borderRadius:2,padding:'2px 4px'}}>{s}</div>)}
                </div>
              </div>}
            </div>
          })}
        </div>
      </div>
    })}
    </>}
  </div>
}
