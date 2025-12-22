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

// Scene content - プラン別に完全に異なるシーン
function SceneContent({ viewMode }) {
  const { customization, planType } = useFuneralStore()
  const { theme, flowerColor, coffinType, flowerVolume } = customization

  // プラン別の設定
  const sceneConfig = useMemo(() => {
    switch (planType) {
      case 'direct':
        // 直葬: 最小限の火葬場控室
        return {
          hallSize: 'small',
          hasAltar: false,
          hasFlowers: false,
          hasWreaths: false,
          hasReligiousItems: false,
          hasPhotoFrame: true,
          seatCount: 4,
          fogDensity: 25,
          ambientIntensity: 0.2,
          description: '火葬場控室',
        }
      case 'family':
        // 家族葬: 小規模で温かみのある式場
        return {
          hallSize: 'medium',
          hasAltar: true,
          altarTiers: 2,
          hasFlowers: true,
          flowerCount: 1500,
          hasWreaths: false,
          hasReligiousItems: true,
          hasPhotoFrame: true,
          seatCount: 20,
          fogDensity: 35,
          ambientIntensity: 0.18,
          description: '家族葬会館',
        }
      case 'general':
      default:
        // 一般葬: 大規模な本格式場
        return {
          hallSize: 'large',
          hasAltar: true,
          altarTiers: 4,
          hasFlowers: true,
          flowerCount: 6000,
          hasWreaths: true,
          wreathCount: 8,
          hasReligiousItems: true,
          hasPhotoFrame: true,
          seatCount: 60,
          fogDensity: 45,
          ambientIntensity: 0.15,
          description: '大型葬儀会館',
        }
    }
  }, [planType])

  return (
    <>
      {/* Lighting - プラン別 */}
      <SceneLighting theme={theme} planType={planType} config={sceneConfig} />

      {/* Environment */}
      <fog attach="fog" args={['#050505', 8, sceneConfig.fogDensity]} />
      <color attach="background" args={['#050505']} />

      {/* Hall Structure - プラン別サイズ */}
      <HallStructure theme={theme} size={sceneConfig.hallSize} planType={planType} />

      {/* Floor */}
      <Floor theme={theme} size={sceneConfig.hallSize} />

      {/* Carpet - 直葬以外 */}
      {planType !== 'direct' && <Carpet size={sceneConfig.hallSize} />}

      {/* ========== 直葬専用シーン ========== */}
      {planType === 'direct' && (
        <DirectCremationScene coffinType={coffinType} />
      )}

      {/* ========== 家族葬・一般葬共通要素 ========== */}
      {planType !== 'direct' && (
        <>
          {/* Altar - 段数がプラン別 */}
          <Altar theme={theme} tiers={sceneConfig.altarTiers} size={sceneConfig.hallSize} />

          {/* Coffin */}
          <Coffin type={coffinType} />

          {/* Photo Frame */}
          <PhotoFrame size={sceneConfig.hallSize} />

          {/* Flowers - プラン別ボリューム */}
          {sceneConfig.hasFlowers && (
            <FlowerArrangement
              color={flowerColor}
              volume={flowerVolume}
              theme={theme}
              count={sceneConfig.flowerCount}
            />
          )}

          {/* Candles */}
          <Candles theme={theme} count={planType === 'family' ? 2 : 4} />

          {/* Incense Burner */}
          <IncenseBurner />

          {/* 宗教用品 */}
          {sceneConfig.hasReligiousItems && (
            <>
              <MemorialTablet position={[0, planType === 'family' ? 1.5 : 2.1, planType === 'family' ? -3.3 : -4.3]} />
              <BuddhistBell position={[-1.2, planType === 'family' ? 0.8 : 1.2, planType === 'family' ? -2.8 : -3.5]} />
              {planType === 'general' && <BuddhistBell position={[1.2, 1.2, -3.5]} />}
              <Offerings position={[planType === 'family' ? -1.8 : -2.5, planType === 'family' ? 0.8 : 1.2, planType === 'family' ? -2.5 : -3.2]} />
              {planType === 'general' && <Offerings position={[2.5, 1.2, -3.2]} />}
              <CandleStick position={[-0.8, planType === 'family' ? 1.2 : 1.7, planType === 'family' ? -3.0 : -3.8]} height={0.25} />
              <CandleStick position={[0.8, planType === 'family' ? 1.2 : 1.7, planType === 'family' ? -3.0 : -3.8]} height={0.25} />
            </>
          )}

          {/* 焼香台 */}
          <IncenseTable position={[0, 0, planType === 'family' ? 2.5 : 3.5]} />

          {/* 花輪スタンド - 一般葬のみ */}
          {sceneConfig.hasWreaths && (
            <WreathArrangement count={sceneConfig.wreathCount} flowerColor={flowerColor} />
          )}

          {/* 菊の花装飾 */}
          <ChrysanthemumArrangement color={flowerColor} theme={theme} count={planType === 'family' ? 15 : 30} />
        </>
      )}

      {/* Seating - プラン別 */}
      <Seating planType={planType} count={sceneConfig.seatCount} />

      {/* Particles - 一般葬のみ */}
      {planType === 'general' && <Particles />}

      {/* God Rays - 一般葬のみ */}
      {planType === 'general' && <GodRays />}

      {/* Contact Shadows */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.5}
        scale={sceneConfig.hallSize === 'large' ? 40 : sceneConfig.hallSize === 'medium' ? 25 : 15}
        blur={2.5}
        far={12}
      />

      {/* Camera Controls */}
      <CameraController viewMode={viewMode} planType={planType} />

      {/* Post Processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.8} intensity={planType === 'direct' ? 0.2 : 0.4} radius={0.8} />
        <Vignette eskil={false} offset={0.1} darkness={planType === 'direct' ? 0.8 : 0.6} />
      </EffectComposer>
    </>
  )
}

// ========== 直葬専用シーン ==========
function DirectCremationScene({ coffinType }) {
  return (
    <group>
      {/* シンプルな棺のみ - 中央に配置 */}
      <group position={[0, 0.2, 0]}>
        <Coffin type={coffinType} />
      </group>

      {/* 簡素な台 */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[2.5, 0.2, 1.2]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
      </mesh>

      {/* 小さな花束（オプション） */}
      <group position={[0.8, 0.35, 0.4]}>
        {[0, 1, 2].map((i) => (
          <Chrysanthemum
            key={i}
            position={[i * 0.08 - 0.08, 0, 0]}
            scale={0.5}
            color="#ffffff"
          />
        ))}
      </group>

      {/* 壁のシンプルな時計 */}
      <mesh position={[0, 2, -2.8]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0, 2, -2.75]}>
        <circleGeometry args={[0.22, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// ========== 花輪配置 ==========
function WreathArrangement({ count, flowerColor }) {
  const positions = useMemo(() => {
    const result = []
    const perSide = Math.floor(count / 2)

    for (let i = 0; i < perSide; i++) {
      // 左側
      result.push({
        position: [-6, 0, -3 + i * 1.8],
        color: i % 2 === 0 ? colorMap[flowerColor] : '#ffffff'
      })
      // 右側
      result.push({
        position: [6, 0, -3 + i * 1.8],
        color: i % 2 === 0 ? '#ffffff' : colorMap[flowerColor]
      })
    }
    return result
  }, [count, flowerColor])

  return (
    <group>
      {positions.map((wreath, i) => (
        <FlowerWreathStand key={i} position={wreath.position} color={wreath.color} />
      ))}
    </group>
  )
}

// Enhanced Lighting - プラン別
function SceneLighting({ theme, planType, config }) {
  const warmColor = theme === 'traditional' ? '#ffddaa' : '#fff0dd'
  const isDirect = planType === 'direct'
  const isFamily = planType === 'family'

  return (
    <>
      {/* Soft ambient */}
      <ambientLight intensity={config?.ambientIntensity || 0.15} color="#ffffff" />

      {/* Main key light from above */}
      <spotLight
        position={[0, isDirect ? 8 : 20, isDirect ? 2 : 5]}
        angle={Math.PI / 5}
        penumbra={0.8}
        intensity={isDirect ? 1.5 : isFamily ? 2.5 : 3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        color={isDirect ? '#ffffff' : warmColor}
      />

      {/* Fill lights from sides - 直葬は控えめ */}
      {!isDirect && (
        <>
          <pointLight position={[isFamily ? -5 : -8, 4, 0]} intensity={isFamily ? 0.3 : 0.5} color="#aaddff" />
          <pointLight position={[isFamily ? 5 : 8, 4, 0]} intensity={isFamily ? 0.3 : 0.5} color="#ffddaa" />
        </>
      )}

      {/* Rim light from back - 直葬以外 */}
      {!isDirect && (
        <spotLight
          position={[0, 8, isFamily ? -5 : -8]}
          angle={Math.PI / 4}
          penumbra={0.5}
          intensity={isFamily ? 1 : 1.5}
          color="#aaddff"
        />
      )}

      {/* Candle-like point lights - 直葬以外 */}
      {!isDirect && (
        <>
          <pointLight position={[isFamily ? -2 : -3, 2, -1.5]} intensity={0.3} color="#ffaa44" distance={5} />
          <pointLight position={[isFamily ? 2 : 3, 2, -1.5]} intensity={0.3} color="#ffaa44" distance={5} />
        </>
      )}

      {/* 直葬用の簡素な蛍光灯風ライト */}
      {isDirect && (
        <>
          <rectAreaLight position={[0, 3, 0]} width={2} height={0.3} intensity={3} color="#f0f0ff" />
        </>
      )}
    </>
  )
}

// Hall Structure (walls, curtains) - プラン別サイズ
function HallStructure({ theme, size, planType }) {
  const isDirect = planType === 'direct'

  // 直葬: シンプルな白い控室
  // 家族葬: 中規模の温かみある式場
  // 一般葬: 大規模な本格式場
  const wallColor = isDirect ? '#e8e8e8' : theme === 'traditional' ? '#1a1a4a' : '#2a2a2a'
  const dimensions = {
    small: { width: 8, depth: 8, height: 4, wallZ: -3 },
    medium: { width: 16, depth: 14, height: 6, wallZ: -5 },
    large: { width: 30, depth: 20, height: 10, wallZ: -6 },
  }
  const dim = dimensions[size] || dimensions.large

  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, dim.height / 2, dim.wallZ]} receiveShadow>
        <planeGeometry args={[dim.width, dim.height]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={isDirect ? 0.3 : 0.9}
        />
      </mesh>

      {/* Side walls */}
      <mesh position={[-dim.width / 2, dim.height / 2, dim.depth / 4]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[dim.depth, dim.height]} />
        <meshStandardMaterial color={wallColor} roughness={isDirect ? 0.3 : 0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[dim.width / 2, dim.height / 2, dim.depth / 4]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[dim.depth, dim.height]} />
        <meshStandardMaterial color={wallColor} roughness={isDirect ? 0.3 : 0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* 直葬: 窓とドア */}
      {isDirect && (
        <>
          {/* 窓 */}
          <mesh position={[2.5, 2, -2.95]}>
            <planeGeometry args={[1.5, 1.2]} />
            <meshBasicMaterial color="#87ceeb" opacity={0.7} transparent />
          </mesh>
          {/* ドア */}
          <mesh position={[-3, 1.2, dim.depth / 4 - 0.1]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.8, 2.4]} />
            <meshStandardMaterial color="#8b7355" roughness={0.5} />
          </mesh>
        </>
      )}

      {/* 一般葬・家族葬: カーテンの垂れ幕 */}
      {!isDirect && (
        <>
          {/* Decorative drapes */}
          <mesh position={[-dim.width / 2 + 0.5, dim.height - 0.5, dim.wallZ + 0.1]}>
            <boxGeometry args={[1, 1, 0.1]} />
            <meshStandardMaterial color={theme === 'traditional' ? '#4a0080' : '#1a1a1a'} />
          </mesh>
          <mesh position={[dim.width / 2 - 0.5, dim.height - 0.5, dim.wallZ + 0.1]}>
            <boxGeometry args={[1, 1, 0.1]} />
            <meshStandardMaterial color={theme === 'traditional' ? '#4a0080' : '#1a1a1a'} />
          </mesh>
        </>
      )}
    </group>
  )
}

// Floor with procedural texture - プラン別
function Floor({ theme, size }) {
  const isDirect = size === 'small'
  const floorColor = isDirect ? '#c4b8a8' : theme === 'traditional' ? '#2a2a2a' : '#1a1a1a'
  const floorSize = size === 'small' ? 12 : size === 'medium' ? 30 : 60

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[floorSize, floorSize]} />
      <meshStandardMaterial
        color={floorColor}
        roughness={isDirect ? 0.6 : 0.1}
        metalness={isDirect ? 0 : 0.1}
        envMapIntensity={0.5}
      />
    </mesh>
  )
}

