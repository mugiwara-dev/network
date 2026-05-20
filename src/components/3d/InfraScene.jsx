import { Suspense, useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Grid, ContactShadows, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useLabStore } from '../../store/useLabStore'
import { useIsMobile } from '../../hooks/useIsMobile'

// Standard rack dimensions
const RACK_W = 2.4
const RACK_H = 6.0
const RACK_D = 3.0
const U_HEIGHT = 0.25

const CABLE_TYPES = {
  'cat6': '#00aaff',   // Neon Blue
  'fiber': '#39ff14',  // Neon Green
  'cat5e': '#ffff00',  // Neon Yellow
  'cat6a': '#bd00ff',
  'power': '#f43f5e'   // Neon Pink/Rose
}

function FloatingLabel({ text, color, offsetX = 0 }) {
  const isMobile = useIsMobile()
  
  // Adjust sizing and offset on mobile so component names fit perfectly on narrower viewports
  const fontSize = isMobile ? 0.14 : 0.22
  const lineLength = isMobile ? 0.35 - offsetX : 0.6 - offsetX
  const linePos = isMobile ? -1.35 + offsetX / 2 : -1.5 + offsetX / 2
  const textPos = isMobile ? -1.55 + offsetX : -1.85 + offsetX

  return (
    <group position={[0, 0, 0]}>
      {/* Horizontal Connector Line */}
      <mesh position={[linePos, 0, 1.51]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.003, 0.003, lineLength]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} toneMapped={false} />
      </mesh>
      
      {/* Floating Text */}
      <Text 
        position={[textPos, 0, 1.51]} 
        fontSize={fontSize} 
        color={color} 
        anchorX="right" 
        anchorY="middle"
      >
        {text}
        <meshBasicMaterial color={color} toneMapped={false} />
      </Text>
    </group>
  )
}

function ClickablePort({ position, portId, name, size=[0.06, 0.08, 0.02], label }) {
  const [hovered, setHovered] = useState(false)
  const handleInfraPortClick = useLabStore(s => s.handleInfraPortClick)
  const infraSelectedPort = useLabStore(s => s.infraSelectedPort)
  const infraSelectedCable = useLabStore(s => s.infraSelectedCable)
  const isMobile = useIsMobile()
  
  const isSelected = infraSelectedPort?.id === portId
  const isPowerPort = portId.includes('pwr') || portId.startsWith('ups_p')
  
  // Assess compatibility with currently selected cable
  const isCompatible = useMemo(() => {
    if (!infraSelectedCable) return false
    if (infraSelectedCable === 'power') {
      return isPowerPort
    } else {
      return !isPowerPort
    }
  }, [infraSelectedCable, portId, isPowerPort])

  // Get active indicator colors based on cable selection
  const activeColor = useMemo(() => {
    if (infraSelectedCable === 'power') return '#f43f5e' // Neon Pink/Rose
    if (infraSelectedCable === 'fiber') return '#39ff14' // Neon Green
    if (infraSelectedCable) return '#00aaff' // Neon Blue for CAT6/5e/6a
    return '#00ffc8' // Standard fallback highlight
  }, [infraSelectedCable])

  const glowRef = useRef()
  const portMeshRef = useRef()

  useFrame((state) => {
    // Dynamic pulsing emissive light for compatibility or active selection
    if (portMeshRef.current) {
      if (isSelected) {
        portMeshRef.current.material.emissive.set(activeColor)
        portMeshRef.current.material.emissiveIntensity = 1.5
      } else if (hovered && infraSelectedCable) {
        portMeshRef.current.material.emissive.set(activeColor)
        portMeshRef.current.material.emissiveIntensity = 1.0
      } else if (isCompatible) {
        // High-tech breathing glow effect for compatible targets
        const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 6) * 0.3
        portMeshRef.current.material.emissive.set(activeColor)
        portMeshRef.current.material.emissiveIntensity = pulse
      } else {
        portMeshRef.current.material.emissive.set('#000000')
        portMeshRef.current.material.emissiveIntensity = 0
      }
    }

    // Dynamic rotation and breathing scale for the futuristic wireframe guide ring
    if (glowRef.current) {
      glowRef.current.rotation.z = state.clock.elapsedTime * 1.5
      glowRef.current.scale.setScalar(1.25 + Math.sin(state.clock.elapsedTime * 8) * 0.15)
    }
  })

  return (
    <group 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); !isMobile && setHovered(true) }}
      onPointerOut={() => !isMobile && setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        const vec = new THREE.Vector3()
        e.object.getWorldPosition(vec)
        // Hitbox usually slightly forward, get exact position of the port visual
        vec.z -= 0.02
        handleInfraPortClick(portId, vec.toArray(), name)
      }}
    >
      {/* Large Invisible Hitbox */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[size[0] * 2, size[1] * 2, 0.08]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      
      {/* Visible Port Graphic */}
      <mesh ref={portMeshRef}>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={isSelected || (hovered && infraSelectedCable) ? activeColor : '#111111'} 
          emissive={isSelected || (hovered && infraSelectedCable) ? activeColor : '#000000'} 
          emissiveIntensity={hovered ? 0.8 : 0.5}
          metalness={0.2} roughness={0.8} 
        />
      </mesh>

      {/* Cyberpunk Spinning Outer Guide Ring (Breathing scale & Rotation) */}
      {isCompatible && (
        <mesh ref={glowRef} position={[0, 0, 0.01]}>
          <boxGeometry args={[size[0], size[1], size[2] * 1.5]} />
          <meshBasicMaterial 
            color={activeColor} 
            wireframe 
            transparent 
            opacity={0.6}
            toneMapped={false}
          />
        </mesh>
      )}
      
      {label && (
        isMobile ? (
          <Text 
            position={[0, size[1] > 0.06 ? size[1] : -0.06, 0.03]} 
            fontSize={0.035} 
            color={isCompatible ? activeColor : '#94a3b8'} 
            anchorX="center" 
            anchorY="middle"
          >
            {label}
            <meshBasicMaterial color={isCompatible ? activeColor : '#94a3b8'} toneMapped={false} />
          </Text>
        ) : (
          <Html position={[0, size[1] > 0.06 ? size[1] : -0.06, 0]} transform style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '3px', color: isCompatible ? activeColor : '#94a3b8',
            transition: 'color 0.2s', textShadow: isCompatible ? `0 0 4px ${activeColor}` : 'none'
          }}>
            {label}
          </Html>
        )
      )}
    </group>
  )
}

