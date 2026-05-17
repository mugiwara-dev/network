import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import Workbench from './Workbench'
import Chassis from './Chassis'
import Motherboard from './Motherboard'
import { CPUModel,RAMModel,PSUModel,CMOSModel,
  CPUCoolerModel,CaseFanModel,HDDModel,SSDModel } from './ComponentModels'
import CableSystem from './CableSystem'
import GhostSlots from './GhostSlots'
import FloatingLabel from './FloatingLabel'
import ParticleField from './ParticleField'
import { useLabStore, C, TUTORIAL_STEPS } from '../../store/useLabStore'
import { useIsMobile } from '../../hooks/useIsMobile'

// Inventory floating positions (left side)
const INV = {
  [C.CPU]:[-5,1.5,-2],[C.RAM]:[-5,1.5,-1],
  [C.CMOS]:[-5,1.5,1],[C.CPU_COOLER]:[-5,0.3,-2],[C.FAN_FRONT]:[-5,0.3,-1],
  [C.FAN_REAR]:[-5,0.3,0],[C.HDD]:[-5,0.3,1],[C.SSD]:[-5,0.3,2],
  [C.PSU]:[-5,-0.8,-1],
}

// Label positions when installed
const LBL = {
  [C.CPU]:[-0.6,1.0,-0.7],[C.RAM]:[1.0,1.5,-0.5],
  [C.PSU]:[1.5,-0.5,-1.5],[C.CMOS]:[1.7,0.5,1.0],
  [C.CPU_COOLER]:[-0.6,1.2,-0.7],[C.FAN_FRONT]:[-1.8,1.3,2.0],
  [C.FAN_REAR]:[0,1.2,-2.3],[C.HDD]:[-1.8,0.9,1.5],[C.SSD]:[-1.8,0.5,1.5],
}

const MODELS = {
  [C.CPU]:CPUModel, [C.RAM]:RAMModel, [C.PSU]:PSUModel,
  [C.CMOS]:CMOSModel, [C.CPU_COOLER]:CPUCoolerModel,
  [C.HDD]:HDDModel, [C.SSD]:SSDModel,
}

