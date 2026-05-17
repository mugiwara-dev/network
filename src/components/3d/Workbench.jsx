import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * The virtual workbench / lab table surface
 */
export default function Workbench() {
  const gridRef = useRef()

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.material.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02
    }
  })

  return (
    <group position={[0, -0.5, 0]}>
      {/* Table surface — dark metallic slab */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[12, 0.3, 8]} />
        <meshStandardMaterial
          color="#0a0e14"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* Glowing edge trim */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[12.05, 0.02, 8.05]} />
        <meshStandardMaterial
          color="#00ffc8"
          emissive="#00ffc8"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Grid pattern on surface */}
      <mesh ref={gridRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11.5, 7.5]} />
        <meshStandardMaterial
          color="#00ffc8"
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>

      {/* Left support leg */}
      <mesh position={[-5.5, -1.3, 0]}>
        <boxGeometry args={[0.4, 2.3, 6]} />
        <meshStandardMaterial color="#080c12" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Right support leg */}
      <mesh position={[5.5, -1.3, 0]}>
        <boxGeometry args={[0.4, 2.3, 6]} />
        <meshStandardMaterial color="#080c12" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Subtle floor / ground plane */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#020408"
          metalness={0.5}
          roughness={0.8}
        />
      </mesh>
    </group>
  )
}
