import LabScene from './components/3d/LabScene'
import Header from './components/ui/Header'
import Sidebar from './components/ui/Sidebar'
import ToastStack from './components/ui/ToastStack'
import AssemblyLog from './components/ui/AssemblyLog'
import HelpPanel from './components/ui/HelpPanel'
import NetworkScene from './components/3d/NetworkScene'
import PacketInspector from './components/ui/PacketInspector'
import InfraScene from './components/3d/InfraScene'
import InfraSidebar from './components/ui/InfraSidebar'
import AdminTerminal from './components/ui/AdminTerminal'
import ITSandboxSimulator from './components/ui/ITSandboxSimulator'
import { QuizModal, AchievementPopup, XPBar } from './components/ui/GamificationUI'
import MobileLayout from './components/ui/MobileLayout'
import { useLabStore } from './store/useLabStore'
import { useIsMobile } from './hooks/useIsMobile'

export default function App() {
  const powerOnState = useLabStore(s => s.powerOnState)
  const activeTab = useLabStore(s => s.activeTab)
  const packetState = useLabStore(s => s.packetState)
  const isTerminalOpen = useLabStore(s => s.isTerminalOpen)
  const isMobile = useIsMobile()

  return (
    <div style={{
      width: '100vw', height: '100vh',
      position: 'relative', overflow: 'hidden',
      background: '#030712',
    }}>
      {/* Scanline overlay — skip on mobile for performance */}
      {!isMobile && <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)',
        pointerEvents: 'none', zIndex: 30,
      }} />}

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.4) 100%)',
        pointerEvents: 'none', zIndex: 30,
      }} />

      {/* ─────── MOBILE LAYOUT ─────── */}
      {isMobile ? (
        <MobileLayout
          activeTab={activeTab}
          powerOnState={powerOnState}
          packetState={packetState}
          isTerminalOpen={isTerminalOpen}
        />
      ) : (
        /* ─────── DESKTOP LAYOUT ─────── */
        <>
          <Header />
          <ToastStack />
          <QuizModal />
          <AchievementPopup />
          <XPBar />

          {activeTab === 'hardware' && (
            <>
              <LabScene />
              <Sidebar />
              <AssemblyLog />
              <HelpPanel />
            </>
          )}

          {activeTab === 'network' && <NetworkScene />}
          {(activeTab === 'network' || packetState) && <PacketInspector />}

          {activeTab === 'infra' && (
            <>
              <InfraScene />
              {!packetState && <InfraSidebar />}
              {isTerminalOpen && <AdminTerminal />}
            </>
          )}

          {activeTab === 'simulator' && <ITSandboxSimulator />}

          {/* Success Popup */}
          {powerOnState === 'success' && activeTab === 'hardware' && (
            <div className="glass-panel success-popup" style={{
              position:'absolute',top:'80px',left:'50%',transform:'translateX(-50%)',
              padding:'12px 28px',zIndex:50,animation:'fadeInDown 0.5s ease both',
              border:'2px solid #10b981',background:'rgba(16,185,129,0.1)',
              boxShadow:'0 0 20px rgba(16,185,129,0.4)',textAlign:'center',
              whiteSpace:'nowrap'
            }}>
              <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:'bold',
                color:'#10b981',textTransform:'uppercase',letterSpacing:2}}>
                🟢 System is now working
              </div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                color:'#a7f3d0',marginTop:4}}>
                All components successfully powered on
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
