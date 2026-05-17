import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Slot positions when installed (inside chassis)
const SP = {
  cpu:[-0.6,0.15,-0.7], ram:[1.0,0.45,-0.5], gpu:[0,0.45,1.2], psu:[1.5,-1.6,-1.5],
  sound_card:[-0.8,-0.2,1.2], cmos_battery:[1.7,0.1,1.0], cpu_cooler:[-0.6,0.55,-0.7],
  fan_front:[-1.8,0.6,2.0], fan_rear:[0,0.5,-2.3], hdd:[-1.8,0.3,1.5], ssd:[-1.8,-0.1,1.5],
  front_panel:[1.5,0.07,1.6],
}

function useFloat(ref, inst, y, spd, off=0) {
  useFrame((s) => { if(ref.current&&!inst) ref.current.position.y = y+Math.sin(s.clock.elapsedTime*spd+off)*0.04 })
}

function Ev({onClick,onPointerOver,onPointerOut}) {
  return {
    onClick:(e)=>{e.stopPropagation();onClick?.()},
    onPointerOver:(e)=>{e.stopPropagation();onPointerOver?.()},
    onPointerOut:(e)=>{e.stopPropagation();onPointerOut?.()},
  }
}

function GlowRing({color,radius=0.35,y=0.09}) {
  return <mesh position={[0,y,0]} rotation={[-Math.PI/2,0,0]}>
    <ringGeometry args={[radius,radius+0.03,32]}/>
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.4} side={THREE.DoubleSide}/>
  </mesh>
}

/* ─── Screw Hole: HIGHLY VISIBLE clickable indicator when component is placed but not secured ─── */
function ScrewHole({position, onScrew, done=false, index=0}) {
  const beamRef = useRef()
  const ringRef = useRef()
  const pulseRef = useRef()
  const crossRef = useRef()

  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (!done) {
      // Pulsing beam
      if (beamRef.current?.material) {
        beamRef.current.material.opacity = 0.35 + Math.sin(t * 3 + index) * 0.2
      }
      // Rotating outer ring
      if (ringRef.current) {
        ringRef.current.rotation.z = t * 2 + index * 1.5
      }
      // Pulsing glow sphere
      if (pulseRef.current) {
        const scale = 1.0 + Math.sin(t * 4 + index * 0.8) * 0.35
        pulseRef.current.scale.setScalar(scale)
        if (pulseRef.current.material) {
          pulseRef.current.material.emissiveIntensity = 1.0 + Math.sin(t * 5 + index) * 0.5
        }
      }
      // Rotating crosshair
      if (crossRef.current) {
        crossRef.current.rotation.y = t * 1.5
      }
    }
  })

  // ═══ DONE STATE: beautiful metallic secured screw ═══
  if (done) return (
    <group position={position}>
      {/* Screw head — metallic silver */}
      <mesh>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
        <meshStandardMaterial color="#b8c0cc" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Phillips head cross on top */}
      <mesh position={[0, 0.022, 0]}>
        <boxGeometry args={[0.08, 0.005, 0.015]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.022, 0]}>
        <boxGeometry args={[0.015, 0.005, 0.08]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Green "secured" glow ring */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.08, 0.13, 20]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8}
          transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Tiny green checkmark glow */}
      <pointLight position={[0, 0.1, 0]} color="#10b981" intensity={0.3} distance={0.5} />
    </group>
  )

  // ═══ UNSCREWED STATE: highly visible animated indicator ═══
  return (
    <group position={position}
      onClick={(e) => { e.stopPropagation(); onScrew?.() }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'crosshair' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      {/* ▌ VERTICAL BEACON BEAM — tall glowing pillar visible from any angle ▌ */}
      <mesh ref={beamRef} position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.015, 0.005, 0.6, 8]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.5}
          transparent opacity={0.45} depthWrite={false} />
      </mesh>

      {/* ▌ TOP DIAMOND — beacon tip ▌ */}
      <mesh position={[0, 0.65, 0]} rotation={[0, 0, Math.PI/4]}>
        <octahedronGeometry args={[0.04, 0]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2}
          transparent opacity={0.8} />
      </mesh>

      {/* ▌ LARGE PULSING GLOW SPHERE — the main visual ▌ */}
      <mesh ref={pulseRef} position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.2}
          transparent opacity={0.5} depthWrite={false} />
      </mesh>

      {/* ▌ OUTER ROTATING RING — targeting indicator ▌ */}
      <group ref={ringRef} position={[0, 0.04, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.14, 0.18, 4]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.5}
            transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>

      {/* ▌ INNER RING — screw hole outline ▌ */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.06, 0.1, 20]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.0}
          transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* ▌ SCREW HOLE — dark center ▌ */}
      <mesh>
        <cylinderGeometry args={[0.055, 0.055, 0.03, 16]} />
        <meshStandardMaterial color="#1a1208" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ▌ ROTATING CROSSHAIR — Phillips head indicator ▌ */}
      <group ref={crossRef} position={[0, 0.018, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 0.008, 0.018]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.0}
            metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.018, 0.008, 0.1]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.0}
            metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* ▌ POINT LIGHT — illuminates surrounding area ▌ */}
      <pointLight position={[0, 0.2, 0]} color="#f59e0b" intensity={0.8} distance={1.5} />

      {/* ▌ LARGE INVISIBLE HIT AREA — easy to click ▌ */}
      <mesh>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* ═══ CPU ═══ */