function ServerRack() {
  return (
    <group position={[0, RACK_H / 2, 0]}>
      {/* 4 Vertical Posts */}
      {[[-RACK_W/2, -RACK_D/2], [RACK_W/2, -RACK_D/2], [-RACK_W/2, RACK_D/2], [RACK_W/2, RACK_D/2]].map((pos, i) => (
        <mesh key={`post-${i}`} position={[pos[0], 0, pos[1]]}>
          <boxGeometry args={[0.1, RACK_H, 0.1]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      
      {/* Top and Bottom Frames */}
      {[-RACK_H/2 + 0.05, RACK_H/2 - 0.05].map((y, i) => (
        <group key={`frame-${i}`} position={[0, y, 0]}>
          <mesh position={[0, 0, -RACK_D/2]}><boxGeometry args={[RACK_W + 0.1, 0.1, 0.1]} /><meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} /></mesh>
          <mesh position={[0, 0, RACK_D/2]}><boxGeometry args={[RACK_W + 0.1, 0.1, 0.1]} /><meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} /></mesh>
          <mesh position={[-RACK_W/2, 0, 0]}><boxGeometry args={[0.1, 0.1, RACK_D + 0.1]} /><meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} /></mesh>
          <mesh position={[RACK_W/2, 0, 0]}><boxGeometry args={[0.1, 0.1, RACK_D + 0.1]} /><meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} /></mesh>
        </group>
      ))}
      
      <mesh position={[-RACK_W/2, 0, 0]}>
        <boxGeometry args={[0.02, RACK_H, RACK_D]} />
        <meshStandardMaterial color="#020617" transparent opacity={0.6} metalness={0.9} roughness={0.5} />
      </mesh>
      <mesh position={[RACK_W/2, 0, 0]}>
        <boxGeometry args={[0.02, RACK_H, RACK_D]} />
        <meshStandardMaterial color="#020617" transparent opacity={0.6} metalness={0.9} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, -RACK_D/2]}>
        <boxGeometry args={[RACK_W, RACK_H, 0.02]} />
        <meshStandardMaterial color="#020617" transparent opacity={0.8} metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  )
}

