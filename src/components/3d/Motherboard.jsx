import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Motherboard({ ramSlotUnlocked, onSlotClick, installedComponents = [], powerOn = false }) {
  const traceRef = useRef()

  useFrame((state) => {
    if (traceRef.current) {
      const t = powerOn ? 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.4 : 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.15
      traceRef.current.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material.emissiveIntensity = t
          if (powerOn) c.material.color.setHSL((state.clock.elapsedTime*0.1)%1, 1, 0.5)
        }
      })
    }
  })

  const hasCpu = installedComponents.includes('cpu')
  const hasRam = installedComponents.includes('ram')
  const hasGpu = false // No discrete GPU — i3-10100 uses integrated UHD 630
  const hasPower = installedComponents.includes('power_cable')
  const hasSata = installedComponents.includes('sata_cable')

  // Generate SMD components (tiny chips, resistors) - heavily reduced count for performance
  const smdChips = []
  for (let x = -1.8; x <= 1.6; x += 0.35) {
    for (let z = -1.5; z <= 1.5; z += 0.4) {
      if (Math.random() > 0.85) { // Reduced from 0.55 to save ~40-50 draw calls
        smdChips.push([x + (Math.random() - 0.5) * 0.1, 0.075, z + (Math.random() - 0.5) * 0.1, Math.random()])
      }
    }
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Main PCB */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.12, 3.8]} />
        <meshStandardMaterial color="#0c2218" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* PCB edge glow */}
      <mesh position={[0, 0.065, 0]}>
        <boxGeometry args={[4.55, 0.005, 3.85]} />
        <meshStandardMaterial color="#00ffc8" emissive="#00ffc8" emissiveIntensity={0.15} transparent opacity={0.1} />
      </mesh>

      {/* Dense PCB traces */}
      <group ref={traceRef} position={[0, 0.065, 0]}>
        {[-1.4, -0.8, -0.2, 0.4, 1.0, 1.4].map((z, i) => (
          <mesh key={`ht-${i}`} position={[0, 0, z]}>
            <boxGeometry args={[4.2, 0.003, 0.012]} />
            <meshStandardMaterial color="#00ffc8" emissive="#00ffc8" emissiveIntensity={0.3} transparent opacity={0.5} />
          </mesh>
        ))}
        {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((x, i) => (
          <mesh key={`vt-${i}`} position={[x, 0, 0]}>
            <boxGeometry args={[0.012, 0.003, 3.4]} />
            <meshStandardMaterial color="#00ffc8" emissive="#00ffc8" emissiveIntensity={0.3} transparent opacity={0.4} />
          </mesh>
        ))}
        {/* Diagonal traces */}
        {[[-0.8, 0, -0.6], [0.4, 0, 0.8], [-1.2, 0, 0.4]].map((pos, i) => (
          <mesh key={`dt-${i}`} position={pos} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[1.2, 0.003, 0.01]} />
            <meshStandardMaterial color="#ff6b9d" emissive="#ff6b9d" emissiveIntensity={0.25} transparent opacity={0.35} />
          </mesh>
        ))}
      </group>

      {/* SMD chips scattered on PCB */}
      {smdChips.map(([x, y, z, r], i) => (
        <mesh key={`smd-${i}`} position={[x, y, z]} castShadow>
          <boxGeometry args={r > 0.5 ? [0.1, 0.04, 0.06] : [0.05, 0.03, 0.03]} />
          <meshStandardMaterial color={r > 0.7 ? '#1a1a2e' : '#111'} metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* VRM heatsink array near CPU — detailed fins */}
      <group position={[-1.7, 0.07, -0.9]}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={`vrm-${i}`} position={[0, 0.06, i * 0.12]} castShadow>
            <boxGeometry args={[0.35, 0.12, 0.08]} />
            <meshStandardMaterial color="#14142a" metalness={0.85} roughness={0.15} />
          </mesh>
        ))}
        {/* VRM heatsink base */}
        <mesh position={[0, 0.02, 0.42]}>
          <boxGeometry args={[0.38, 0.04, 1.05]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Top VRM row */}
      <group position={[-1.0, 0.07, -1.65]}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={`vrmT-${i}`} position={[i * 0.14, 0.06, 0]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.3]} />
            <meshStandardMaterial color="#14142a" metalness={0.85} roughness={0.15} />
          </mesh>
        ))}
      </group>

      {/* Capacitors cluster */}
      {[[1.6, 0.1, -1.3], [1.75, 0.1, -1.1], [1.6, 0.1, -0.9], [1.75, 0.1, -0.7],
        [1.6, 0.1, -0.5], [-0.2, 0.1, 1.6], [0.1, 0.1, 1.6], [0.4, 0.1, 1.6]].map((p, i) => (
        <mesh key={`cap-${i}`} position={p} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Chipset heatsink */}
      <mesh position={[0.5, 0.15, 0.8]} castShadow>
        <boxGeometry args={[0.8, 0.18, 0.8]} />
        <meshStandardMaterial color="#16162a" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0.5, 0.25, 0.8]}>
        <boxGeometry args={[0.6, 0.003, 0.6]} />
        <meshStandardMaterial color="#7b5ea7" emissive="#7b5ea7" emissiveIntensity={0.6} transparent opacity={0.4} />
      </mesh>

      {/* IO Shield */}
      <mesh position={[-2.1, 0.2, 0]} castShadow>
        <boxGeometry args={[0.25, 0.35, 2.8]} />
        <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
      </mesh>
      {[-0.8, -0.4, 0, 0.4, 0.8].map((z, i) => (
        <mesh key={`io-${i}`} position={[-2.24, 0.2, z]}>
          <boxGeometry args={[0.015, 0.12, 0.22]} />
          <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.3} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* ══ CPU Socket ══ */}
      <group position={[-0.6, 0.065, -0.7]}>
        <mesh><boxGeometry args={[0.95, 0.04, 0.95]} />
          <meshStandardMaterial color={hasCpu ? '#2d1f4e' : '#1a1a2e'} metalness={0.5} roughness={0.5} /></mesh>
        <mesh position={[0, 0.025, 0]}><boxGeometry args={[0.8, 0.008, 0.8]} />
          <meshStandardMaterial color="#c0a050" metalness={0.9} roughness={0.1}
            emissive={hasCpu ? '#7b5ea7' : '#c0a050'} emissiveIntensity={hasCpu ? 0.5 : 0.1} /></mesh>
        {[[-0.45, 0.04, 0], [0.45, 0.04, 0], [0, 0.04, -0.45], [0, 0.04, 0.45]].map((p, i) => (
          <mesh key={`cf-${i}`} position={p}>
            <boxGeometry args={i < 2 ? [0.04, 0.06, 0.9] : [0.9, 0.06, 0.04]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} /></mesh>
        ))}
      </group>

      {/* ══ RAM Slots (2x DIMM) with detailed contacts ══ */}
      <group position={[1.0, 0.065, -0.5]}>
        {[0, 0.28].map((off, i) => (
          <group key={`rs-${i}`} position={[off, 0, 0]}>
            <mesh><boxGeometry args={[0.12, 0.03, 1.8]} />
              <meshStandardMaterial color={hasRam ? '#0a3d2e' : '#1a1a2e'} metalness={0.5} roughness={0.5} /></mesh>
            {/* Individual pin contacts -> Unified into a single visual bar for performance (saves 40 draw calls) */}
            <mesh position={[0, 0.018, 0]}>
              <boxGeometry args={[0.06, 0.004, 1.7]} />
              <meshStandardMaterial color="#c0a050" metalness={0.95} roughness={0.05} />
            </mesh>
            {/* Locking tabs */}
            {[-0.95, 0.95].map((z, ci) => (
              <group key={`clip-${ci}`} position={[0, 0.04, z]}
                onClick={(e) => { e.stopPropagation(); onSlotClick?.() }}>
                <mesh><boxGeometry args={[0.15, 0.1, 0.07]} />
                  <meshStandardMaterial color={ramSlotUnlocked ? '#00ffc8' : '#444'}
                    emissive={ramSlotUnlocked ? '#00ffc8' : '#000'} emissiveIntensity={ramSlotUnlocked ? 0.6 : 0}
                    metalness={0.7} roughness={0.3} /></mesh>
                {/* Tab detail */}
                <mesh position={[0, 0.04, z > 0 ? 0.02 : -0.02]}>
                  <boxGeometry args={[0.08, 0.03, 0.02]} />
                  <meshStandardMaterial color={ramSlotUnlocked ? '#00ffc8' : '#555'} metalness={0.8} roughness={0.2} />
                </mesh>
              </group>
            ))}
          </group>
        ))}
      </group>

      {/* ══ PCIe x16 Slot ══ */}
      <group position={[0, 0.065, 1.2]}>
        <mesh><boxGeometry args={[3.2, 0.05, 0.2]} />
          <meshStandardMaterial color={hasGpu ? '#0a2540' : '#1a1a2e'} metalness={0.5} roughness={0.5} /></mesh>
        <mesh position={[0, 0.03, 0]}><boxGeometry args={[3.0, 0.004, 0.15]} />
          <meshStandardMaterial color="#c0a050" metalness={0.9} roughness={0.1}
            emissive={hasGpu ? '#00aaff' : '#c0a050'} emissiveIntensity={hasGpu ? 0.4 : 0.05} /></mesh>
        <mesh position={[1.55, 0.05, 0]}><boxGeometry args={[0.1, 0.08, 0.22]} />
          <meshStandardMaterial color={hasGpu ? '#00aaff' : '#444'}
            emissive={hasGpu ? '#00aaff' : '#000'} emissiveIntensity={hasGpu ? 0.5 : 0} metalness={0.7} roughness={0.3} /></mesh>
      </group>

      {/* ══ 24-Pin ATX Power Connector ══ */}
      <group position={[2.0, 0.065, 0.1]}>
        <mesh><boxGeometry args={[0.28, 0.14, 0.95]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} /></mesh>
        {/* Individual pin holes -> Unified to two solid bars for performance (saves 24 draw calls) */}
        <mesh position={[0.05, 0.075, 0]}>
          <boxGeometry args={[0.03, 0.003, 0.85]} />
          <meshStandardMaterial color={hasPower ? '#ff6b9d' : '#c0a050'} metalness={0.9} roughness={0.1}
            emissive={hasPower ? '#ff6b9d' : '#000'} emissiveIntensity={hasPower ? 0.5 : 0} />
        </mesh>
        <mesh position={[-0.05, 0.075, 0]}>
          <boxGeometry args={[0.03, 0.003, 0.85]} />
          <meshStandardMaterial color={hasPower ? '#ff6b9d' : '#c0a050'} metalness={0.9} roughness={0.1}
            emissive={hasPower ? '#ff6b9d' : '#000'} emissiveIntensity={hasPower ? 0.5 : 0} />
        </mesh>
        {/* Connector latch */}
        <mesh position={[0.15, 0.08, 0]}><boxGeometry args={[0.02, 0.1, 0.5]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} /></mesh>
      </group>

      {/* ══ SATA Ports (stacked pair) ══ */}
      <group position={[1.8, 0.065, 1.5]}>
        {[0, 0.18].map((y, i) => (
          <group key={`sata-${i}`} position={[0, y, 0]}>
            <mesh><boxGeometry args={[0.35, 0.1, 0.12]} />
              <meshStandardMaterial color={hasSata ? '#0a3d2e' : '#1a1a2e'} metalness={0.5} roughness={0.5} /></mesh>
            <mesh position={[0, 0.02, -0.04]}><boxGeometry args={[0.28, 0.004, 0.02]} />
              <meshStandardMaterial color={hasSata ? '#06d6a0' : '#c0a050'} metalness={0.9} roughness={0.1}
                emissive={hasSata ? '#06d6a0' : '#000'} emissiveIntensity={hasSata ? 0.5 : 0} /></mesh>
          </group>
        ))}
        {/* SATA label */}
        <mesh position={[0, 0.24, 0]}><boxGeometry args={[0.2, 0.003, 0.06]} />
          <meshStandardMaterial color="#06d6a0" emissive="#06d6a0" emissiveIntensity={0.5} transparent opacity={0.4} /></mesh>
      </group>

      {/* M.2 Slot */}
      <mesh position={[0.5, 0.07, 0.2]}>
        <boxGeometry args={[1.0, 0.02, 0.18]} />
        <meshStandardMaterial color="#1e1e30" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* CMOS Battery */}
      <mesh position={[1.7, 0.1, 1.0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Mounting holes */}
      {[[-2.1, 0.07, -1.8], [2.1, 0.07, -1.8], [-2.1, 0.07, 1.8], [2.1, 0.07, 1.8]].map((p, i) => (
        <mesh key={`mh-${i}`} position={p}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 12]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  )
}
