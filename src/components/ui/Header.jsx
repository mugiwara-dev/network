import { useLabStore } from '../../store/useLabStore'

export default function Header() {
  const { components, resetAll, getInstallProgress, activeTab, setActiveTab } = useLabStore()
  const progress = getInstallProgress()
  // Show only first 8 in header dots, rest implied
  const shown = components.slice(0,8)

  return <div className="glass-panel header-wrap" style={{
    position:'absolute',top:'16px',left:'16px',right:'16px',
    padding:'8px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',
    zIndex:20,animation:'fadeInUp 0.4s ease both',flexWrap:'wrap',gap:'6px'}}>
    <div className="header-title" style={{display:'flex',alignItems:'center',gap:'10px',minWidth:0}}>
      <div style={{width:32,height:32,borderRadius:6,background:'linear-gradient(135deg,rgba(0,255,200,0.15),rgba(0,170,255,0.15))',border:'1px solid rgba(0,255,200,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px',flexShrink:0}}>🔧</div>
      <div style={{minWidth:0}}>
        <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:'13px',fontWeight:900,letterSpacing:'3px',background:'linear-gradient(135deg,#00ffc8,#00aaff,#7b5ea7)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textTransform:'uppercase',whiteSpace:'nowrap'}}>The IT Sandbox</h1>
        <div className="header-tabs" style={{display:'flex', gap:'10px', marginTop:'2px',flexWrap:'wrap'}}>
          <button 
            onClick={() => setActiveTab('hardware')}
            style={{
              fontFamily:"'JetBrains Mono',monospace",fontSize:'8px',letterSpacing:'1px',
              color: activeTab === 'hardware' ? '#00ffc8' : '#64748b',
              background:'none', border:'none', cursor:'pointer', padding:'2px 0',
              textDecoration: activeTab === 'hardware' ? 'underline' : 'none',
              textUnderlineOffset: '4px',whiteSpace:'nowrap'
            }}>
            [ Hardware ]
          </button>
          <button 
            onClick={() => setActiveTab('network')}
            style={{
              fontFamily:"'JetBrains Mono',monospace",fontSize:'8px',letterSpacing:'1px',
              color: activeTab === 'network' ? '#00aaff' : '#64748b',
              background:'none', border:'none', cursor:'pointer', padding:'2px 0',
              textDecoration: activeTab === 'network' ? 'underline' : 'none',
              textUnderlineOffset: '4px',whiteSpace:'nowrap'
            }}>
            [ Network ]
          </button>
          <button 
            onClick={() => setActiveTab('infra')}
            style={{
              fontFamily:"'JetBrains Mono',monospace",fontSize:'8px',letterSpacing:'1px',
              color: activeTab === 'infra' ? '#e879f9' : '#64748b',
              background:'none', border:'none', cursor:'pointer', padding:'2px 0',
              textDecoration: activeTab === 'infra' ? 'underline' : 'none',
              textUnderlineOffset: '4px',whiteSpace:'nowrap'
            }}>
            [ Infra ]
          </button>
          <button 
            onClick={() => setActiveTab('simulator')}
            style={{
              fontFamily:"'JetBrains Mono',monospace",fontSize:'8px',letterSpacing:'1px',
              color: activeTab === 'simulator' ? '#00d4ff' : '#64748b',
              background:'none', border:'none', cursor:'pointer', padding:'2px 0',
              textDecoration: activeTab === 'simulator' ? 'underline' : 'none',
              textUnderlineOffset: '4px',whiteSpace:'nowrap'
            }}>
            [ Simulator ]
          </button>
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
}