function Server1U({ position, title, color, serverId }) {
  const ledRef = useRef()
  const getInstallProgress = useLabStore(s => s.getInstallProgress)
  const infraCables = useLabStore(s => s.infraCables)
  
  const progress = getInstallProgress()
  const isFullyAssembled = progress.done === progress.total
  const hasPower = infraCables.some(c => 
    (c.source.id === `${serverId}_pwr` && c.dest.id.startsWith('ups')) || 
    (c.dest.id === `${serverId}_pwr` && c.source.id.startsWith('ups'))
  )
  const powerOn = isFullyAssembled && hasPower

  useFrame((state) => {
    if (ledRef.current) {
      ledRef.current.material.emissiveIntensity = powerOn ? 0.5 + Math.sin(state.clock.elapsedTime * 4 + position[1]) * 0.5 : 0
    }
  })

  // Server Depth = 2.8. Front = 1.5, Center = 1.5 - 1.4 = 0.1
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT - 0.02, 2.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      
      <mesh position={[0, 0, 1.48]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT - 0.02, 0.04]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* LAN Ports */}
      <group position={[0.3, 0, 1.51]}>
        {[1, 2].map((pNum) => (
          <group key={pNum} position={[(pNum - 1) * 0.1, 0, 0]}>
            <ClickablePort 
              position={[0, 0, 0]} 
              portId={`${serverId}_p${pNum}`} 
              name={`${title} LAN ${pNum}`} 
              size={[0.06, 0.06, 0.02]} 
            />
            {/* NIC Link Light */}
            <mesh position={[0.04, 0.04, 0.01]}>
              <boxGeometry args={[0.015, 0.015, 0.01]} />
              <meshStandardMaterial 
                color={powerOn ? '#10b981' : '#333'} 
                emissive={powerOn ? '#10b981' : '#000'} 
                emissiveIntensity={powerOn ? 0.8 : 0} 
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Power Port */}
      <group position={[-0.8, 0, 1.51]}>
        <ClickablePort 
          position={[0, 0, 0]} 
          portId={`${serverId}_pwr`} 
          name={`${title} Power`} 
          label="PWR"
          size={[0.08, 0.06, 0.02]} 
        />
      </group>

      <mesh ref={ledRef} position={[0.6, 0, 1.51]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>

      <FloatingLabel text={title} color={color} />
    </group>
  )
}

function PatchPanel1U({ position }) {
  // Depth = 0.4. Center = 1.5 - 0.2 = 1.3
  return (
    <group position={position}>
      <mesh position={[0, 0, 1.3]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT - 0.02, 0.4]} />
        <meshStandardMaterial color="#020617" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 1.49]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT - 0.02, 0.02]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      <group position={[-0.97, 0, 1.51]}>
        {Array.from({ length: 24 }).map((_, i) => (
          <ClickablePort 
            key={`patch-port-${i}`} 
            position={[i * 0.084, 0, 0]} 
            portId={`patch_p${i+1}`} 
            name={`Patch Panel P${i+1}`} 
            label={i + 1}
            size={[0.06, 0.08, 0.02]} 
          />
        ))}
      </group>

      <FloatingLabel text="PATCH" color="#e879f9" />
    </group>
  )
}

