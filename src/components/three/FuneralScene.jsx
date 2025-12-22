import { Suspense, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float, useGLTF, Html } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing'
import { Map, User, Sun } from 'lucide-react'
import * as THREE from 'three'
import { useFuneralStore } from '../../stores/funeralStore'
import {
  Chrysanthemum,
  MemorialTablet,
  IncenseHolder,
  BuddhistBell,
  CandleStick,
  Offerings,
  PhotoFrame as ProceduralPhotoFrame,
  FlowerWreathStand,
  IncenseTable,
} from './ProceduralModels'

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

// Loading fallback with spinner
function LoadingFallback() {
  return (
    <Html center>
      <div className="text-white text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
        <div className="text-xs">読み込み中...</div>
      </div>
    </Html>
  )
}

// Color map for flower colors
const colorMap = {
  white: '#ffffff',
  pink: '#ffb7c5',
  purple: '#e6e6fa',
  yellow: '#fffacd',
}

// Scene content
function SceneContent({ viewMode }) {
  const { customization, planType } = useFuneralStore()
  const { theme, flowerColor, coffinType, flowerVolume } = customization

  return (
    <>
      {/* Lighting */}
      <SceneLighting theme={theme} />

      {/* Environment */}
      <fog attach="fog" args={['#050505', 8, 40]} />
      <color attach="background" args={['#050505']} />

      {/* Hall Structure */}
      <HallStructure theme={theme} />

      {/* Floor */}
      <Floor theme={theme} />

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

      {/* Candles */}
      <Candles theme={theme} />

      {/* Incense Burner */}
      <IncenseBurner />

      {/* === 詳細なプロシージャルモデル === */}

      {/* 位牌 (Memorial Tablet) */}
      <MemorialTablet position={[0, 2.1, -4.3]} />

      {/* りん (Buddhist Bell) */}
      <BuddhistBell position={[-1.5, 1.2, -3.5]} />
      <BuddhistBell position={[1.5, 1.2, -3.5]} />

      {/* 供物 (Offerings) */}
      <Offerings position={[-2.5, 1.2, -3.2]} />
      <Offerings position={[2.5, 1.2, -3.2]} />

      {/* 蝋燭 (詳細版) */}
      <CandleStick position={[-1, 1.7, -3.8]} height={0.25} />
      <CandleStick position={[1, 1.7, -3.8]} height={0.25} />

      {/* 線香台 (焼香台) - 参列者用 */}
      <IncenseTable position={[0, 0, 3.5]} />

      {/* 花輪スタンド - 両サイド */}
      <FlowerWreathStand position={[-5.5, 0, -2]} color={colorMap[flowerColor]} />
      <FlowerWreathStand position={[5.5, 0, -2]} color={colorMap[flowerColor]} />
      <FlowerWreathStand position={[-5.5, 0, 0]} color="#ffffff" />
      <FlowerWreathStand position={[5.5, 0, 0]} color="#ffffff" />

      {/* 菊の花 (祭壇装飾) */}
      <ChrysanthemumArrangement color={flowerColor} theme={theme} />

      {/* Seating */}
      <Seating planType={planType} />

      {/* Particles */}
      <Particles />

      {/* God Rays */}
      <GodRays />

      {/* Contact Shadows */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.5}
        scale={40}
        blur={2.5}
        far={12}
      />

      {/* Camera Controls */}
      <CameraController viewMode={viewMode} />

      {/* Post Processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.8} intensity={0.4} radius={0.8} />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>
    </>
  )
}

// Enhanced Lighting
function SceneLighting({ theme }) {
  const warmColor = theme === 'traditional' ? '#ffddaa' : '#fff0dd'

  return (
    <>
      {/* Soft ambient */}
      <ambientLight intensity={0.15} color="#ffffff" />

      {/* Main key light from above */}
      <spotLight
        position={[0, 20, 5]}
        angle={Math.PI / 5}
        penumbra={0.8}
        intensity={3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        color={warmColor}
      />

      {/* Fill lights from sides */}
      <pointLight position={[-8, 4, 0]} intensity={0.5} color="#aaddff" />
      <pointLight position={[8, 4, 0]} intensity={0.5} color="#ffddaa" />

      {/* Rim light from back */}
      <spotLight
        position={[0, 8, -8]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={1.5}
        color="#aaddff"
      />

      {/* Candle-like point lights */}
      <pointLight position={[-3, 2, -1.5]} intensity={0.3} color="#ffaa44" distance={5} />
      <pointLight position={[3, 2, -1.5]} intensity={0.3} color="#ffaa44" distance={5} />
    </>
  )
}

// Hall Structure (walls, curtains)
function HallStructure({ theme }) {
  const curtainColor = theme === 'traditional' ? '#1a1a4a' : '#2a2a2a'

  return (
    <group>
      {/* Back wall/curtain */}
      <mesh position={[0, 5, -6]} receiveShadow>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color={curtainColor} roughness={0.9} />
      </mesh>

      {/* Side curtains */}
      <mesh position={[-12, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color={curtainColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[12, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color={curtainColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// Floor with procedural texture
function Floor({ theme }) {
  const floorColor = theme === 'traditional' ? '#2a2a2a' : '#1a1a1a'

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial
        color={floorColor}
        roughness={0.1}
        metalness={0.1}
        envMapIntensity={0.5}
      />
    </mesh>
  )
}

// Carpet
function Carpet() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2]} receiveShadow>
      <planeGeometry args={[3, 20]} />
      <meshStandardMaterial color="#660022" roughness={0.95} />
    </mesh>
  )
}

// Enhanced Altar with multiple tiers
function Altar({ theme }) {
  const woodColor = theme === 'traditional' ? '#8b6914' : '#4a4a4a'
  const clothColor = theme === 'traditional' ? '#1a1a4a' : '#2a2a2a'
  const goldColor = '#d4af37'

  return (
    <group position={[0, 0, -3]}>
      {/* Main altar base */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[14, 0.6, 5]} />
        <meshStandardMaterial color={woodColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Second tier */}
      <mesh position={[0, 0.9, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[12, 0.5, 4]} />
        <meshStandardMaterial color={woodColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Third tier */}
      <mesh position={[0, 1.4, -1]} castShadow receiveShadow>
        <boxGeometry args={[10, 0.4, 3]} />
        <meshStandardMaterial color={woodColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Top tier for photo */}
      <mesh position={[0, 1.9, -1.3]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.3, 2]} />
        <meshStandardMaterial color={woodColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Decorative cloth draping */}
      <mesh position={[0, 0.62, 2.4]} castShadow>
        <boxGeometry args={[14.2, 0.02, 0.8]} />
        <meshStandardMaterial color={clothColor} roughness={0.8} />
      </mesh>

      {/* Gold trim */}
      <mesh position={[0, 0.63, 2.45]}>
        <boxGeometry args={[14.2, 0.015, 0.1]} />
        <meshStandardMaterial color={goldColor} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Side decorations */}
      {[-6.5, 6.5].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          {/* Pillar */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 3, 16]} />
            <meshStandardMaterial color={woodColor} roughness={0.4} />
          </mesh>
          {/* Pillar top */}
          <mesh position={[0, 3.1, 0]} castShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color={goldColor} roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Improved Flower Arrangement
function FlowerArrangement({ color, volume, theme }) {
  const count = volume === 'minimal' ? 2000 : volume === 'lavish' ? 8000 : 4000

  const meshRef = useRef()
  const initialized = useRef(false)

  const { matrices, instanceColors } = useMemo(() => {
    const matrices = []
    const instanceColors = []

    const mainColor = new THREE.Color(colorMap[color])
    const accentColor = new THREE.Color(
      color === 'pink' ? '#ff69b4' : color === 'purple' ? '#9370db' : '#ffdd44'
    )
    const whiteColor = new THREE.Color('#ffffff')
    const greenColor = new THREE.Color('#228b22')

    const dummy = new THREE.Object3D()

    for (let i = 0; i < count; i++) {
      let x, y, z
      let flowerColor = mainColor.clone()

      if (theme === 'traditional') {
        // Mountain/pyramid shape
        const u = i / count
        const layer = Math.floor(u * 25)
        const spread = (u * 25) % 1

        x = (spread - 0.5) * (14 - layer * 0.4)
        const h = Math.max(0, 3.5 - layer * 0.12)
        z = -3 - layer * 0.08
        y = h + 0.3 + Math.random() * 0.2

        // Color bands
        if (Math.abs(x) > 2 && Math.abs(x) < 4) {
          flowerColor = mainColor.clone()
        } else if (Math.abs(x) < 1.5) {
          flowerColor = accentColor.clone()
        } else {
          flowerColor = whiteColor.clone()
        }
      } else if (theme === 'modern') {
        // Flowing asymmetric wave
        x = (Math.random() - 0.5) * 16
        const wave = Math.sin(x * 0.3) * Math.cos(x * 0.1)
        z = wave * 2 - 3 + Math.random() * 0.3
        y = Math.abs(Math.cos(x * 0.2)) * 2 + 0.5 + Math.random() * 0.4

        // Gradient coloring
        const t = (x + 8) / 16
        flowerColor = whiteColor.clone().lerp(mainColor, t)
        if (Math.random() > 0.85) flowerColor.lerp(accentColor, 0.7)
      } else {
        // Nature - organic scatter with greenery
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * 6 + 1
        x = Math.cos(angle) * radius
        z = Math.sin(angle) * 0.4 * radius - 3
        y = 0.5 + Math.random() * 1.5 * (1 - radius / 7)

        if (Math.random() > 0.5) {
          flowerColor = greenColor.clone()
        } else {
          flowerColor = mainColor.clone()
          if (Math.random() > 0.7) flowerColor.lerp(whiteColor, 0.5)
        }
      }

      dummy.position.set(x, y, z)
      dummy.rotation.set(
        Math.random() * Math.PI * 0.3,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 0.3
      )
      const scale = 0.4 + Math.random() * 0.6
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()

      matrices.push(dummy.matrix.clone())
      instanceColors.push(flowerColor.r, flowerColor.g, flowerColor.b)
    }

    return { matrices, instanceColors }
  }, [count, color, theme])

  useEffect(() => {
    if (!meshRef.current || initialized.current) return

    const colorArray = new Float32Array(instanceColors)
    meshRef.current.geometry.setAttribute(
      'color',
      new THREE.InstancedBufferAttribute(colorArray, 3)
    )

    for (let i = 0; i < count; i++) {
      meshRef.current.setMatrixAt(i, matrices[i])
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    initialized.current = true
  }, [matrices, instanceColors, count])

  // Custom petal-like geometry
  const petalGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.1, 0)
    geo.scale(1, 0.4, 1)
    return geo
  }, [])

  return (
    <instancedMesh
      ref={meshRef}
      args={[petalGeometry, null, count]}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial
        vertexColors
        roughness={0.6}
        clearcoat={0.2}
        clearcoatRoughness={0.3}
      />
    </instancedMesh>
  )
}

// Hexagonal Coffin
function Coffin({ type }) {
  const coffinColor = type === 'cloth' ? '#f5f5f5' : type === 'luxury' ? '#2c1810' : '#5d4037'
  const handleColor = type === 'luxury' ? '#d4af37' : '#888888'

  // Create hexagonal coffin shape
  const coffinShape = useMemo(() => {
    const shape = new THREE.Shape()
    // Coffin-like hexagonal shape
    shape.moveTo(-0.8, 0)
    shape.lineTo(-1, 0.4)
    shape.lineTo(-0.6, 0.6)
    shape.lineTo(0.6, 0.6)
    shape.lineTo(1, 0.4)
    shape.lineTo(0.8, 0)
    shape.lineTo(-0.8, 0)
    return shape
  }, [])

  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: 2,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  }), [])

  return (
    <group position={[0, 0.3, 1]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Main coffin body */}
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[coffinShape, extrudeSettings]} />
        <meshStandardMaterial
          color={coffinColor}
          roughness={type === 'cloth' ? 0.9 : 0.3}
          metalness={type === 'luxury' ? 0.2 : 0}
        />
      </mesh>

      {/* Handles */}
      {[-0.95, 0.95].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.3, 0.5]} castShadow>
            <boxGeometry args={[0.05, 0.15, 0.3]} />
            <meshStandardMaterial color={handleColor} roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[x, 0.3, 1.5]} castShadow>
            <boxGeometry args={[0.05, 0.15, 0.3]} />
            <meshStandardMaterial color={handleColor} roughness={0.3} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Decorative cross or flower for lid */}
      {type === 'cloth' && (
        <mesh position={[0, 0.62, 1]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.02, 8, 24]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
        </mesh>
      )}
    </group>
  )
}

