import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Map, User, Sun } from 'lucide-react'
import * as THREE from 'three'
import { useFuneralStore } from '../../stores/funeralStore'

// Main FuneralScene wrapper component
export function FuneralScene({ viewMode, setViewMode }) {
  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl group border border-gray-800">
      <Canvas
        shadows
        camera={{ fov: 40, position: [0, 6, 14], near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <SceneContent viewMode={viewMode} />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs border border-white/20 flex items-center gap-2 shadow-xl">
        <Sun size={12} className="text-yellow-400 animate-pulse" />
        {viewMode === 'orbit' ? '全体ビュー' : '参列者ビュー'}
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setViewMode('orbit')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'orbit'
              ? 'bg-teal-600 text-white shadow-lg border border-teal-500'
              : 'bg-gray-900/80 text-gray-400 border border-white/10'
          }`}
        >
          <Map size={14} /> 全体
        </button>
        <button
          onClick={() => setViewMode('firstPerson')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'firstPerson'
              ? 'bg-teal-600 text-white shadow-lg border border-teal-500'
              : 'bg-gray-900/80 text-gray-400 border border-white/10'
          }`}
        >
          <User size={14} /> 参列席
        </button>
      </div>
    </div>
  )
}

// Loading fallback
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#333" wireframe />
    </mesh>
  )
}

// Scene content
function SceneContent({ viewMode }) {
  const { customization, planType } = useFuneralStore()
  const { theme, flowerColor, coffinType, flowerVolume } = customization

  return (
    <>
      {/* Lighting */}
      <SceneLighting />

      {/* Environment */}
      <fog attach="fog" args={['#050505', 10, 50]} />
      <color attach="background" args={['#050505']} />

      {/* Floor */}
      <Floor />

      {/* Carpet */}
      <Carpet />

      {/* Altar */}
      <Altar theme={theme} />

      {/* Flowers */}
      <FlowerArrangement color={flowerColor} volume={flowerVolume} theme={theme} />

      {/* Coffin */}
      <Coffin type={coffinType} />

      {/* Photo Frame */}
      <PhotoFrame />

      {/* Seating */}
      <Seating planType={planType} />

      {/* Particles */}
      <Particles />

      {/* Shadows */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.4}
        scale={30}
        blur={2}
        far={10}
      />

      {/* Camera Controls */}
      <CameraController viewMode={viewMode} />

      {/* Post Processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.9} intensity={0.3} />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
    </>
  )
}

// Lighting setup
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.2} />

      {/* Main spotlight */}
      <spotLight
        position={[5, 15, 10]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={2.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        color="#fff0dd"
      />

      {/* Rim light */}
      <spotLight
        position={[-5, 5, -10]}
        intensity={1.0}
        color="#aaddff"
      />
    </>
  )
}

// Floor component
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.05} metalness={0.1} />
    </mesh>
  )
}

// Carpet component
function Carpet() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[2, 40]} />
      <meshStandardMaterial color="#880000" roughness={0.9} />
    </mesh>
  )
}

// Altar component - will be replaced with GLTF
function Altar({ theme }) {
  const altarColor = theme === 'traditional' ? '#dcb47e' : '#ffffff'

  return (
    <group>
      {/* Tier 1 */}
      <mesh position={[0, 0.4, -2]} castShadow receiveShadow>
        <boxGeometry args={[12, 0.8, 4]} />
        <meshStandardMaterial color={altarColor} roughness={0.6} />
      </mesh>

      {/* Tier 2 */}
      <mesh position={[0, 1.1, -2.5]} castShadow receiveShadow>
        <boxGeometry args={[9, 0.6, 2.5]} />
        <meshStandardMaterial color={altarColor} roughness={0.6} />
      </mesh>
    </group>
  )
}