export function CPUModel({installed,powerOn,position,...p}) {
  const r=useRef(),g=useRef(); useFloat(r,installed,position[1],1.5)
  useFrame(s=>{if(g.current?.material) {
    g.current.material.emissiveIntensity = powerOn ? 0.6 + Math.sin(s.clock.elapsedTime*8)*0.4 : (installed ? 0.1 : 0.4+Math.sin(s.clock.elapsedTime*3)*0.2)
  }})
  return <group ref={r} position={installed?SP.cpu:position} {...Ev(p)}>
    {/* Base Substrate */}
    <mesh castShadow><boxGeometry args={[0.75,0.06,0.75]}/><meshStandardMaterial color="#1a3a2a" metalness={0.4} roughness={0.6}/></mesh>
    {/* Heatspreader (IHS) */}
    <mesh position={[0,0.055,0]} castShadow><boxGeometry args={[0.6,0.04,0.6]}/><meshStandardMaterial color="#a0a8b4" metalness={0.95} roughness={0.05}/></mesh>
    <mesh position={[0,0.075,0]} castShadow><boxGeometry args={[0.5,0.01,0.5]}/><meshStandardMaterial color="#c0c8d4" metalness={0.9} roughness={0.2}/></mesh>
    {/* Core Glow indicator */}
    <mesh ref={g} position={[0,0.082,0]}><boxGeometry args={[0.22,0.003,0.22]}/><meshStandardMaterial color="#7b5ea7" emissive="#7b5ea7" emissiveIntensity={0.5} transparent opacity={0.85}/></mesh>
    {/* Pins array at the bottom */}
    <mesh position={[0,-0.035,0]}><boxGeometry args={[0.65,0.004,0.65]}/><meshStandardMaterial color="#c0a050" metalness={0.9} roughness={0.1}/></mesh>
    {/* Small SMDs on top of substrate */}
    {[-0.32, 0.32].map((x,i)=><mesh key={`smdx${i}`} position={[x,0.035,0]}><boxGeometry args={[0.04,0.01,0.4]}/><meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2}/></mesh>)}
    {installed&&!powerOn&&<GlowRing color="#7b5ea7" opacity={0.1}/>}
    {powerOn&&<GlowRing color="#d8b4fe" radius={0.45} y={0.1} opacity={0.6}/>}
  </group>
}