// Photo Frame with elegant design
function PhotoFrame() {
  return (
    <Float speed={0.3} rotationIntensity={0} floatIntensity={0.1}>
      <group position={[0, 3.2, -4]}>
        {/* Outer frame */}
        <mesh castShadow>
          <boxGeometry args={[1.6, 2.0, 0.15]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Inner gold trim */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[1.4, 1.8, 0.05]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Photo area (white placeholder) */}
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[1.2, 1.6]} />
          <meshBasicMaterial color="#e8e8e8" />
        </mesh>

        {/* Subtle glow behind frame */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[2, 2.4]} />
          <meshBasicMaterial color="#ffdd88" transparent opacity={0.1} />
        </mesh>
      </group>
    </Float>
  )
}

// Candles with animated flames
function Candles({ theme }) {
  const candlePositions = theme === 'traditional'
    ? [[-4, 0.8, -2], [4, 0.8, -2], [-2.5, 1.5, -3], [2.5, 1.5, -3]]
    : [[-3, 0.8, -2], [3, 0.8, -2]]

  return (
    <group>
      {candlePositions.map((pos, i) => (
        <Candle key={i} position={pos} />
      ))}
    </group>
  )
}

function Candle({ position }) {
  const flameRef = useRef()

  useFrame((state) => {
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10 + position[0]) * 0.1
      flameRef.current.scale.x = 1 + Math.cos(state.clock.elapsedTime * 8 + position[1]) * 0.05
    }
  })

  return (
    <group position={position}>
      {/* Candle holder */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.15, 16]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Candle body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.4, 12]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.8} />
      </mesh>

      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.5, 0]}>
        <coneGeometry args={[0.03, 0.1, 8]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.9} />
      </mesh>

      {/* Flame glow */}
      <pointLight position={[0, 0.5, 0]} intensity={0.2} color="#ff6600" distance={2} />
    </group>
  )
}