// Carpet - プラン別
function Carpet({ size }) {
  const carpetLength = size === 'medium' ? 12 : 20
  const carpetWidth = size === 'medium' ? 2 : 3

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, size === 'medium' ? 1 : 2]} receiveShadow>
      <planeGeometry args={[carpetWidth, carpetLength]} />
      <meshStandardMaterial color="#660022" roughness={0.95} />
    </mesh>
  )
}

// Enhanced Altar with multiple tiers - プラン別
function Altar({ theme, tiers = 4, size = 'large' }) {
  const woodColor = theme === 'traditional' ? '#8b6914' : '#4a4a4a'
  const clothColor = theme === 'traditional' ? '#1a1a4a' : '#2a2a2a'
  const goldColor = '#d4af37'

  const isFamily = size === 'medium'
  const scale = isFamily ? 0.65 : 1
  const posZ = isFamily ? -2.5 : -3

  // 祭壇の段数に応じた構成
  const tierConfigs = {
    2: [
      { y: 0.3, z: 0, width: 8, depth: 3, height: 0.5 },
      { y: 0.8, z: -0.3, width: 5, depth: 2, height: 0.4 },
    ],
    4: [
      { y: 0.3, z: 0, width: 14, depth: 5, height: 0.6 },
      { y: 0.9, z: -0.5, width: 12, depth: 4, height: 0.5 },
      { y: 1.4, z: -1, width: 10, depth: 3, height: 0.4 },
      { y: 1.9, z: -1.3, width: 4, depth: 2, height: 0.3 },
    ],
  }

  const tierConfig = tierConfigs[tiers] || tierConfigs[4]
  const pillarX = isFamily ? 3.5 : 6.5

  return (
    <group position={[0, 0, posZ]} scale={[scale, scale, scale]}>
      {/* Altar tiers */}
      {tierConfig.map((tier, i) => (
        <mesh key={i} position={[0, tier.y, tier.z]} castShadow receiveShadow>
          <boxGeometry args={[tier.width, tier.height, tier.depth]} />
          <meshStandardMaterial color={woodColor} roughness={0.4} metalness={0.1} />
        </mesh>
      ))}

      {/* Decorative cloth draping */}
      <mesh position={[0, 0.62, tierConfig[0].depth / 2 - 0.1]} castShadow>
        <boxGeometry args={[tierConfig[0].width + 0.2, 0.02, 0.8]} />
        <meshStandardMaterial color={clothColor} roughness={0.8} />
      </mesh>

      {/* Gold trim */}
      <mesh position={[0, 0.63, tierConfig[0].depth / 2 - 0.05]}>
        <boxGeometry args={[tierConfig[0].width + 0.2, 0.015, 0.1]} />
        <meshStandardMaterial color={goldColor} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Side decorations - 一般葬のみ柱を追加 */}
      {!isFamily && [-pillarX, pillarX].map((x, i) => (
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

      {/* 家族葬: シンプルな花立て */}
      {isFamily && (
        <>
          <mesh position={[-2.5, 0.7, 0.5]} castShadow>
            <cylinderGeometry args={[0.15, 0.1, 0.4, 16]} />
            <meshStandardMaterial color={goldColor} roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[2.5, 0.7, 0.5]} castShadow>
            <cylinderGeometry args={[0.15, 0.1, 0.4, 16]} />
            <meshStandardMaterial color={goldColor} roughness={0.3} metalness={0.7} />
          </mesh>
        </>
      )}
    </group>
  )
}

// Improved Flower Arrangement - プラン別
function FlowerArrangement({ color, volume, theme, count: propCount }) {
  const baseCount = volume === 'minimal' ? 2000 : volume === 'lavish' ? 8000 : 4000
  const count = propCount || baseCount

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
// PhotoFrame - プラン別サイズ
function PhotoFrame({ size = 'large' }) {
  const isFamily = size === 'medium'
  const scale = isFamily ? 0.7 : 1
  const posY = isFamily ? 2.2 : 3.2
  const posZ = isFamily ? -3.2 : -4

  return (
    <Float speed={0.3} rotationIntensity={0} floatIntensity={0.1}>
      <group position={[0, posY, posZ]} scale={[scale, scale, scale]}>
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

        {/* Black ribbon */}
        <mesh position={[0.55, 0.7, 0.1]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.3, 0.04, 0.01]} />
          <meshStandardMaterial color="#000000" roughness={0.9} />
        </mesh>
        <mesh position={[0.65, 0.55, 0.1]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.3, 0.04, 0.01]} />
          <meshStandardMaterial color="#000000" roughness={0.9} />
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

// Candles with animated flames - プラン別
function Candles({ theme, count = 4 }) {
  const candlePositions = useMemo(() => {
    if (count === 2) {
      // 家族葬: 2本のみ
      return [[-2, 0.6, -2], [2, 0.6, -2]]
    }
    // 一般葬: 4本
    return theme === 'traditional'
      ? [[-4, 0.8, -2], [4, 0.8, -2], [-2.5, 1.5, -3], [2.5, 1.5, -3]]
      : [[-3, 0.8, -2], [3, 0.8, -2], [-1.5, 1.3, -2.5], [1.5, 1.3, -2.5]]
  }, [theme, count])

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
// Seating - プラン別
function Seating({ planType, count }) {
  const isDirect = planType === 'direct'
  const isFamily = planType === 'family'

  const chairs = useMemo(() => {
    const result = []

    if (isDirect) {
      // 直葬: 壁際に並べた簡易椅子（パイプ椅子風）
      for (let i = 0; i < (count || 4); i++) {
        result.push({
          position: [-2 + i * 1.2, 0, 2],
          type: 'folding'
        })
      }
    } else if (isFamily) {
      // 家族葬: 2列の椅子、少人数
      const rows = 2
      const cols = Math.ceil((count || 20) / rows / 2)
      for (let r = 0; r < rows; r++) {
        for (let c = -cols / 2; c < cols / 2; c++) {
          if (Math.abs(c + 0.5) < 0.8) continue // 通路
          result.push({
            position: [(c + 0.5) * 1.0, 0, 3.5 + r * 1.1],
            type: 'standard'
          })
        }
      }
    } else {
      // 一般葬: 4列以上、多人数
      const rows = 4
      const cols = Math.ceil((count || 60) / rows / 2)
      for (let r = 0; r < rows; r++) {
        for (let c = -cols / 2; c < cols / 2; c++) {
          if (Math.abs(c + 0.5) < 1) continue // 通路
          result.push({
            position: [(c + 0.5) * 1.2, 0, 5 + r * 1.3],
            type: 'standard'
          })
        }
      }
    }
    return result
  }, [isDirect, isFamily, count])

  return (
    <group>
      {chairs.map((chair, i) => (
        <Chair key={i} position={chair.position} type={chair.type} />
      ))}
    </group>
  )
}

function Chair({ position, type = 'standard' }) {
  // 直葬用パイプ椅子
  if (type === 'folding') {
    return (
      <group position={position}>
        {/* 座面 */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.38, 0.02, 0.35]} />
          <meshStandardMaterial color="#555555" roughness={0.5} />
        </mesh>
        {/* 背もたれ */}
        <mesh position={[0, 0.7, -0.15]} castShadow>
          <boxGeometry args={[0.38, 0.45, 0.02]} />
          <meshStandardMaterial color="#555555" roughness={0.5} />
        </mesh>
        {/* パイプフレーム */}
        {[[-0.15, 0.2], [0.15, 0.2]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.21, z]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.42, 8]} />
            <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.6} />
          </mesh>
        ))}
        {/* 後ろ脚 */}
        {[[-0.15, -0.15], [0.15, -0.15]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.45, z]} rotation={[0.15, 0, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.9, 8]} />
            <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.6} />
          </mesh>
        ))}
      </group>
    )
  }

  // 通常の葬儀用椅子
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