/* ═══ RAM ═══ */
export function RAMModel({installed,powerOn,position,...p}) {
  const r=useRef(),l=useRef(); useFloat(r,installed,position[1],1.8,1)
  useFrame(s=>{if(l.current?.material&&installed){
    if (powerOn) {
      const h=(s.clock.elapsedTime*0.8)%1;
      l.current.material.color.setHSL(h,1,0.5);
      l.current.material.emissive.setHSL(h,1,0.5);
      l.current.material.emissiveIntensity=1.2;
    } else {
      l.current.material.color.setHex(0x00aaff);
      l.current.material.emissive.setHex(0x00aaff);
      l.current.material.emissiveIntensity=0.1;
    }
  }})
  return <group ref={r} position={installed?SP.ram:position} {...Ev(p)}>
    <mesh castShadow><boxGeometry args={[0.08,0.7,1.6]}/><meshStandardMaterial color="#0c3528" metalness={0.3} roughness={0.7}/></mesh>
    {/* Ribbed Heatsink design */}
    {[0.045,-0.045].map((x,i)=><mesh key={i} position={[x,0.05,0]} castShadow><boxGeometry args={[0.012,0.65,1.55]}/><meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2}/></mesh>)}
    {/* Additional Heatsink Fins */}
    {Array.from({length:12},(_,i)=><mesh key={`fin${i}`} position={[0,0.05,-0.65+i*0.118]}><boxGeometry args={[0.11,0.62,0.02]}/><meshStandardMaterial color="#2a2a3e" metalness={0.9} roughness={0.3}/></mesh>)}
    {/* ICs under heatsink */}
    {Array.from({length:6},(_,i)=><mesh key={`ic${i}`} position={[0,0.05,-0.5+i*0.2]}><boxGeometry args={[0.085,0.1,0.14]}/><meshStandardMaterial color="#0a0a14" metalness={0.7} roughness={0.4}/></mesh>)}
    <mesh position={[0,-0.34,0]}><boxGeometry args={[0.04,0.035,1.5]}/><meshStandardMaterial color="#c0a050" metalness={0.95} roughness={0.05} emissive={installed?'#00ffc8':'#000'} emissiveIntensity={installed&&powerOn?0.5:0}/></mesh>
    <mesh ref={l} position={[0,0.38,0]}><boxGeometry args={[0.085,0.025,1.5]}/><meshStandardMaterial color="#00ffc8" emissive="#00ffc8" emissiveIntensity={installed?0.8:0.15} transparent opacity={0.8}/></mesh>
  </group>
}

/* ═══ GPU ═══ */
export function GPUModel({installed,powerOn,position,...p}) {
  const r=useRef(),f1=useRef(),f2=useRef(),f3=useRef(),g=useRef(); useFloat(r,installed,position[1],1.2,2)
  useFrame(s=>{
    if(installed && powerOn){
      if(f1.current)f1.current.rotation.y+=0.15;
      if(f2.current)f2.current.rotation.y+=0.15;
      if(f3.current)f3.current.rotation.y+=0.15;
    }
    if(g.current?.material){
      if (powerOn) {
        const h=(s.clock.elapsedTime*0.5)%1;
        g.current.material.color.setHSL(h,1,0.6);
        g.current.material.emissive.setHSL(h,1,0.6);
        g.current.material.emissiveIntensity = 0.8 + Math.sin(s.clock.elapsedTime*5)*0.2;
      } else {
        g.current.material.color.setHex(0x00aaff);
        g.current.material.emissive.setHex(0x00aaff);
        g.current.material.emissiveIntensity = installed ? 0.1 : 0.4 + Math.sin(s.clock.elapsedTime*2)*0.2;
      }
    }
  })
  return <group ref={r} position={installed?SP.gpu:position} {...Ev(p)}>
    {/* Main shroud */}
    <mesh castShadow><boxGeometry args={[3.2,0.4,0.65]}/><meshStandardMaterial color="#111827" metalness={0.8} roughness={0.3}/></mesh>
    {/* Backplate */}
    <mesh position={[0,0.21,0]}><boxGeometry args={[3.25,0.04,0.68]}/><meshStandardMaterial color="#0d0d1a" metalness={0.9} roughness={0.1}/></mesh>
    {/* Triple Fans */}
    {[[-1.0,f1],[0,f2],[1.0,f3]].map(([x,ref],i)=><group key={i} position={[x,-0.15,0]}>
      <mesh ref={ref}><cylinderGeometry args={[0.26,0.26,0.04,16]}/><meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} transparent opacity={0.8}/></mesh>
      <mesh><torusGeometry args={[0.28,0.02,8,24]}/><meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3}/></mesh>
    </group>)}
    {/* Heatpipes on side */}
    {Array.from({length:3},(_,i)=><mesh key={`hp${i}`} position={[0,-0.05,0.34]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[0.02,0.02,3.0,8]}/>
      <meshStandardMaterial color="#c08040" metalness={0.9} roughness={0.2}/>
    </mesh>)}
    {/* Glow Logo */}
    <mesh ref={g} position={[0,0,-0.33]}><boxGeometry args={[2.8,0.08,0.01]}/><meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.4} transparent opacity={0.8}/></mesh>
    {/* PCIe Connector */}
    <mesh position={[-0.5,-0.25,0.15]}><boxGeometry args={[1.5,0.08,0.1]}/><meshStandardMaterial color="#c0a050" metalness={0.9} roughness={0.1}/></mesh>
    {powerOn&&<GlowRing color="#00aaff" radius={1.5} y={0.23}/>}
  </group>
}

