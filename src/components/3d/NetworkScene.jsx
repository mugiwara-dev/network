import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useLabStore } from '../../store/useLabStore'
import { useIsMobile } from '../../hooks/useIsMobile'

const OSI_LAYERS = [
  { level: 7, name: 'Application', color: '#ff00ff' },
  { level: 6, name: 'Presentation', color: '#bd00ff' },
  { level: 5, name: 'Session', color: '#7b00ff' },
  { level: 4, name: 'Transport', color: '#0055ff' },
  { level: 3, name: 'Network', color: '#00aaff' },
  { level: 2, name: 'Data Link', color: '#00ffc8' },
  { level: 1, name: 'Physical', color: '#10b981' }
]

function NodeBlock({ position, title, icon, color }) {
  const isMobile = useIsMobile()
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 1.2, 0.5]} />
        <meshStandardMaterial color="#0c1018" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.26]}>
        <boxGeometry args={[1.4, 1.1, 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.3} />
      </mesh>
      {!isMobile ? (
        <Html position={[0, 0.2, 0.3]} transform center style={{ color: '#fff', fontSize: '24px' }}>
          {icon}
        </Html>
      ) : (
        <Text position={[0, 0.2, 0.28]} fontSize={0.35} anchorX="center" anchorY="middle">
          {icon}
        </Text>
      )}
      {!isMobile ? (
        <Html position={[0, -0.25, 0.3]} transform center style={{ 
          color: color, fontFamily: "'Orbitron', sans-serif", fontSize: '10px', 
          fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' 
        }}>
          {title}
        </Html>
      ) : (
        <Text 
          position={[0, -0.25, 0.28]} 
          fontSize={0.12} 
          color={color} 
          anchorX="center" 
          anchorY="middle"
        >
          {title}
        </Text>
      )}
    </group>
  )
}

function Cable({ start, end, active }) {
  const points = [start, end]
  return (
    <group>
      <Line points={points} color="#334155" lineWidth={4} />
      {active && (
        <Line points={points} color="#00ffc8" lineWidth={8} transparent opacity={0.8} />
      )}
    </group>
  )
}

function PacketAnimation({ startNode, endNode, onComplete }) {
  const ref = useRef()
  const [progress, setProgress] = useState(0)

  useFrame((_, delta) => {
    if (progress < 1) {
      setProgress(p => Math.min(p + delta * 0.8, 1))
    } else if (progress >= 1 && onComplete) {
      onComplete()
    }
    if (ref.current) {
      ref.current.position.lerpVectors(
        new THREE.Vector3(...startNode),
        new THREE.Vector3(...endNode),
        progress
      )
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color="#00ffc8" emissive="#00ffc8" emissiveIntensity={1} />
      <pointLight color="#00ffc8" intensity={2} distance={3} />
    </mesh>
  )
}

function OsiLayers({ position, currentLayer }) {
  const isMobile = useIsMobile()
  return (
    <group position={position}>
      {OSI_LAYERS.map((layer, idx) => {
        const yPos = (layer.level - 1) * 0.4
        const isActive = currentLayer <= layer.level
        const isCurrent = currentLayer === layer.level
        return (
          <group key={layer.level} position={[0, yPos, 0]}>
            <mesh>
              <boxGeometry args={[2.2, 0.1, 1.2]} />
              <meshStandardMaterial 
                color={isActive ? layer.color : '#1e293b'} 
                emissive={isActive ? layer.color : '#000'}
                emissiveIntensity={isCurrent ? 0.8 : (isActive ? 0.2 : 0)}
                transparent opacity={isActive ? 0.8 : 0.2} 
              />
            </mesh>
            {!isMobile ? (
              <Html position={[1.3, 0, 0]} transform style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
                color: isActive ? layer.color : '#64748b', whiteSpace: 'nowrap',
                textShadow: isCurrent ? `0 0 5px ${layer.color}` : 'none'
              }}>
                L{layer.level} {layer.name}
              </Html>
            ) : (
              <Text 
                position={[1.3, 0, 0.05]} 
                fontSize={0.14} 
                color={isActive ? layer.color : '#64748b'}
                anchorX="left" 
                anchorY="middle"
              >
                L{layer.level} {layer.name}
              </Text>
            )}
          </group>
        )
      })}
    </group>
  )
}

function NetworkContent() {
  // Subscribe only to required state to avoid unrelated re-renders
  const packetState = useLabStore(s => s.packetState)
  const currentOsiLayer = useLabStore(s => s.currentOsiLayer)
  const startPacketAnimation = useLabStore(s => s.startPacketAnimation)
  const [animPhase, setAnimPhase] = useState('idle') // idle, osi, pc_to_router, router_to_cloud
  
  const NODE_PC = [-4, 0, 0]
  const NODE_ROUTER = [0, 0, 0]
  const NODE_CLOUD = [4, 0, 0]

  useEffect(() => {
    if (packetState === 'animating' && currentOsiLayer === 0) {
      setAnimPhase('pc_to_router')
    } else if (packetState === 'animating' && currentOsiLayer > 0) {
      setAnimPhase('osi')
    } else if (packetState === 'done') {
      setAnimPhase('idle')
    } else if (packetState === null) {
      setAnimPhase('idle')
    }
  }, [packetState, currentOsiLayer])

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#00ffc8" />
      
      {/* Nodes */}
      <NodeBlock position={NODE_PC} title="Your PC" icon="💻" color="#00ffc8" />
      <NodeBlock position={NODE_ROUTER} title="Switch / Router" icon="🖧" color="#f59e0b" />
      <NodeBlock position={NODE_CLOUD} title="Web Server" icon="☁️" color="#00aaff" />

      {/* Cables */}
      <Cable start={NODE_PC} end={NODE_ROUTER} active={animPhase === 'pc_to_router'} />
      <Cable start={NODE_ROUTER} end={NODE_CLOUD} active={animPhase === 'router_to_cloud'} />

      {/* OSI Layers above PC */}
      {packetState === 'animating' && animPhase === 'osi' && (
        <OsiLayers position={[-4, 1.2, 0]} currentLayer={currentOsiLayer} />
      )}

      {/* Packet animating down OSI layers */}
      {packetState === 'animating' && animPhase === 'osi' && currentOsiLayer > 0 && (
        <mesh position={[-4, 1.2 + (currentOsiLayer - 1) * 0.4, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1} />
        </mesh>
      )}

      {/* Packet traversing cables */}
      {animPhase === 'pc_to_router' && (
        <PacketAnimation 
          startNode={NODE_PC} 
          endNode={NODE_ROUTER} 
          onComplete={() => setAnimPhase('router_to_cloud')} 
        />
      )}
      {animPhase === 'router_to_cloud' && (
        <PacketAnimation 
          startNode={NODE_ROUTER} 
          endNode={NODE_CLOUD} 
          // Store will set packetState to 'done' soon
        />
      )}

      <OrbitControls makeDefault minDistance={5} maxDistance={20} target={[0, 0, 0]} />
    </>
  )
}

export default function NetworkScene() {
  const isMobile = useIsMobile()
  return (
    <div style={{width:'100%',height:'100%',position:'absolute',inset:0}}>
      <Canvas camera={{position:[0, 3, 10],fov:isMobile ? 55 : 45}}
        gl={{
          antialias: !isMobile,
          alpha: false,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        onCreated={({gl})=>gl.setClearColor('#030712')}>
        <Suspense fallback={null}><NetworkContent/></Suspense>
      </Canvas>
    </div>
  )
}