// Incense Burner
function IncenseBurner() {
  const smokeRef = useRef()

  useFrame((state) => {
    if (smokeRef.current) {
      smokeRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <group position={[0, 0.7, 0.5]}>
      {/* Burner base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.1, 24]} />
        <meshStandardMaterial color="#2c1810" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Burner bowl */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.15, 0.15, 24]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Incense ash */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 24]} />
        <meshStandardMaterial color="#888888" roughness={0.9} />
      </mesh>

      {/* Smoke particles (simple representation) */}
      <group ref={smokeRef} position={[0, 0.3, 0]}>
        {[0, 0.15, 0.3, 0.45].map((y, i) => (
          <mesh key={i} position={[Math.sin(i) * 0.02, y, Math.cos(i) * 0.02]}>
            <sphereGeometry args={[0.02 + i * 0.01, 8, 8]} />
            <meshBasicMaterial color="#cccccc" transparent opacity={0.3 - i * 0.06} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// Improved Seating with chair shapes
function Seating({ planType }) {
  const rows = planType === 'family' ? 2 : 4
  const cols = planType === 'family' ? 6 : 10

  const chairs = useMemo(() => {
    const result = []
    for (let r = 0; r < rows; r++) {
      for (let c = -cols / 2; c < cols / 2; c++) {
        if (Math.abs(c + 0.5) < 1) continue // Aisle
        result.push({
          position: [(c + 0.5) * 1.2, 0, 5 + r * 1.3],
        })
      }
    }
    return result
  }, [rows, cols])

  return (
    <group>
      {chairs.map((chair, i) => (
        <Chair key={i} position={chair.position} />
      ))}
    </group>
  )
}

function Chair({ position }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.45, 0.05, 0.45]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Backrest */}
      <mesh position={[0, 0.75, -0.2]} castShadow>
        <boxGeometry args={[0.45, 0.55, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Legs */}
      {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
          <meshStandardMaterial color="#333333" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// Atmospheric Particles
function Particles() {
  const count = 600
  const particlesRef = useRef()

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25
      pos[i * 3 + 1] = Math.random() * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25
    }
    return pos
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
      // Subtle vertical float
      const positions = particlesRef.current.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
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
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

// Volumetric God Rays
function GodRays() {
  const rayRef = useRef()

  useFrame((state) => {
    if (rayRef.current) {
      rayRef.current.material.opacity = 0.02 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01
    }
  })

  return (
    <mesh ref={rayRef} position={[0, 10, -2]} rotation={[0.3, 0, 0]}>
      <coneGeometry args={[8, 20, 32, 1, true]} />
      <meshBasicMaterial
        color="#fff8dd"
        transparent
        opacity={0.025}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// Camera Controller with smooth transitions
function CameraController({ viewMode }) {
  const { camera } = useThree()
  const orbitRef = useRef()
  const targetPos = useRef(new THREE.Vector3())
  const targetLook = useRef(new THREE.Vector3(0, 1.5, -1))

  useEffect(() => {
    if (viewMode === 'orbit') {
      targetPos.current.set(0, 6, 12)
    } else {
      targetPos.current.set(0, 1.2, 7)
      targetLook.current.set(0, 2, -2)
    }
  }, [viewMode])

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.03)
    if (viewMode === 'firstPerson') {
      const currentLook = new THREE.Vector3()
      camera.getWorldDirection(currentLook)
      camera.lookAt(targetLook.current)
    }
  })

  return viewMode === 'orbit' ? (
    <OrbitControls
      ref={orbitRef}
      enablePan={false}
      enableZoom={true}
      minDistance={8}
      maxDistance={20}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.2}
      target={[0, 1.5, -1]}
      autoRotate
      autoRotateSpeed={0.3}
    />
  ) : null
}

// GLTF Model Loader utility (for future use)
export function useOptionalGLTF(path) {
  try {
    return useGLTF(path)
  } catch (e) {
    console.warn(`GLTF model not found: ${path}`)
    return null
  }
}

// Chrysanthemum flower arrangement using procedural flowers
function ChrysanthemumArrangement({ color, theme }) {
  const flowerPositions = useMemo(() => {
    const positions = []
    const count = 30

    for (let i = 0; i < count; i++) {
      if (theme === 'traditional') {
        // Symmetric arrangement for traditional
        const side = i % 2 === 0 ? -1 : 1
        const x = side * (1.5 + Math.random() * 2)
        const y = 1.3 + Math.random() * 1.2
        const z = -3.5 - Math.random() * 1.5
        positions.push({ position: [x, y, z], scale: 0.8 + Math.random() * 0.4 })
      } else if (theme === 'modern') {
        // Asymmetric wave pattern
        const x = (Math.random() - 0.5) * 8
        const y = 1 + Math.sin(x * 0.5) * 0.5 + Math.random() * 0.3
        const z = -3 - Math.random() * 2
        positions.push({ position: [x, y, z], scale: 0.6 + Math.random() * 0.5 })
      } else {
        // Nature - organic scatter
        const angle = Math.random() * Math.PI * 2
        const radius = 2 + Math.random() * 3
        const x = Math.cos(angle) * radius
        const y = 0.8 + Math.random() * 1
        const z = -3 + Math.sin(angle) * 0.5
        positions.push({ position: [x, y, z], scale: 0.7 + Math.random() * 0.4 })
      }
    }
    return positions
  }, [theme])

  return (
    <group>
      {flowerPositions.map((flower, i) => (
        <Chrysanthemum
          key={i}
          position={flower.position}
          scale={flower.scale}
          color={colorMap[color]}
        />
      ))}
    </group>
  )
}