/* ═══ PSU ═══ */
export function PSUModel({installed,position,placed=false,screws=0,onScrew,...p}) {
  const r=useRef(),f=useRef(); useFloat(r,installed&&!placed,position[1],1,3)
  useFrame(()=>{if(installed&&f.current)f.current.rotation.y+=0.03})
  // 4 screw positions at corners of PSU
  const SCREW_POS = [[-0.82,0.55,-0.52],[-0.82,0.55,0.52],[0.82,0.55,-0.52],[0.82,0.55,0.52]]
  return <group ref={r} position={installed?SP.psu:placed?SP.psu:position} {...Ev(p)}>
    <mesh castShadow><boxGeometry args={[1.8,1.0,1.2]}/><meshStandardMaterial color="#111827" metalness={0.7} roughness={0.3}/></mesh>
    <mesh ref={f} position={[0,0.51,0]} rotation={[-Math.PI/2,0,0]}><cylinderGeometry args={[0.35,0.35,0.02,16]}/><meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.4} transparent opacity={0.7}/></mesh>
    <mesh position={[0.91,0,0]}><boxGeometry args={[0.01,0.6,0.8]}/><meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={installed?0.5:0.15} transparent opacity={0.6}/></mesh>
    <mesh position={[-0.91,0.3,0]}><boxGeometry args={[0.02,0.12,0.08]}/><meshStandardMaterial color={installed?'#10b981':'#ef4444'} emissive={installed?'#10b981':'#ef4444'} emissiveIntensity={0.5}/></mesh>
    {/* Screw holes — visible when placed but not installed */}
    {placed && !installed && SCREW_POS.map((pos, i) => (
      <ScrewHole key={i} position={pos} onScrew={onScrew} done={i < screws} index={i} />
    ))}
    {installed&&<GlowRing color="#f59e0b" radius={0.5} y={0.55}/>}
  </group>
}

/* ═══ Sound Card ═══ */
export function SoundCardModel({installed,position,...p}) {
  const r=useRef(); useFloat(r,installed,position[1],1.4,4)
  return <group ref={r} position={installed?SP.sound_card:position} {...Ev(p)}>
    <mesh castShadow><boxGeometry args={[1.6,0.25,0.4]}/><meshStandardMaterial color="#1a1028" metalness={0.5} roughness={0.5}/></mesh>
    <mesh position={[0,0.13,0]}><boxGeometry args={[1.55,0.01,0.38]}/><meshStandardMaterial color="#e879f9" emissive="#e879f9" emissiveIntensity={0.2} transparent opacity={0.3}/></mesh>
    {[-0.4,0,0.4].map((x,i)=><mesh key={i} position={[x,0.05,-0.15]}><cylinderGeometry args={[0.06,0.06,0.02,12]}/><meshStandardMaterial color="#333" metalness={0.8} roughness={0.2}/></mesh>)}
    <mesh position={[0,-0.15,0.1]}><boxGeometry args={[1.4,0.03,0.08]}/><meshStandardMaterial color="#c0a050" metalness={0.9} roughness={0.1}/></mesh>
    {installed&&<GlowRing color="#e879f9" radius={0.6} y={0.15}/>}
  </group>
}

