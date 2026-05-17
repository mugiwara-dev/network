import { useLabStore } from '../../store/useLabStore'
import { useState, useEffect } from 'react'

const FACTS = [
  '💡 Fun Fact: The LGA1200 socket has 1200 pins — each carries power or data signals to the CPU.',
  '🧠 Did you know? The i3-10100 uses the same socket as the i9-10900K — great for future upgrades!',
  '⚡ RAM tip: Always install in matching pairs (dual-channel) for up to 20% more memory bandwidth.',
  '🔌 Cable tip: The 24-pin ATX connector is keyed — it only fits one way, preventing damage.',
  '🌡️ Safety: Never power on a CPU without a cooler — it can overheat in under 5 seconds!',
  '💾 SSD vs HDD: An SSD is ~10x faster for loading apps but HDD gives more storage per peso.',
  '🔩 Build tip: Tighten case screws in a star/cross pattern to distribute pressure evenly.',
  '⚙️ BIOS tip: Always check RAM is running at its rated speed (XMP/DOCP) in BIOS settings.',
  '🔋 CMOS: If your PC loses time/date after shutdown, the CR2032 CMOS battery may be dead.',
  '📡 SATA III maxes at 6 Gb/s — perfect for SSDs but faster NVMe drives use PCIe lanes directly.',
  '🏗️ Form factor: Micro-ATX boards have 4 RAM slots max; Mini-ITX have only 2.',
  '🔐 Static safety: Touch a metal surface before handling components to discharge static electricity.',
]

export default function Header() {
  const { components, resetAll, getInstallProgress, activeTab, setActiveTab } = useLabStore()
  const progress = getInstallProgress()
  const shown = components.slice(0,8)

  const [factIdx, setFactIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFactIdx(i => (i + 1) % FACTS.length), 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{position:'absolute',top:'16px',left:'16px',right:'16px',zIndex:20}}>
      <div className="glass-panel header-wrap" style={{
        padding:'8px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',
        animation:'fadeInUp 0.4s ease both',flexWrap:'wrap',gap:'6px',
        borderBottom:'none',borderRadius:'12px 12px 0 0'
      }}>
        <div className="header-title" style={{display:'flex',alignItems:'center',gap:'10px',minWidth:0}}>
          <div style={{width:32,height:32,borderRadius:6,background:'linear-gradient(135deg,rgba(0,255,200,0.15),rgba(0,170,255,0.15))',border:'1px solid rgba(0,255,200,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px',flexShrink:0}}>🔧</div>
          <div style={{minWidth:0}}>
            <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:'13px',fontWeight:900,letterSpacing:'3px',background:'linear-gradient(135deg,#00ffc8,#00aaff,#7b5ea7)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textTransform:'uppercase',whiteSpace:'nowrap'}}>The IT Sandbox</h1>
            <div className="header-tabs" style={{display:'flex', gap:'10px', marginTop:'2px',flexWrap:'wrap'}}>
              {[
                ['hardware','[ Hardware ]','#00ffc8'],
                ['network','[ Network ]','#00aaff'],
                ['infra','[ Infra ]','#e879f9'],
                ['simulator','[ Simulator ]','#00d4ff'],
              ].map(([id,label,color]) => (
                <button key={id} onClick={() => setActiveTab(id)} style={{
                  fontFamily:"'JetBrains Mono',monospace",fontSize:'8px',letterSpacing:'1px',
                  color: activeTab===id ? color : '#64748b',
                  background:'none',border:'none',cursor:'pointer',padding:'2px 0',
                  textDecoration: activeTab===id ? 'underline' : 'none',
                  textUnderlineOffset:'4px',whiteSpace:'nowrap',
                  transition:'color 0.2s'
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="header-dots" style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap',justifyContent:'center',flex:'1 1 auto',minWidth:0}}>
          {shown.map((comp,i)=><div key={comp.id} style={{display:'flex',alignItems:'center',gap:'3px'}}>
            <div className={`step-dot ${comp.installed?'active':''}`} style={comp.installed?{borderColor:comp.color,background:comp.color,boxShadow:`0 0 6px ${comp.color}`,width:8,height:8}:{width:8,height:8}}/>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',letterSpacing:'0.5px',color:comp.installed?comp.color:'#4a5568',transition:'all 0.4s',whiteSpace:'nowrap'}}>{comp.name}</span>
            {i<shown.length-1&&<div style={{width:10,height:1,background:comp.installed?`${comp.color}40`:'rgba(100,116,139,0.2)'}}/>}
          </div>)}
          {components.length>8&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'8px',color:'#64748b'}}>+{components.length-8}</span>}
        </div>

        <div className="header-progress" style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'9px',color:progress.done===progress.total?'#10b981':'#00ffc8'}}>{progress.done}/{progress.total}</span>
          {progress.done===progress.total&&<div style={{fontFamily:"'Orbitron',sans-serif",fontSize:'7px',color:'#10b981',textTransform:'uppercase',animation:'fadeInUp 0.5s ease'}}>✅ Complete</div>}
          <button className="cyber-btn" onClick={resetAll} style={{fontSize:'7px',padding:'4px 8px'}}>↺ Reset</button>
        </div>
      </div>

      {/* Fact Ticker Bar */}
      <div style={{
        background:'rgba(0,0,0,0.6)',backdropFilter:'blur(10px)',
        borderLeft:'1px solid rgba(0,255,200,0.15)',
        borderRight:'1px solid rgba(0,255,200,0.15)',
        borderBottom:'1px solid rgba(0,255,200,0.15)',
        borderRadius:'0 0 12px 12px',
        padding:'4px 16px',overflow:'hidden',
        display:'flex',alignItems:'center',gap:8
      }}>
        <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:7,color:'#00ffc8',
          letterSpacing:1,flexShrink:0,textTransform:'uppercase'}}>TIP</span>
        <div style={{overflow:'hidden',flex:1}}>
          <div key={factIdx} style={{
            fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:'#64748b',
            whiteSpace:'nowrap',animation:'fadeInUp 0.4s ease',
          }}>
            {FACTS[factIdx]}
          </div>
        </div>
      </div>
    </div>
  )
}