function NetworkSwitch1U({ position }) {
  const ledsRef = useRef([])

  useFrame((state) => {
    ledsRef.current.forEach((led, i) => {
      if (led && Math.random() > 0.9) {
        led.material.emissiveIntensity = Math.random() > 0.5 ? 1 : 0.2
      }
    })
  })

  // Depth = 1.0. Center = 1.5 - 0.5 = 1.0
  return (
    <group position={position}>
      <mesh position={[0, 0, 1.0]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT - 0.02, 1.0]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 1.49]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT - 0.02, 0.02]} />
        <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.1} />
      </mesh>

      <group position={[-0.97, 0, 1.51]}>
        {Array.from({ length: 24 }).map((_, i) => (
          <group key={`sw-port-${i}`} position={[i * 0.084, -0.02, 0]}>
            <ClickablePort 
              position={[0, 0, 0]} 
              portId={`switch_p${i+1}`} 
              name={`Switch P${i+1}`} 
              label={i + 1}
              size={[0.06, 0.06, 0.02]} 
            />
            <mesh ref={el => ledsRef.current[i] = el} position={[0, 0.06, 0]}>
              <boxGeometry args={[0.03, 0.02, 0.01]} />
              <meshStandardMaterial color="#00ffc8" emissive="#00ffc8" emissiveIntensity={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Power Port */}
      <group position={[-0.8, 0, 1.51]}>
        <ClickablePort 
          position={[0, 0, 0]} 
          portId={`switch_pwr`} 
          name={`Switch Power`} 
          label="PWR"
          size={[0.08, 0.06, 0.02]} 
        />
      </group>

      <FloatingLabel text="SWITCH" color="#00ffc8" />
    </group>
  )
}

function Router1U({ position }) {
  // Depth = 0.8. Center = 1.5 - 0.4 = 1.1
  return (
    <group position={position}>
      <mesh position={[0, 0, 1.1]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT - 0.02, 0.8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 1.49]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT - 0.02, 0.02]} />
        <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* LAN Ports */}
      <group position={[-0.97, 0, 1.51]}>
        {Array.from({ length: 4 }).map((_, i) => (
          <ClickablePort 
            key={`router-lan-${i}`} 
            position={[i * 0.084, 0, 0]} 
            portId={`router_lan${i+1}`} 
            name={`Router LAN P${i+1}`} 
            label={`L${i + 1}`}
            size={[0.06, 0.06, 0.02]} 
          />
        ))}
      </group>

      {/* WAN Port */}
      <group position={[-0.3, 0, 1.51]}>
        <ClickablePort 
          position={[0, 0, 0]} 
          portId={`router_wan`} 
          name={`Router WAN (Uplink)`} 
          label={`WAN`}
          size={[0.06, 0.06, 0.02]} 
        />
        {/* Make the WAN port visually distinct (Red accent) */}
        <mesh position={[0, -0.04, 0.01]}>
          <boxGeometry args={[0.06, 0.01, 0.01]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Power Port */}
      <group position={[-0.8, 0, 1.51]}>
        <ClickablePort 
          position={[0, 0, 0]} 
          portId={`router_pwr`} 
          name={`Router Power`} 
          label="PWR"
          size={[0.08, 0.06, 0.02]} 
        />
      </group>

      <FloatingLabel text="ROUTER" color="#ef4444" />
    </group>
  )
}

function UPS2U({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT * 2 - 0.02, 2.8]} />
        <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 1.48]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT * 2 - 0.02, 0.04]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Battery Display */}
      <mesh position={[0.6, 0, 1.51]}>
        <boxGeometry args={[0.3, 0.2, 0.02]} />
        <meshStandardMaterial color="#00ffc8" emissive="#00ffc8" emissiveIntensity={0.5} />
      </mesh>

      {/* Power Outlets */}
      <group position={[-0.4, 0, 1.51]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ClickablePort 
            key={`ups-out-${i}`} 
            position={[i * 0.12, 0, 0]} 
            portId={`ups_p${i+1}`} 
            name={`UPS Outlet ${i+1}`} 
            label={`OUT${i+1}`}
            size={[0.08, 0.06, 0.02]} 
          />
        ))}
      </group>

      <FloatingLabel text="UPS" color="#f59e0b" />
    </group>
  )
}

function NAS2U({ position }) {
  const infraCables = useLabStore(s => s.infraCables)
  const addToast = useLabStore(s => s.addToast)
  const [backingUp, setBackingUp] = useState(false)
  const ledsRef = useRef([])
  
  const handleBackup = (e) => {
    e.stopPropagation()
    const hasLan = infraCables.some(c => 
      !c.isFaulty && c.type !== 'power' && 
      ((c.source.id === 'nas_lan' && c.dest.id.startsWith('switch')) || 
       (c.dest.id === 'nas_lan' && c.source.id.startsWith('switch')))
    )
    if (!hasLan) {
      addToast('SAN Backup Failed: No valid data link to Switch!', 'danger')
      return
    }
    setBackingUp(true)
    setTimeout(() => setBackingUp(false), 3000)
    addToast('SAN Backup Initiated. Streaming data...', 'info')
  }

  useFrame((state) => {
    ledsRef.current.forEach((led, i) => {
      if (led) {
        if (backingUp) {
           led.material.emissiveIntensity = Math.random() > 0.2 ? 1 : 0.2
           led.material.color.setHex(0x38bdf8)
           led.material.emissive.setHex(0x38bdf8)
        } else {
           led.material.emissiveIntensity = 0.2
           led.material.color.setHex(0x334155)
           led.material.emissive.setHex(0x334155)
        }
      }
    })
  })

  return (
    <group position={position} onClick={handleBackup}>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT * 2 - 0.02, 2.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 1.48]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT * 2 - 0.02, 0.04]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Drive Bays */}
      <group position={[0.2, 0, 1.51]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh ref={el => ledsRef.current[i] = el} key={`nas-bay-${i}`} position={[(i - 3.5) * 0.15, 0, 0]}>
            <boxGeometry args={[0.12, 0.35, 0.02]} />
            <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* LAN and Power */}
      <group position={[-0.8, -0.1, 1.51]}>
        <ClickablePort position={[0, 0, 0]} portId={`nas_pwr`} name={`NAS Power`} label="PWR" size={[0.08, 0.06, 0.02]} />
        <ClickablePort position={[0.15, 0, 0]} portId={`nas_lan`} name={`NAS LAN`} label="LAN" size={[0.06, 0.06, 0.02]} />
      </group>

      <FloatingLabel text="SAN-STORAGE" color="#38bdf8" />
    </group>
  )
}