/* ═══ CMOS Battery ═══ */
export function CMOSModel({installed,position,...p}) {
  const r=useRef(); useFloat(r,installed,position[1],2,5)
  return <group ref={r} position={installed?SP.cmos_battery:position} {...Ev(p)}>
    <mesh castShadow><cylinderGeometry args={[0.12,0.12,0.04,20]}/><meshStandardMaterial color="#b0b0b0" metalness={0.9} roughness={0.1}/></mesh>
    <mesh position={[0,0.025,0]}><cylinderGeometry args={[0.08,0.08,0.005,16]}/><meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={installed?0.6:0.2} transparent opacity={0.7}/></mesh>
    {installed&&<GlowRing color="#fcd34d" radius={0.15} y={0.04}/>}
  </group>
}

/* ═══ CPU Cooler ═══ */
export function CPUCoolerModel({installed,powerOn,position,...p}) {
  const r=useRef(),f=useRef(),g=useRef(); useFloat(r,installed,position[1],1.3,1.5)
  useFrame((s)=>{
    if(installed&&powerOn&&f.current)f.current.rotation.z+=0.2
    if(g.current?.material) {
      if (powerOn) {
        const h=(s.clock.elapsedTime*0.4)%1;
        g.current.material.color.setHSL(h,1,0.5);
        g.current.material.emissive.setHSL(h,1,0.5);
        g.current.material.emissiveIntensity = 0.8;
      } else {
        g.current.material.color.setHex(0xf97316);
        g.current.material.emissive.setHex(0xf97316);
        g.current.material.emissiveIntensity = 0.1;
      }
    }
  })
  return <group ref={r} position={installed?SP.cpu_cooler:position} {...Ev(p)}>
    {/* Heatsink tower */}
    {Array.from({length:10},(_,i)=><mesh key={i} position={[0,i*0.04,0]} castShadow>
      <boxGeometry args={[0.7,0.03,0.65]}/><meshStandardMaterial color="#c0c0c8" metalness={0.85} roughness={0.15}/>
    </mesh>)}
    {/* Fan */}
    <mesh ref={f} position={[0.38,0.2,0]}><cylinderGeometry args={[0.28,0.28,0.04,16]} rotation={[0,0,Math.PI/2]}/><meshStandardMaterial color="#2a2a3e" metalness={0.5} roughness={0.4} transparent opacity={0.7}/></mesh>
    <mesh position={[0.38,0.2,0]}><torusGeometry ref={g} args={[0.3,0.02,8,24]} rotation={[0,0,Math.PI/2]}/><meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.3}/></mesh>
    {/* Heatpipes */}
    {[-0.15,0,0.15].map((z,i)=><mesh key={i} position={[0,-0.05,z]}><cylinderGeometry args={[0.025,0.025,0.45,8]}/><meshStandardMaterial color="#c08040" metalness={0.9} roughness={0.1}/></mesh>)}
    {powerOn&&<GlowRing color="#f97316" radius={0.45} y={0.45} opacity={0.6}/>}
  </group>
}

