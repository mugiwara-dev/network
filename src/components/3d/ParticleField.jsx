import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Ambient particle field — floating cybernetic particles in the background.
 */
export default function ParticleField({ count = 200 }) {
  const meshRef = useRef()

  const { positions, colors, scales } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const scales = new Float32Array(count)

    const colorOptions = [
      new THREE.Color('#00ffc8'),
      new THREE.Color('#00aaff'),
      new THREE.Color('#7b5ea7'),
    ]

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25

      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      scales[i] = Math.random() * 0.03 + 0.005
    }

    return { positions, colors, scales }
  }, [count])

  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        // Gentle upward drift
        positions[i * 3 + 1] += 0.003 + Math.sin(state.clock.elapsedTime + i) * 0.001

        // Reset if too high
        if (positions[i * 3 + 1] > 8) {
          positions[i * 3 + 1] = -8
        }
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