// Camera Controller with smooth transitions - プラン別
function CameraController({ viewMode, planType }) {
  const { camera } = useThree()
  const orbitRef = useRef()
  const targetPos = useRef(new THREE.Vector3())
  const targetLook = useRef(new THREE.Vector3(0, 1.5, -1))

  // プラン別カメラ位置
  const cameraConfigs = {
    direct: {
      orbit: { pos: [0, 3, 6], target: [0, 0.8, 0] },
      firstPerson: { pos: [0, 1.2, 4], look: [0, 0.8, 0] }
    },
    family: {
      orbit: { pos: [0, 4, 8], target: [0, 1.2, -1] },
      firstPerson: { pos: [0, 1.2, 5], look: [0, 1.5, -2] }
    },
    general: {
      orbit: { pos: [0, 6, 12], target: [0, 1.5, -1] },
      firstPerson: { pos: [0, 1.2, 7], look: [0, 2, -2] }
    }
  }

  const config = cameraConfigs[planType] || cameraConfigs.general

  useEffect(() => {
    if (viewMode === 'orbit') {
      targetPos.current.set(...config.orbit.pos)
    } else {
      targetPos.current.set(...config.firstPerson.pos)
      targetLook.current.set(...config.firstPerson.look)
    }
  }, [viewMode, planType, config])

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.03)
    if (viewMode === 'firstPerson') {
      const currentLook = new THREE.Vector3()
      camera.getWorldDirection(currentLook)
      camera.lookAt(targetLook.current)
    }
  })

  const orbitConfig = config.orbit

  return viewMode === 'orbit' ? (
    <OrbitControls
      ref={orbitRef}
      enablePan={false}
      enableZoom={true}
      minDistance={planType === 'direct' ? 4 : planType === 'family' ? 6 : 8}
      maxDistance={planType === 'direct' ? 10 : planType === 'family' ? 14 : 20}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.2}
      target={orbitConfig.target}
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

