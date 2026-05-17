import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * GhostSlots — Renders transparent, pulsing ghost outlines on the motherboard/chassis
 * showing WHERE each component should be installed. The ghost disappears once the 
 * component is installed.
 */

// Slot positions matching ComponentModels.jsx SP + Chassis layout
const GHOST_SLOTS = {
  cpu: {
    pos: [-0.6, 0.15, -0.7],
    size: [0.75, 0.06, 0.75],
    label: 'CPU',
    color: '#7b5ea7',
    shape: 'box',
  },
  ram: {
    pos: [1.0, 0.45, -0.5],
    size: [0.08, 0.7, 1.6],
    label: 'RAM',
    color: '#00ffc8',
    shape: 'box',
  },
  psu: {
    pos: [1.5, -1.6, -1.5],
    size: [1.8, 1.0, 1.2],
    label: 'PSU',
    color: '#f59e0b',
    shape: 'box',
  },
  cmos_battery: {
    pos: [1.7, 0.1, 1.0],
    size: [0.12, 0.04],
    label: 'CMOS',
    color: '#fcd34d',
    shape: 'cylinder',
  },
  cpu_cooler: {
    pos: [-0.6, 0.55, -0.7],
    size: [0.7, 0.4, 0.65],
    label: 'CPU Cooler',
    color: '#f97316',
    shape: 'box',
  },
  fan_front: {
    pos: [-1.8, 0.6, 2.0],
    size: [0.08, 1.0, 1.0],
    label: 'Front Fan',
    color: '#38bdf8',
    shape: 'box',
  },
  fan_rear: {
    pos: [0, 0.5, -2.3],
    size: [0.08, 1.0, 1.0],
    label: 'Rear Fan',
    color: '#818cf8',
    shape: 'box',
  },
  hdd: {
    pos: [-1.8, 0.3, 1.5],
    size: [1.0, 0.25, 0.7],
    label: 'HDD',
    color: '#94a3b8',
    shape: 'box',
  },
  ssd: {
    pos: [-1.8, -0.1, 1.5],
    size: [0.7, 0.08, 0.5],
    label: 'SSD',
    color: '#2dd4bf',
    shape: 'box',
  },
}

// Cable connector ports — show WHERE cables plug in on the motherboard
const CABLE_PORTS = {
  power_cable: {
    from: { pos: [2.4, -1.5, -1.2], label: 'PSU Out', color: '#ff6b9d' },
    to: { pos: [2.1, 0.1, 0.1], label: '24-Pin ATX', color: '#ff6b9d' },
  },
  sata_data: {
    from: { pos: [1.0, 0.07, -0.2], label: 'Mobo SATA', color: '#06d6a0' },
    to: { pos: [1.9, 0.1, 1.5], label: 'Drive SATA', color: '#06d6a0' },
  },
  sata_power: {
    from: { pos: [2.4, -1.4, -1.0], label: 'PSU SATA', color: '#fb7185' },
    to: { pos: [-1.5, 0.2, 1.5], label: 'Drive Power', color: '#fb7185' },
  },
  front_panel: {
    from: { pos: [0, -2.0, 2.3], label: 'Case Front', color: '#a78bfa' },
    to: { pos: [1.5, 0.07, 1.6], label: 'F_Panel Header', color: '#a78bfa' },
  },
  main_power: {
    from: { pos: [2.4, -1.5, -1.2], label: 'PSU Inlet', color: '#f43f5e' },
    to: { pos: [2.4, -3.5, -2.5], label: 'Wall Power', color: '#f43f5e' },
  },
}

function GhostBox({ pos, size, color, label, isNext }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      ref.current.material.opacity = isNext
        ? 0.18 + Math.sin(t * 3) * 0.1
        : 0.06 + Math.sin(t * 1.5) * 0.03
    }
  })
  return (
    <mesh ref={ref} position={pos}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isNext ? 0.6 : 0.2}
        transparent
        opacity={0.1}
        wireframe={!isNext}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function GhostCylinder({ pos, size, color, isNext }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      ref.current.material.opacity = isNext
        ? 0.18 + Math.sin(t * 3) * 0.1
        : 0.06 + Math.sin(t * 1.5) * 0.03
    }
  })
  return (
    <mesh ref={ref} position={pos}>
      <cylinderGeometry args={[size[0], size[0], size[1], 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isNext ? 0.6 : 0.2}
        transparent
        opacity={0.1}
        wireframe={!isNext}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function PortMarker({ pos, color, label, isNext }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      const scale = isNext ? 1.0 + Math.sin(t * 4) * 0.3 : 0.7
      ref.current.scale.setScalar(scale)
    }
  })
  return (
    <group ref={ref} position={pos}>
      {/* Outer ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.12, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isNext ? 1.0 : 0.3}
          transparent
          opacity={isNext ? 0.8 : 0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Center dot */}
      <mesh>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isNext ? 1.2 : 0.4}
          transparent
          opacity={isNext ? 0.9 : 0.4}
        />
      </mesh>
    </group>
  )
}

// Dashed line between two cable ports
function DashedGuide({ from, to, color, isNext }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = isNext
        ? 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2
        : 0.1
    }
  })

  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(
      (from[0] + to[0]) / 2,
      Math.max(from[1], to[1]) + 0.5,
      (from[2] + to[2]) / 2
    ),
    new THREE.Vector3(...to),
  ]
  const curve = new THREE.QuadraticBezierCurve3(...points)
  const pts = curve.getPoints(30)

  return (
    <line ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={pts.length}
          array={new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.2}
        linewidth={1}
      />
    </line>
  )
}

export default function GhostSlots({ installedComponents = [], selectedComponent, nextStep }) {
  const nextId = nextStep?.component || null

  return (
    <group>
      {/* Ghost outlines for hardware slots */}
      {Object.entries(GHOST_SLOTS).map(([id, slot]) => {
        if (installedComponents.includes(id)) return null
        const isNext = id === nextId || id === selectedComponent
        if (slot.shape === 'cylinder') {
          return (
            <GhostCylinder
              key={id}
              pos={slot.pos}
              size={slot.size}
              color={slot.color}
              isNext={isNext}
            />
          )
        }
        return (
          <GhostBox
            key={id}
            pos={slot.pos}
            size={slot.size}
            color={slot.color}
            label={slot.label}
            isNext={isNext}
          />
        )
      })}

      {/* Cable connector ports — show where cables plug in */}
      {Object.entries(CABLE_PORTS).map(([id, cable]) => {
        if (installedComponents.includes(id)) return null
        const isNext = id === nextId || id === selectedComponent
        return (
          <group key={id}>
            <PortMarker
              pos={cable.from.pos}
              color={cable.from.color}
              label={cable.from.label}
              isNext={isNext}
            />
            <PortMarker
              pos={cable.to.pos}
              color={cable.to.color}
              label={cable.to.label}
              isNext={isNext}
            />
            {isNext && (
              <DashedGuide
                from={cable.from.pos}
                to={cable.to.pos}
                color={cable.from.color}
                isNext={isNext}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}