// Flower Arrangement with instancing
function FlowerArrangement({ color, volume, theme }) {
  const count = volume === 'minimal' ? 3000 : volume === 'lavish' ? 9000 : 5000

  const colorMap = {
    white: '#ffffff',
    pink: '#ffb7c5',
    purple: '#e6e6fa',
    yellow: '#ffffdd',
  }

  const meshRef = useRef()

  const { positions, colors, scales } = useMemo(() => {
    const positions = []
    const colors = []
    const scales = []

    const mainColor = new THREE.Color(colorMap[color])
    const accentColor = new THREE.Color(
      color === 'pink' ? '#ff69b4' : color === 'purple' ? '#9370db' : '#ffffaa'
    )
    const whiteColor = new THREE.Color('#ffffff')
    const greenColor = new THREE.Color('#2e8b57')

    for (let i = 0; i < count; i++) {
      let x, y, z
      let flowerColor

      if (theme === 'traditional') {
        // "Fuji" Mountain Shape
        const u = i / count
        const layer = Math.floor(u * 20)
        const spread = (u * 20) % 1

        x = (spread - 0.5) * 14
        const h = Math.max(0, 2.8 - x * x * 0.08)
        z = -1.0 - layer * 0.15
        y = h * (1 - layer * 0.03) + 0.5 + Math.random() * 0.3

        const band = Math.abs(x) > 2 && Math.abs(x) < 3.5
        flowerColor = band ? mainColor : whiteColor
      } else if (theme === 'modern') {
        // "Flowing River"
        x = (Math.random() - 0.5) * 16
        const curve = Math.sin(x * 0.4)
        z = curve * 1.5 - 2.0 + Math.random() * 0.5
        y = (Math.cos(x * 0.3) + 1) * 1.0 + 0.5 + Math.random() * 0.5
        if (x > 3) y *= 0.7

        const mix = (x + 8) / 16
        flowerColor = whiteColor.clone().lerp(mainColor, mix)
        if (Math.random() > 0.8) flowerColor.lerp(accentColor, 0.5)
      } else {
        // Nature
        const r = Math.random() * 7
        const th = Math.random() * Math.PI * 2
        x = r * Math.cos(th)
        z = r * Math.sin(th) * 0.5 - 2
        y = 0.5 + Math.random() * 0.5 + (Math.random() < 0.1 ? 1.0 : 0)
        flowerColor = Math.random() > 0.6 ? greenColor : mainColor
      }

      positions.push(x, y, z)
      colors.push(flowerColor.r, flowerColor.g, flowerColor.b)
      scales.push(0.6 + Math.random() * 0.8)
    }

    return { positions, colors, scales }
  }, [count, color, theme])

  // Create instanced mesh
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    if (!meshRef.current) return

    for (let i = 0; i < count; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      dummy.rotation.set(Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1)
      dummy.scale.setScalar(scales[i])
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.12, 0]} />
      <meshPhysicalMaterial
        color={colorMap[color]}
        roughness={0.5}
        clearcoat={0.1}
        clearcoatRoughness={0.2}
      />
    </instancedMesh>
  )
}

// Coffin component - will be replaced with GLTF
function Coffin({ type }) {
  const coffinColor = type === 'cloth' ? '#ffffff' : '#5d4037'

  return (
    <mesh position={[0, 0.7, -0.5]} castShadow receiveShadow>
      <boxGeometry args={[2.2, 0.9, 6.5]} />
      <meshStandardMaterial color={coffinColor} roughness={0.4} metalness={0.2} />
    </mesh>
  )
}

// Photo Frame component
function PhotoFrame() {
  return (
    <Float speed={0.5} rotationIntensity={0} floatIntensity={0.2}>
      <group position={[0, 3.8, -2.5]}>
        {/* Frame */}
        <mesh>
          <boxGeometry args={[1.4, 1.8, 0.1]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Photo */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[1.2, 1.6]} />
          <meshBasicMaterial color="#eeeeee" />
        </mesh>
      </group>
    </Float>
  )
}

// Seating component with instancing
function Seating({ planType }) {
  const rows = planType === 'family' ? 2 : 5
  const cols = planType === 'family' ? 4 : 8

  const chairs = useMemo(() => {
    const result = []
    for (let r = 0; r < rows; r++) {
      for (let c = -cols / 2; c < cols / 2; c++) {
        if (c === -0.5 || c === 0) continue // Aisle
        result.push({
          position: [(c + 0.5) * 1.4, 0.25, 4 + r * 1.5],
        })
      }
    }
    return result
  }, [rows, cols])

  return (
    <group>
      {chairs.map((chair, i) => (
        <mesh key={i} position={chair.position} castShadow>
          <boxGeometry args={[0.6, 0.5, 0.6]} />
          <meshStandardMaterial color="#222222" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// Particles component
function Particles() {
  const count = 500
  const particlesRef = useRef()

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Camera Controller
function CameraController({ viewMode }) {
  const orbitRef = useRef()

  useFrame((state) => {
    if (viewMode === 'orbit') {
      state.camera.position.lerp({ x: 0, y: 6, z: 14 }, 0.05)
    } else {
      state.camera.position.lerp({ x: 0, y: 1.1, z: 6 }, 0.05)
    }
    state.camera.lookAt(0, 1.5, 0)
  })

  return viewMode === 'orbit' ? (
    <OrbitControls
      ref={orbitRef}
      enablePan={false}
      enableZoom={true}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2}
      target={[0, 1.5, 0]}
      autoRotate
      autoRotateSpeed={0.5}
    />
  ) : null
}
