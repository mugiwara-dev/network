import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Chassis({ powerOnState }) {
  const ledRef = useRef()
  useFrame((s) => {
    if (ledRef.current?.material) {
      ledRef.current.material.emissiveIntensity = powerOnState === 'success'
        ? 0.6 + Math.sin(s.clock.elapsedTime * 2) * 0.3 : 0.1
    }
  })

  const F = '#0a0e14', M = 0.85, R = 0.2
  // Case dims: width=5.5, height=4.5, depth=5
  const W=5.5, H=4.5, D=5, T=0.08

  return (
    <group position={[0, -0.3, 0]}>
      {/* Bottom panel */}
      <mesh position={[0, -H/2, 0]} receiveShadow>
        <boxGeometry args={[W, T, D]} /><meshStandardMaterial color={F} metalness={M} roughness={R} />
      </mesh>
      {/* Back panel */}
      <mesh position={[0, 0, -D/2]}>
        <boxGeometry args={[W, H, T]} /><meshStandardMaterial color={F} metalness={M} roughness={R} />
      </mesh>
      {/* Left side panel (removed transparent glass to fix extreme fill-rate lag on mobile/low-end GPUs) */}
      {/* <mesh position={[-W/2, 0, 0]}>
        <boxGeometry args={[T, H, D]} />
        <meshStandardMaterial color="#0a0e14" metalness={0.5} roughness={0.3} transparent opacity={0.15} />
      </mesh> */}
      {/* Right side panel */}
      <mesh position={[W/2, 0, 0]}>
        <boxGeometry args={[T, H, D]} /><meshStandardMaterial color={F} metalness={M} roughness={R} />
      </mesh>
      {/* Top panel - mesh/vent */}
      <mesh position={[0, H/2, 0]}>
        <boxGeometry args={[W, T, D]} />
        <meshStandardMaterial color="#0c1018" metalness={0.7} roughness={0.3} transparent opacity={0.6} />
      </mesh>

      {/* Motherboard tray (back plate) */}
      <mesh position={[0.2, 0, -D/2+0.15]}>
        <boxGeometry args={[4.8, 4, T/2]} /><meshStandardMaterial color="#080c12" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Standoffs */}
      {[[-1.5,1.2],[-1.5,-0.8],[1.5,1.2],[1.5,-0.8],[0,0.2]].map(([x,y],i) => (
        <mesh key={`so-${i}`} position={[x, y, -D/2+0.25]}>
          <cylinderGeometry args={[0.06, 0.06, 0.2, 8]} />
          <meshStandardMaterial color="#c0a050" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* Cable routing holes (behind mobo tray) */}
      {[0.8, -0.5, -1.5].map((y, i) => (
        <group key={`hole-${i}`} position={[2.2, y, -D/2+0.15]}>
          <mesh><boxGeometry args={[0.4, 0.6, 0.2]} />
            <meshStandardMaterial color="#000" metalness={0.3} roughness={0.8} /></mesh>
          {/* Rubber grommet */}
          <mesh><boxGeometry args={[0.45, 0.65, 0.05]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.9} /></mesh>
        </group>
      ))}

      {/* PSU bay (bottom rear) */}
      <mesh position={[1.5, -H/2+0.5, -D/2+0.8]}>
        <boxGeometry args={[2.2, 0.9, 1.5]} />
        <meshStandardMaterial color="#060810" metalness={0.7} roughness={0.3} transparent opacity={0.3} />
      </mesh>
      {/* PSU bay divider */}
      <mesh position={[0.3, -H/2+0.95, 0]}>
        <boxGeometry args={[W-0.2, T/2, D-0.2]} /><meshStandardMaterial color={F} metalness={M} roughness={R} />
      </mesh>

      {/* Drive cage (front top area) */}
      <group position={[-1.8, 0.5, D/2-0.8]}>
        {/* Cage frame */}
        <mesh><boxGeometry args={[1.2, 2.0, 1.2]} />
          <meshStandardMaterial color="#0c1018" metalness={0.7} roughness={0.3} transparent opacity={0.25} /></mesh>
        {/* Drive rails */}
        {[0.6, 0.1, -0.4].map((y,i) => (
          <mesh key={`rail-${i}`} position={[0, y, 0]}>
            <boxGeometry args={[1.15, 0.04, 1.15]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Front panel area (made opaque to prevent massive depth-sorting lag) */}
      <mesh position={[0, 0, D/2]}>
        <boxGeometry args={[W, H, T]} />
        <meshStandardMaterial color="#080c14" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Front panel USB/Power button area */}
      <group position={[-0.5, H/2-0.3, D/2+0.02]}>
        {/* Power button */}
        <mesh ref={ledRef}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} rotation={[Math.PI/2,0,0]} />
          <meshStandardMaterial
            color={powerOnState === 'success' ? '#00ffc8' : '#333'}
            emissive={powerOnState === 'success' ? '#00ffc8' : '#333'}
            emissiveIntensity={0.1} />
        </mesh>
        {/* USB ports */}
        {[0.3, 0.5].map((x,i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.12, 0.06, 0.02]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Rear fan mount hole */}
      <mesh position={[0, 0.5, -D/2+0.02]}>
        <torusGeometry args={[0.5, 0.03, 8, 24]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Front fan mount holes */}
      {[0.6, -0.6].map((y,i) => (
        <mesh key={`ffm-${i}`} position={[-1.8, y, D/2-0.02]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.45, 0.02, 8, 24]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* PCIe slot brackets (back) */}
      {[-0.2, 0.0, 0.2, 0.4, 0.6, 0.8, 1.0].map((y,i) => (
        <mesh key={`pci-${i}`} position={[-0.8, y-0.8, -D/2+0.02]}>
          <boxGeometry args={[0.08, 0.18, 0.02]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Case feet */}
      {[[-W/2+0.3,-H/2-0.08,D/2-0.3],[W/2-0.3,-H/2-0.08,D/2-0.3],
        [-W/2+0.3,-H/2-0.08,-D/2+0.3],[W/2-0.3,-H/2-0.08,-D/2+0.3]].map((p,i) => (
        <mesh key={`ft-${i}`} position={p}>
          <cylinderGeometry args={[0.12, 0.15, 0.08, 12]} />
          <meshStandardMaterial color="#111" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}

      {/* Edge accent lights */}
      {[[0, H/2+0.01, D/2-0.02, W-0.2, 0.005, 0.01],
        [0, H/2+0.01, -D/2+0.02, W-0.2, 0.005, 0.01],
        [-W/2+0.02, H/2+0.01, 0, 0.01, 0.005, D-0.2]].map((a,i) => (
        <mesh key={`el-${i}`} position={[a[0],a[1],a[2]]}>
          <boxGeometry args={[a[3],a[4],a[5]]} />
          <meshStandardMaterial color="#00ffc8" emissive="#00ffc8" emissiveIntensity={0.3} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}