/* ═══ Case Fan ═══ */
export function CaseFanModel({installed,powerOn,position,color='#38bdf8',slotKey='fan_front',...p}) {
  const r=useRef(),f=useRef(),g=useRef(); useFloat(r,installed,position[1],1.6,2.5)
  useFrame((s)=>{
    if(installed&&powerOn&&f.current)f.current.rotation.z+=0.15
    if (g.current?.material) {
      if (powerOn) {
        const h=(s.clock.elapsedTime*0.4 + (slotKey==='fan_front'?0:0.5))%1;
        g.current.material.color.setHSL(h,1,0.5);
        g.current.material.emissive.setHSL(h,1,0.5);
        g.current.material.emissiveIntensity = 0.8;
      } else {
        g.current.material.color.set(color);
        g.current.material.emissive.set(color);
        g.current.material.emissiveIntensity = installed ? 0.1 : 0.5;
      }
    }
  })
  return <group ref={r} position={installed?SP[slotKey]:position} {...Ev(p)}>
    <mesh><boxGeometry args={[0.08,1.0,1.0]}/><meshStandardMaterial color="#111" metalness={0.6} roughness={0.4}/></mesh>
    <mesh ref={f} position={[0.02,0,0]} rotation={[0,0,0]}><cylinderGeometry args={[0.4,0.4,0.04,16]} rotation={[0,0,Math.PI/2]}/><meshStandardMaterial color="#222" metalness={0.5} roughness={0.4} transparent opacity={0.6}/></mesh>
    <mesh><torusGeometry ref={g} args={[0.45,0.02,8,24]} rotation={[0,0,Math.PI/2]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={installed?0.5:0.15}/></mesh>
    {powerOn&&<GlowRing color={color} radius={0.5} y={0} opacity={0.6}/>}
  </group>
}

/* ═══ HDD ═══ */
export function HDDModel({installed,position,placed=false,screws=0,onScrew,...p}) {
  const r=useRef(); useFloat(r,installed&&!placed,position[1],1.1,3.5)
  const SCREW_POS = [[-0.45,0.14,-0.3],[-0.45,0.14,0.3],[0.45,0.14,-0.3],[0.45,0.14,0.3]]
  return <group ref={r} position={installed?SP.hdd:placed?SP.hdd:position} {...Ev(p)}>
    <mesh castShadow><boxGeometry args={[1.0,0.25,0.7]}/><meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3}/></mesh>
    <mesh position={[0,0.13,0]}><boxGeometry args={[0.95,0.005,0.65]}/><meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4}/></mesh>
    <mesh position={[-0.35,0.13,0]}><cylinderGeometry args={[0.15,0.15,0.005,20]}/><meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1}/></mesh>
    <mesh position={[0.35,-0.12,0.25]}><boxGeometry args={[0.2,0.02,0.1]}/><meshStandardMaterial color="#c0a050" metalness={0.9} roughness={0.1}/></mesh>
    {/* Screw holes */}
    {placed && !installed && SCREW_POS.map((pos, i) => (
      <ScrewHole key={i} position={pos} onScrew={onScrew} done={i < screws} index={i} />
    ))}
    {installed&&<GlowRing color="#94a3b8" radius={0.4} y={0.15}/>}
  </group>
}

/* ═══ SSD ═══ */
export function SSDModel({installed,position,placed=false,screws=0,onScrew,...p}) {
  const r=useRef(); useFloat(r,installed&&!placed,position[1],1.5,4.2)
  const SCREW_POS = [[-0.3,0.05,-0.2],[-0.3,0.05,0.2],[0.3,0.05,-0.2],[0.3,0.05,0.2]]
  return <group ref={r} position={installed?SP.ssd:placed?SP.ssd:position} {...Ev(p)}>
    <mesh castShadow><boxGeometry args={[0.7,0.08,0.5]}/><meshStandardMaterial color="#111827" metalness={0.7} roughness={0.3}/></mesh>
    <mesh position={[0,0.045,0]}><boxGeometry args={[0.65,0.005,0.45]}/><meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={installed?0.3:0.1} transparent opacity={0.4}/></mesh>
    <mesh position={[0.25,-0.04,0.18]}><boxGeometry args={[0.15,0.02,0.08]}/><meshStandardMaterial color="#c0a050" metalness={0.9} roughness={0.1}/></mesh>
    {/* Screw holes */}
    {placed && !installed && SCREW_POS.map((pos, i) => (
      <ScrewHole key={i} position={pos} onScrew={onScrew} done={i < screws} index={i} />
    ))}
    {installed&&<GlowRing color="#2dd4bf" radius={0.3} y={0.06}/>}
  </group>
}