function KVM1U({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 1.1]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT - 0.02, 0.8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Folded Drawer Handle */}
      <mesh position={[0, 0, 1.51]}>
        <boxGeometry args={[0.8, 0.05, 0.05]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
      </mesh>
      
      <FloatingLabel text="KVM" color="#94a3b8" offsetX={-0.3} />
    </group>
  )
}

function CableManager1U({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 1.49]}>
        <boxGeometry args={[RACK_W - 0.15, U_HEIGHT - 0.02, 0.05]} />
        <meshStandardMaterial color="#020617" metalness={0.8} roughness={0.5} />
      </mesh>
      {/* Horizontal slot */}
      <mesh position={[0, 0, 1.51]}>
        <boxGeometry args={[RACK_W - 0.3, 0.05, 0.02]} />
        <meshStandardMaterial color="#000" metalness={0.1} roughness={0.9} />
      </mesh>
    </group>
  )
}

function EnvironmentMonitor({ position }) {
  const infraCables = useLabStore(s => s.infraCables)
  const isMobile = useIsMobile()
  
  const activePowerCables = infraCables.filter(c => !c.isFaulty && c.type === 'power' && (c.source.id.startsWith('ups') || c.dest.id.startsWith('ups')))
  const load = activePowerCables.length * 250 // 250W per device
  const activeServers = activePowerCables.filter(c => c.source.id.startsWith('srv') || c.dest.id.startsWith('srv')).length
  const temp = 22 + (activeServers * 2)
  
  const isPowered = load > 0
  const [uptime, setUptime] = useState(0)
  
  useFrame((state, delta) => {
    if (isPowered) setUptime(u => u + delta)
    else setUptime(0)
  })

  const h = Math.floor(uptime / 3600).toString().padStart(2, '0')
  const m = Math.floor((uptime % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(uptime % 60).toString().padStart(2, '0')

  return (
    <group position={position}>
      {/* Hardware Sensor Box */}
      <mesh position={[0, 0, 1.4]}>
        <boxGeometry args={[1.5, 0.4, 0.2]} />
        <meshStandardMaterial color="#020617" metalness={0.8} roughness={0.5} />
      </mesh>
      
      {/* Vertical Neon Connector Line */}
      <mesh position={[0, 1.1, 1.45]}>
        <cylinderGeometry args={[0.01, 0.01, 1.8]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} transparent opacity={0.6} />
      </mesh>

      {/* Floating Tilted HUD */}
      {!isMobile && (
        <group position={[0, 2.0, 1.5]} rotation={[-Math.PI / 12, 0, 0]}>
          <Html transform center style={{
             background: 'rgba(0,0,0,0.8)', border: '1px solid #38bdf8', padding: '6px 12px', 
             color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", fontSize: '6px', whiteSpace: 'nowrap', borderRadius: '4px'
          }}>
            <div style={{ color: '#94a3b8', marginBottom: '2px', fontSize: '4px', letterSpacing: '1px' }}>ENV. MONITOR</div>
            <div style={{ display: 'flex', gap: '12px', fontWeight: 'bold' }}>
              <div>TEMP: <span style={{ color: temp > 25 ? '#f97316' : '#39ff14' }}>{temp}°C</span></div>
              <div>LOAD: <span style={{ color: '#00aaff' }}>{load}W</span></div>
              <div>UPTIME: <span style={{ color: '#e879f9' }}>{h}:{m}:{s}</span></div>
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}

function AdminWorkstation({ position }) {
  const setTerminalOpen = useLabStore(s => s.setTerminalOpen)
  const infraCables = useLabStore(s => s.infraCables)
  
  const activePowerCables = infraCables.filter(c => !c.isFaulty && c.type === 'power' && (c.source.id.startsWith('ups') || c.dest.id.startsWith('ups')))
  const load = activePowerCables.length * 250
  const activeServers = activePowerCables.filter(c => c.source.id.startsWith('srv') || c.dest.id.startsWith('srv')).length
  const temp = 22 + (activeServers * 2)

  return (
    <group position={position}>
      {/* Desk Surface */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[4.0, 0.1, 1.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.8} />
      </mesh>
      
      {/* Desk Legs */}
      <mesh position={[-1.9, 0.5, 0]}><boxGeometry args={[0.1, 1.0, 1.4]} /><meshStandardMaterial color="#0f172a" /></mesh>
      <mesh position={[1.9, 0.5, 0]}><boxGeometry args={[0.1, 1.0, 1.4]} /><meshStandardMaterial color="#0f172a" /></mesh>

      {/* Monitor 1 (Dashboard) */}
      <group position={[-1.2, 1.4, -0.4]} rotation={[0, Math.PI/8, 0]}>
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[1.2, 0.7, 0.05]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <Html position={[0, 0, 0]} transform center style={{ background: '#020617', border: '1px solid #38bdf8', width: '110px', height: '65px', padding: '4px', pointerEvents: 'none' }}>
          <div style={{ color: '#38bdf8', fontSize: '6px', fontFamily: "'Orbitron', sans-serif" }}>DASHBOARD</div>
          <div style={{ color: '#39ff14', fontSize: '5px', marginTop: '4px' }}>TEMP: {temp}°C</div>
          <div style={{ color: '#00aaff', fontSize: '5px', marginTop: '4px' }}>LOAD: {load}W</div>
        </Html>
      </group>

      {/* Monitor 2 (Terminal) */}
      <group position={[1.2, 1.4, -0.4]} rotation={[0, -Math.PI/8, 0]}>
        {/* Screen backing */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[1.2, 0.7, 0.05]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        {/* Screen content */}
        <Html position={[0, 0, 0]} transform center style={{ width: '110px', height: '65px', background: '#000', border: '1px solid #39ff14' }}>
          <div 
            style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            onPointerDown={(e) => { e.stopPropagation(); setTerminalOpen(true); }}
            onClick={(e) => { e.stopPropagation(); setTerminalOpen(true); }}
          >
            <div style={{ color: '#39ff14', fontSize: '4px', fontFamily: "'JetBrains Mono', monospace", padding: '4px' }}>
              root@noc:~# _<br/><br/><span style={{opacity:0.5}}>[CLICK TO OPEN TERMINAL]</span>
            </div>
          </div>
        </Html>
      </group>
      
      {/* PC Tower */}
      <mesh position={[1.6, 0.4, 0]}>
        <boxGeometry args={[0.4, 0.8, 1.0]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
    </group>
  )
}

function ExternalDemarc({ position }) {
  const handleInfraPortClick = useLabStore(s => s.handleInfraPortClick)
  const infraSelectedPort = useLabStore(s => s.infraSelectedPort)
  const isMobile = useIsMobile()
  return (
    <group position={position}>
      {/* Box mounted on wall/floor */}
      <mesh>
        <boxGeometry args={[0.4, 0.4, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.7} />
      </mesh>
      
      {/* Port */}
      <group position={[0, 0, 0.11]}>
        <ClickablePort 
          position={[0, 0, 0]} 
          portId={`external_wan`} 
          name={`External ISP (Web Server)`} 
          label={`ISP`}
          size={[0.08, 0.08, 0.02]} 
        />
      </group>

      {!isMobile ? (
        <Html position={[0, 0.25, 0.1]} transform center style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '6px', color: '#f59e0b', letterSpacing: '1px'
        }}>
          ISP DEMARC
        </Html>
      ) : (
        <Text position={[0, 0.25, 0.12]} fontSize={0.06} color="#f59e0b" anchorX="center" anchorY="middle">
          ISP DEMARC
        </Text>
      )}
    </group>
  )
}

function CurvedCable({ cable }) {
  const [hovered, setHovered] = useState(false)
  const lblRef = useRef()
  const matRef = useRef()
  const packetState = useLabStore(s => s.packetState)
  const currentOsiLayer = useLabStore(s => s.currentOsiLayer)
  const removeCable = useLabStore(s => s.removeInfraCable)
  const isMobile = useIsMobile()

  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...cable.source.pos)
    const v2 = new THREE.Vector3(...cable.dest.pos)
    const midPoint = v1.clone().lerp(v2, 0.5)
    const distance = v1.distanceTo(v2)
    const controlPoint = midPoint.clone().add(new THREE.Vector3(0, 0, distance * 0.4 + 0.5))
    
    return new THREE.QuadraticBezierCurve3(v1, controlPoint, v2)
  }, [cable.source.pos, cable.dest.pos])

  const color = CABLE_TYPES[cable.type] || '#fff'

  useFrame((state) => {
    if (!isMobile && hovered && lblRef.current) {
      lblRef.current.style.transform = `translate3d(0, ${Math.sin(state.clock.elapsedTime * 6) * 5}px, 0)`
    }
    if (matRef.current) {
      const isTransmitting = packetState === 'animating' && currentOsiLayer <= 1
      const isPathCable = cable.source.id.includes('srv1') || cable.dest.id.includes('srv1') || 
                          cable.source.id.includes('switch') || cable.dest.id.includes('switch') ||
                          cable.source.id.includes('router') || cable.dest.id.includes('router') ||
                          cable.source.id.includes('external') || cable.dest.id.includes('external')
      
      if (cable.isFaulty) {
        // Flashing Orange for Faults
        const p = (Math.sin(state.clock.elapsedTime * 15) + 1) / 2
        matRef.current.color.setHex(0xf97316)
        matRef.current.emissive.setHex(0xf97316)
        matRef.current.emissiveIntensity = 0.5 + p * 2.0
      } else if (isTransmitting && isPathCable) {
        // Pulse magenta for data-flow animation
        const p = (Math.sin(state.clock.elapsedTime * 20) + 1) / 2
        matRef.current.color.setHex(0xff00ff)
        matRef.current.emissive.setHex(0xff00ff)
        matRef.current.emissiveIntensity = 1.0 + p * 2.0
      } else {
        // Normal rendering
        matRef.current.color.set(color)
        matRef.current.emissive.set(color)
        matRef.current.emissiveIntensity = (!isMobile && hovered) ? 1.0 : 0.6
      }
    }
  })

  return (
    <group>
      <mesh 
        onPointerOver={!isMobile ? (e) => { e.stopPropagation(); setHovered(true) } : undefined}
        onPointerOut={!isMobile ? () => setHovered(false) : undefined}
        onClick={!isMobile ? (e) => { e.stopPropagation(); removeCable(cable.id) } : undefined}
      >
        <tubeGeometry args={[curve, isMobile ? 12 : 32, 0.012, isMobile ? 4 : 8, false]} />
        <meshStandardMaterial ref={matRef} color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      
      {/* Antigrav floating label */}
      {!isMobile && hovered && (
        <Html position={curve.getPoint(0.5)} center>
          <div ref={lblRef} className="glass-panel" style={{
            padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.8)',
            border: `1px solid ${color}`, whiteSpace: 'nowrap', pointerEvents: 'none',
            boxShadow: `0 0 10px ${color}40`, zIndex: 100
          }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: color, fontWeight: 'bold' }}>
              {cable.type.toUpperCase()} CABLE
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', color: '#cbd5e1', marginTop: '2px' }}>
              From: {cable.source.name} <br/> To: {cable.dest.name}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

function InfraContent() {
  const isMobile = useIsMobile()
  const infraCables = useLabStore(s => s.infraCables)
  const infraSelectedCable = useLabStore(s => s.infraSelectedCable)
  
  useEffect(() => {
    document.body.style.cursor = infraSelectedCable ? 'crosshair' : 'default'
    return () => { document.body.style.cursor = 'default' }
  }, [infraSelectedCable])

  return (
    <>
      {isMobile ? (
        <>
          {/* Lightweight lighting for mobile to save GPU register pressure */}
          <ambientLight intensity={3.5} />
          <directionalLight position={[0, 5, 5]} intensity={3.5} />
          <pointLight position={[0, RACK_H / 2, 4]} intensity={5.0} distance={15} />
        </>
      ) : (
        <>
          {/* Boosted Base Lighting */}
          <ambientLight intensity={2.8} />
          <hemisphereLight skyColor="#ffffff" groundColor="#0f172a" intensity={3.5} />
          
          {/* Main Key Light */}
          <directionalLight position={[5, 10, 8]} intensity={5.0} castShadow />
          <directionalLight position={[-3, 8, 5]} intensity={2.5} />
          
          {/* Front Fill Lights to illuminate the dark rack faces and ports */}
          <pointLight position={[0, 5, 5]} intensity={6.0} color="#ffffff" distance={25} />
          <pointLight position={[0, 2, 5]} intensity={6.0} color="#ffffff" distance={25} />
          <pointLight position={[0, 3.5, 6]} intensity={4.0} color="#ffffff" distance={20} />

          {/* Rack-focused lights — illuminate the front face directly */}
          <pointLight position={[0, 1, 3]} intensity={3.0} color="#e0e8f0" distance={12} />
          <pointLight position={[0, 4.5, 3]} intensity={3.0} color="#e0e8f0" distance={12} />

          {/* Cyberpunk Accent Lights */}
          <pointLight position={[-4, 3, 4]} intensity={3.5} color="#00ffc8" distance={25} />
          <pointLight position={[4, 3, 4]} intensity={3.5} color="#e879f9" distance={25} />
        </>
      )}

      {!isMobile && (
        <Grid 
          position={[0, 0, 0]} 
          args={[30, 30]} 
          cellSize={0.6} 
          cellThickness={1.5} 
          cellColor="#00ffc8" 
          sectionSize={2.4} 
          sectionThickness={2} 
          sectionColor="#00aaff" 
          fadeDistance={25} 
          fadeStrength={1} 
        />
      )}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#020408" metalness={0.8} roughness={0.2} />
      </mesh>

      <ServerRack />

      {/* Environment Monitor at Top */}
      <EnvironmentMonitor position={[0, 0.125 + 21 * U_HEIGHT, 0]} />

      <KVM1U position={[0, 0.125 + 20 * U_HEIGHT, 0]} />
      <Router1U position={[0, 0.125 + 19 * U_HEIGHT, 0]} />
      
      {/* Gap at U18 */}
      <NetworkSwitch1U position={[0, 0.125 + 17 * U_HEIGHT, 0]} />
      
      {/* Cable Manager at U16 */}
      <CableManager1U position={[0, 0.125 + 16 * U_HEIGHT, 0]} />
      
      <PatchPanel1U position={[0, 0.125 + 15 * U_HEIGHT, 0]} />
      
      {/* NAS at U14 and U13 (2U) */}
      <NAS2U position={[0, 0.125 + 13.5 * U_HEIGHT, 0]} />
      
      {/* Servers at U12 and U11 */}
      <Server1U position={[0, 0.125 + 12 * U_HEIGHT, 0]} serverId="srv1" title="SRV-01" color="#00aaff" />
      <Server1U position={[0, 0.125 + 11 * U_HEIGHT, 0]} serverId="srv2" title="SRV-02" color="#e879f9" />

      {/* UPS at U1 and U2 (2U) */}
      <UPS2U position={[0, 0.125 + 1.5 * U_HEIGHT, 0]} />

      {/* External ISP Connection Point on the floor/wall next to the rack */}
      <ExternalDemarc position={[2.0, 0.2, RACK_D/2]} />

      {/* Admin Workstation to the right of the rack */}
      {!isMobile && <AdminWorkstation position={[4.5, 0, RACK_D/2]} />}

      {/* Render Dynamic Cables */}
      {infraCables.map(cable => (
        <CurvedCable key={cable.id} cable={cable} />
      ))}

      {!isMobile && <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={10} blur={2} far={10} />}
      
      <OrbitControls 
        makeDefault 
        target={[0, RACK_H / 2, 0]} 
        minDistance={3} 
        maxDistance={12} 
        maxPolarAngle={Math.PI / 2 + 0.1}
      />
    </>
  )
}

export default function InfraScene() {
  const isMobile = useIsMobile()
  return (
    <div style={{width:'100%',height:'100%',position:'absolute',inset:0}}>
      <Canvas 
        shadows={!isMobile}
        camera={{position:[0, RACK_H / 2, 8],fov: isMobile ? 55 : 45}}
        gl={{
          antialias: !isMobile,
          alpha: false,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        frameloop="always"
        onCreated={({gl})=>gl.setClearColor('#030712')}
      >
        <Suspense fallback={null}>
          <InfraContent />
        </Suspense>
      </Canvas>
    </div>
  )
}