function SceneContent({ isMobile }) {
  const store = useLabStore()
  const { components,ramSlotUnlocked,hoveredComponent,cableAnimations,powerOnState,
    toggleRamSlot,installComponent,setHovered,setSelected,isComponentLocked,selectedComponent,
    placedComponents,screwProgress,addScrew } = store

  const get = id => components.find(c=>c.id===id)
  const installedIds = components.filter(c=>c.installed).map(c=>c.id)

  const nextStep = TUTORIAL_STEPS.find(step => {
    const comp = components.find(c => c.id === step.component)
    return comp && !comp.installed
  }) || null

  const click = comp => {
    if (selectedComponent !== comp.id) {
      setSelected(comp.id)
    } else if (!comp.installed && !isComponentLocked(comp.id)) {
      installComponent(comp.id)
    }
  }

  const ev = id => ({
    onClick:()=>click(get(id)),
    onPointerOver:()=>!isMobile&&setHovered(id),
    onPointerOut:()=>!isMobile&&setHovered(null),
  })

  return <>
    {/* LIGHTING — reduced on mobile for performance */}
    <ambientLight intensity={isMobile ? 3.0 : 2.0}/>
    <directionalLight position={[5,10,3]} intensity={isMobile ? 4.0 : 3.5}
      castShadow={!isMobile} shadow-mapSize={isMobile ? [512,512] : [2048,2048]}/>
    {!isMobile && <>
      <directionalLight position={[-5,6,-3]} intensity={1.8}/>
      <directionalLight position={[0,8,8]} intensity={1.5}/>
      <pointLight position={[-3,4,-2]} intensity={2.5} color="#00ffc8" distance={20}/>
      <pointLight position={[3,3,2]} intensity={2.0} color="#00aaff" distance={20}/>
      <pointLight position={[0,5,0]} intensity={1.5} color="#7b5ea7" distance={20}/>
      <pointLight position={[1.5,-1,0]} intensity={1.5} color="#f59e0b" distance={12}/>
      <pointLight position={[0,2,4]} intensity={3.0} color="#ffffff" distance={18}/>
      <pointLight position={[-2,0,2]} intensity={1.2} color="#ffffff" distance={12}/>
    </>}
    {isMobile && <>
      {/* Mobile: just 2 fill lights instead of 8 */}
      <pointLight position={[0,4,4]} intensity={2.0} color="#ffffff" distance={20}/>
      <pointLight position={[-2,2,2]} intensity={1.5} color="#00ffc8" distance={16}/>
    </>}
    <hemisphereLight args={isMobile ? ['#6080a0','#0a0f18',1.5] : ['#4a6a8a','#0a0f18',1.2]}/>
    {!isMobile && <fog attach="fog" args={['#050b18',22,45]}/>}

    <Workbench/>
    <Chassis powerOnState={powerOnState}/>
    <Motherboard ramSlotUnlocked={ramSlotUnlocked} onSlotClick={toggleRamSlot}
      installedComponents={installedIds} powerOn={powerOnState === 'success'}/>

    <GhostSlots installedComponents={installedIds} selectedComponent={selectedComponent} nextStep={nextStep}/>

    {Object.entries(MODELS).map(([id,Model])=>{
      const comp = get(id)
      if(!comp) return null
      if(id===C.FAN_FRONT||id===C.FAN_REAR) return null
      const isPlaced = placedComponents[id] === true
      const screws = screwProgress[id] || 0
      return <Model key={id}
        installed={comp.installed}
        powerOn={powerOnState === 'success'}
        position={INV[id]||[-5,1,0]}
        placed={isPlaced}
        screws={screws}
        onScrew={() => addScrew(id)}
        {...ev(id)}/>
    })}

    <CaseFanModel installed={get(C.FAN_FRONT)?.installed} powerOn={powerOnState === 'success'}
      position={INV[C.FAN_FRONT]} color="#38bdf8" slotKey="fan_front" {...ev(C.FAN_FRONT)}/>
    <CaseFanModel installed={get(C.FAN_REAR)?.installed} powerOn={powerOnState === 'success'}
      position={INV[C.FAN_REAR]} color="#818cf8" slotKey="fan_rear" {...ev(C.FAN_REAR)}/>

    <CableSystem installedComponents={installedIds} cableAnimations={cableAnimations}
      selectedComponent={selectedComponent}/>

    {/* Floating labels — desktop only (too cluttered on mobile) */}
    {!isMobile && components.filter(c=>c.category!=='cable').map(comp=>(
      <FloatingLabel key={comp.id} visible={hoveredComponent===comp.id}
        name={comp.name} detail={comp.detail} color={comp.glowColor}
        position={comp.installed ? (LBL[comp.id]||[0,1,0]) : [
          (INV[comp.id]||[-5,1,0])[0],
          (INV[comp.id]||[-5,1,0])[1]+0.7,
          (INV[comp.id]||[-5,1,0])[2],
        ]}/>
    ))}

    {/* Particles — desktop only */}
    {!isMobile && <ParticleField count={200}/>}

    {/* Contact shadows — lighter on mobile */}
    <ContactShadows position={[0,-2.8,0]}
      opacity={isMobile ? 0.2 : 0.3}
      scale={isMobile ? 10 : 18}
      blur={isMobile ? 1 : 2} far={5}/>

    <OrbitControls makeDefault
      minPolarAngle={Math.PI/8} maxPolarAngle={Math.PI/2.1}
      minDistance={isMobile ? 8 : 6}
      maxDistance={isMobile ? 18 : 14}
      enablePan={false} zoomSpeed={0.8} target={[0,-0.3,0]}
      enableDamping dampingFactor={0.08}/>
  </>
}

export default function LabScene() {
  const isMobile = useIsMobile()
  return (
    <div style={{width:'100%',height:'100%',position:'absolute',inset:0}}>
      <Canvas
        shadows={!isMobile}
        camera={{position:[8,5,8],fov:isMobile?55:45,near:0.1,far:100}}
        gl={{
          antialias: !isMobile,
          alpha: false,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        frameloop={isMobile ? 'demand' : 'always'}
        onCreated={({gl})=>gl.setClearColor('#030712')}
      >
        <Suspense fallback={null}>
          <SceneContent isMobile={isMobile}/>
        </Suspense>
      </Canvas>
    </div>
  )
}
