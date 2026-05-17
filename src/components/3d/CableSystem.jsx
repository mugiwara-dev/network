import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Cable({ points, color, progress=1, thickness=0.03 }) {
  const ref = useRef()
  const {geo,geoInner} = useMemo(() => {
    if (progress <= 0) return {geo:null,geoInner:null}
    const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)))
    const allPts = curve.getPoints(64)
    const ct = Math.max(2,Math.floor(65*progress))
    const partial = new THREE.CatmullRomCurve3(allPts.slice(0,ct))
    const seg = Math.max(2,Math.floor(64*progress))
    return {
      geo: new THREE.TubeGeometry(partial,seg,thickness,8,false),
      geoInner: new THREE.TubeGeometry(partial,seg,thickness*0.35,6,false),
    }
  }, [points, progress, thickness])

  useFrame(s=>{if(ref.current?.material) ref.current.material.emissiveIntensity=0.4+Math.sin(s.clock.elapsedTime*3)*0.2})
  if(!geo) return null
  return <group>
    <mesh ref={ref} geometry={geo}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.85} metalness={0.3} roughness={0.6}/></mesh>
    <mesh geometry={geoInner}><meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={0.8} transparent opacity={0.25}/></mesh>
  </group>
}

/** Ghost cable — faded dashed path showing where a cable WILL go */
function GhostCable({ points, color, isSelected=false }) {
  const ref = useRef()
  useFrame(s => {
    if (ref.current?.material) {
      ref.current.material.opacity = isSelected
        ? 0.3 + Math.sin(s.clock.elapsedTime * 3) * 0.15
        : 0.08 + Math.sin(s.clock.elapsedTime * 1.5) * 0.04
    }
  })

  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))
    return new THREE.TubeGeometry(curve, 32, 0.015, 6, false)
  }, [points])

  return (
    <mesh ref={ref} geometry={geo}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isSelected ? 0.5 : 0.15}
        transparent
        opacity={0.1}
        wireframe
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function Endpoint({position,color}) {
  const r=useRef()
  useFrame(s=>{if(r.current)r.current.scale.setScalar(1+Math.sin(s.clock.elapsedTime*4)*0.15)})
  return <mesh ref={r} position={position}><sphereGeometry args={[0.05,10,10]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.5}/></mesh>
}

const CABLES = {
  power_cable: {
    points:[[2.4,-1.5,-1.2],[2.3,-0.8,-0.8],[2.2,-0.2,-0.4],[2.1,0.1,0.1]],
    color:'#ff6b9d', thickness:0.04,
    label:'24-Pin ATX Power',
  },
  sata_data: {
    points:[[1.9,0.1,1.5],[1.6,0.2,1.3],[1.4,0.15,1.0],[1.2,0.1,0.5],[1.0,0.07,-0.2]],
    color:'#06d6a0', thickness:0.02,
    label:'SATA Data',
  },
  sata_power: {
    points:[[2.4,-1.4,-1.0],[2.2,-1.0,-0.5],[2.0,-0.5,0.2],[1.9,-0.1,0.8],[1.8,0.1,1.2],[-1.5,0.2,1.5]],
    color:'#fb7185', thickness:0.025,
    label:'SATA Power',
  },
  front_panel: {
    points:[[0,-2.0,2.3],[0.3,-1.5,2.0],[0.8,-0.8,1.8],[1.2,-0.2,1.6],[1.5,0.07,1.6]],
    color:'#a78bfa', thickness:0.015,
    label:'Front Panel',
  },
  main_power: {
    points:[[2.4,-1.5,-1.2], [2.4, -2.5, -1.8], [2.4, -3.5, -2.5]],
    color:'#f43f5e', thickness:0.05,
    label:'Main Power',
  },
}

export default function CableSystem({ installedComponents=[], cableAnimations={}, selectedComponent=null }) {
  return <group>
    {Object.entries(CABLES).map(([id,cfg]) => {
      const inst = installedComponents.includes(id)
      const prog = cableAnimations[id] || 0

      // Show ghost path when NOT installed (helps user see where cable goes)
      if (!inst) {
        const isSelected = selectedComponent === id
        return <group key={id}>
          <GhostCable points={cfg.points} color={cfg.color} isSelected={isSelected} />
        </group>
      }

      // Show active cable when installed
      return <group key={id}>
        <Cable points={cfg.points} color={cfg.color} progress={prog>0?prog:1} thickness={cfg.thickness}/>
        {prog>=1 && <>
          <Endpoint position={cfg.points[0]} color={cfg.color}/>
          <Endpoint position={cfg.points[cfg.points.length-1]} color={cfg.color}/>
        </>}
      </group>
    })}
  </group>
}