// Chrysanthemum flower arrangement using procedural flowers - プラン別
function ChrysanthemumArrangement({ color, theme, count = 30 }) {
  const flowerPositions = useMemo(() => {
    const positions = []
    const isFamily = count < 20

    for (let i = 0; i < count; i++) {
      if (theme === 'traditional') {
        // Symmetric arrangement for traditional
        const side = i % 2 === 0 ? -1 : 1
        const x = side * (isFamily ? 1 + Math.random() * 1.5 : 1.5 + Math.random() * 2)
        const y = (isFamily ? 0.9 : 1.3) + Math.random() * (isFamily ? 0.8 : 1.2)
        const z = (isFamily ? -2.8 : -3.5) - Math.random() * (isFamily ? 1 : 1.5)
        positions.push({ position: [x, y, z], scale: (isFamily ? 0.6 : 0.8) + Math.random() * 0.4 })
      } else if (theme === 'modern') {
        // Asymmetric wave pattern
        const x = (Math.random() - 0.5) * (isFamily ? 5 : 8)
        const y = 1 + Math.sin(x * 0.5) * 0.5 + Math.random() * 0.3
        const z = (isFamily ? -2.5 : -3) - Math.random() * (isFamily ? 1.5 : 2)
        positions.push({ position: [x, y, z], scale: 0.6 + Math.random() * 0.5 })
      } else {
        // Nature - organic scatter
        const angle = Math.random() * Math.PI * 2
        const radius = (isFamily ? 1.5 : 2) + Math.random() * (isFamily ? 2 : 3)
        const x = Math.cos(angle) * radius
        const y = 0.8 + Math.random() * 1
        const z = (isFamily ? -2.5 : -3) + Math.sin(angle) * 0.5
        positions.push({ position: [x, y, z], scale: 0.7 + Math.random() * 0.4 })
      }
    }
    return positions
  }, [theme, count])

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
