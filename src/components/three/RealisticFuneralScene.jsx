/**
 * リアルな葬儀シミュレーション
 * 実際の葬儀場の写真・資料を参考に構築
 */

import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useFuneralStore } from '../../stores/funeralStore'
import { Map, User, Smartphone, Monitor } from 'lucide-react'
import { useDevicePerformance } from '../../hooks/useDevicePerformance'

// カラーマップ
const flowerColors = {
  white: { main: '#ffffff', accent: '#f0f0f0' },
  pink: { main: '#ffb7c5', accent: '#ff91a4' },
  purple: { main: '#d8bfd8', accent: '#dda0dd' },
  yellow: { main: '#fffacd', accent: '#ffd700' },
}

// ========== メインコンポーネント ==========
export function RealisticFuneralScene({ viewMode, setViewMode }) {
  const { tier, isMobile, settings } = useDevicePerformance()

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
      <Canvas
        shadows={!isMobile}
        camera={{ fov: 45, position: [0, 2.5, 8], near: 0.1, far: 100 }}
        dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
        gl={{
          antialias: !isMobile,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <FuneralHall isMobile={isMobile} />
          <CameraControls viewMode={viewMode} />
        </Suspense>
      </Canvas>

      {/* UI */}
      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
        {isMobile ? <Smartphone size={12} /> : <Monitor size={12} />}
        {viewMode === 'orbit' ? '全体ビュー' : '参列者視点'}
      </div>

      <div className="absolute bottom-3 right-3 flex gap-2">
        {['orbit', 'firstPerson'].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === mode
                ? 'bg-teal-600 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-black/70'
            }`}
          >
            {mode === 'orbit' ? <Map size={12} /> : <User size={12} />}
            {mode === 'orbit' ? '全体' : '参列席'}
          </button>
        ))}
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <Html center>
      <div className="text-white text-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <div className="text-sm">式場を準備中...</div>
      </div>
    </Html>
  )
}

// ========== 葬儀ホール全体 ==========
function FuneralHall({ isMobile }) {
  const { planType, customization } = useFuneralStore()
  const { theme, flowerColor, coffinType, flowerVolume } = customization

  // プラン別設定
  const config = useMemo(() => {
    // 花のボリューム係数
    const volumeMultiplier = flowerVolume === 'minimal' ? 0.5 : flowerVolume === 'lavish' ? 1.5 : 1

    switch (planType) {
      case 'direct':
        return {
          hallWidth: 6,
          hallDepth: 5,
          hallHeight: 3,
          hasAltar: false,
          seatRows: 1,
          seatsPerRow: 4,
          altarWidth: 0,
          flowerDensity: 0,
        }
      case 'family':
        return {
          hallWidth: 10,
          hallDepth: 8,
          hallHeight: 4,
          hasAltar: true,
          altarWidth: 2.5,
          altarHeight: 2,
          seatRows: 2,
          seatsPerRow: 6,
          flowerDensity: 0.7 * volumeMultiplier,
        }
      default: // general
        return {
          hallWidth: 14,
          hallDepth: 12,
          hallHeight: 5,
          hasAltar: true,
          altarWidth: 4,
          altarHeight: 2.8,
          seatRows: 4,
          seatsPerRow: 8,
          flowerDensity: 1.0 * volumeMultiplier,
        }
    }
  }, [planType, flowerVolume])

  const colors = flowerColors[flowerColor] || flowerColors.white

  return (
    <group>
      {/* 照明 */}
      <HallLighting config={config} planType={planType} theme={theme} />

      {/* 会場構造 */}
      <HallStructure config={config} planType={planType} theme={theme} />

      {/* 床 */}
      <Floor config={config} planType={planType} theme={theme} />

      {/* 祭壇エリア */}
      {config.hasAltar && (
        <group position={[0, 0, -config.hallDepth / 2 + 1.5]}>
          {/* 生花祭壇 */}
          <FlowerAltar
            width={config.altarWidth}
            height={config.altarHeight}
            color={colors}
            theme={theme}
            flowerDensity={config.flowerDensity}
            isMobile={isMobile}
          />

          {/* 遺影 */}
          <Portrait position={[0, config.altarHeight - 0.3, 0.3]} />

          {/* 棺 */}
          <Coffin
            position={[0, 0.4, 1.5]}
            type={coffinType}
          />

          {/* 焼香台 */}
          <IncenseStand position={[0, 0, 2.5]} />
        </group>
      )}

      {/* 直葬シーン */}
      {planType === 'direct' && (
        <DirectFuneralScene coffinType={coffinType} />
      )}

      {/* 椅子配置 */}
      <SeatingArea config={config} planType={planType} />

      {/* 受付（一般葬・家族葬） */}
      {planType !== 'direct' && (
        <ReceptionArea
          position={[config.hallWidth / 2 - 1.5, 0, config.hallDepth / 2 - 1]}
        />
      )}

      {/* 供花スタンド（一般葬のみ） */}
      {planType === 'general' && (
        <FlowerStands color={colors} />
      )}
    </group>
  )
}

// ========== 照明 ==========
function HallLighting({ config, planType, theme }) {
  const isDirect = planType === 'direct'

  // テーマ別の照明色
  const lightColors = useMemo(() => {
    switch (theme) {
      case 'traditional':
        return {
          ambient: '#fff5e0', // 暖かみのある光
          main: '#fff8f0',
          spot: '#fffae0', // 金色っぽい
          accent: '#ffe8d0',
        }
      case 'modern':
        return {
          ambient: '#f0f0ff', // クールな白
          main: '#ffffff',
          spot: '#ffffff',
          accent: '#e8e8ff',
        }
      case 'nature':
      default:
        return {
          ambient: '#f5fff0', // 自然光
          main: '#fffff0',
          spot: '#fffaf5',
          accent: '#f0ffe8',
        }
    }
  }, [theme])

  return (
    <>
      {/* 環境光 - テーマで色が変わる */}
      <ambientLight intensity={isDirect ? 0.7 : 0.5} color={lightColors.ambient} />

      {/* メイン天井照明 */}
      <directionalLight
        position={[0, config.hallHeight, 2]}
        intensity={isDirect ? 1.5 : 2}
        color={lightColors.main}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* 祭壇を照らすスポット */}
      {!isDirect && (
        <>
          <spotLight
            position={[0, config.hallHeight - 1, -config.hallDepth / 2 + 3]}
            angle={Math.PI / 4}
            penumbra={0.5}
            intensity={3}
            color={lightColors.spot}
            target-position={[0, 1.5, -config.hallDepth / 2 + 1.5]}
          />
          {/* 遺影用スポット */}
          <spotLight
            position={[0, config.hallHeight - 0.5, -config.hallDepth / 2 + 2]}
            angle={Math.PI / 6}
            penumbra={0.3}
            intensity={2}
            color={lightColors.main}
          />
        </>
      )}

      {/* 補助光 */}
      <pointLight position={[-config.hallWidth / 3, 2, 0]} intensity={0.5} color={lightColors.accent} />
      <pointLight position={[config.hallWidth / 3, 2, 0]} intensity={0.5} color={lightColors.accent} />
    </>
  )
}

// ========== 会場構造 ==========
function HallStructure({ config, planType, theme }) {
  const { hallWidth, hallDepth, hallHeight } = config
  const isDirect = planType === 'direct'

  // テーマ別の色設定
  const themeColors = useMemo(() => {
    switch (theme) {
      case 'traditional':
        return {
          wall: '#f5efe8',
          backWall: '#2a1a3a', // 深紫
          curtain: '#1a1a4a', // 紺
          trim: '#d4af37', // 金
        }
      case 'modern':
        return {
          wall: '#f0f0f0',
          backWall: '#1a1a1a', // 黒
          curtain: '#2a2a2a', // ダークグレー
          trim: '#c0c0c0', // シルバー
        }
      case 'nature':
      default:
        return {
          wall: '#f8f4f0',
          backWall: '#1a2a1a', // 深緑
          curtain: '#2d4a2d', // 緑
          trim: '#a08060', // ブロンズ
        }
    }
  }, [theme])

  // 壁の色
  const wallColor = isDirect ? '#f5f5f5' : themeColors.wall
  const backWallColor = isDirect ? '#e8e8e8' : themeColors.backWall

  return (
    <group>
      {/* 背面壁 - 祭壇側は濃い色 */}
      <mesh position={[0, hallHeight / 2, -hallDepth / 2]} receiveShadow>
        <planeGeometry args={[hallWidth, hallHeight]} />
        <meshStandardMaterial color={backWallColor} />
      </mesh>

      {/* 左右の壁 */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * hallWidth / 2, hallHeight / 2, 0]}
          rotation={[0, -side * Math.PI / 2, 0]}
          receiveShadow
        >
          <planeGeometry args={[hallDepth, hallHeight]} />
          <meshStandardMaterial color={wallColor} />
        </mesh>
      ))}

      {/* 天井 */}
      <mesh position={[0, hallHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[hallWidth, hallDepth]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 祭壇背景の幕（一般葬・家族葬）- テーマで色が変わる */}
      {!isDirect && (
        <group position={[0, hallHeight / 2, -hallDepth / 2 + 0.1]}>
          {/* 幕 */}
          <mesh>
            <planeGeometry args={[hallWidth * 0.7, hallHeight * 0.85]} />
            <meshStandardMaterial color={themeColors.curtain} />
          </mesh>
          {/* 縁取り */}
          <mesh position={[0, hallHeight * 0.85 / 2 - 0.05, 0.01]}>
            <planeGeometry args={[hallWidth * 0.72, 0.08]} />
            <meshStandardMaterial color={themeColors.trim} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  )
}

// ========== 床 ==========
function Floor({ config, planType, theme }) {
  const { hallWidth, hallDepth } = config
  const isDirect = planType === 'direct'

  // テーマ別のカーペット色
  const carpetColor = useMemo(() => {
    switch (theme) {
      case 'traditional':
        return '#6b0000' // 深い赤（伝統的）
      case 'modern':
        return '#1a1a1a' // 黒（モダン）
      case 'nature':
      default:
        return '#2d4a2d' // 深緑（ナチュラル）
    }
  }, [theme])

  // テーマ別の床色
  const floorColor = useMemo(() => {
    switch (theme) {
      case 'traditional':
        return '#5a4a3a' // 濃い木目
      case 'modern':
        return '#3a3a3a' // ダークグレー
      case 'nature':
      default:
        return '#4a3c32' // ナチュラルブラウン
    }
  }, [theme])

  return (
    <group>
      {/* メイン床 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[hallWidth, hallDepth]} />
        <meshStandardMaterial
          color={isDirect ? '#c0b0a0' : floorColor}
          roughness={0.8}
        />
      </mesh>

      {/* カーペット（一般葬・家族葬）- テーマで色が変わる */}
      {!isDirect && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1]}>
          <planeGeometry args={[2, hallDepth - 2]} />
          <meshStandardMaterial color={carpetColor} roughness={0.9} />
        </mesh>
      )}
    </group>
  )
}

// ========== 生花祭壇（リアル版） ==========
function FlowerAltar({ width, height, color, theme, flowerDensity = 1, isMobile }) {
  // テーマ別の祭壇スタイル
  const altarStyle = useMemo(() => {
    switch (theme) {
      case 'traditional':
        return {
          woodColor: '#d4a574', // 明るい木目
          trimColor: '#d4af37', // 金
          clothColor: '#1a1a4a', // 紺
          flowerRatio: 0.3, // 白菊多め
        }
      case 'modern':
        return {
          woodColor: '#2a2a2a', // ダークグレー
          trimColor: '#c0c0c0', // シルバー
          clothColor: '#1a1a1a', // 黒
          flowerRatio: 0.8, // カラー花多め
        }
      case 'nature':
      default:
        return {
          woodColor: '#8b7355', // ナチュラルウッド
          trimColor: '#a08060', // ブロンズ
          clothColor: '#2d4a2d', // 深緑
          flowerRatio: 0.6, // バランス
        }
    }
  }, [theme])

  // 花の塊を生成 - flowerDensityで密度を調整
  const flowerClusters = useMemo(() => {
    const clusters = []
    const baseRows = Math.floor(height / 0.4)
    const baseCols = Math.floor(width / 0.35)
    const rows = Math.max(2, Math.floor(baseRows * flowerDensity))
    const cols = Math.max(3, Math.floor(baseCols * flowerDensity))

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col - cols / 2 + 0.5) * (width / cols) + (Math.random() - 0.5) * 0.1
        const y = row * (height / rows) + 0.3 + (Math.random() - 0.5) * 0.1
        const z = -row * 0.12 + (Math.random() - 0.5) * 0.05

        // 中央付近は遺影用に空ける
        const distFromCenter = Math.sqrt(x * x + (y - height * 0.7) ** 2)
        if (distFromCenter < 0.4) continue

        // flowerRatioでカラー花の割合を決定
        const isMainColor = Math.random() < altarStyle.flowerRatio
        const isGreen = Math.random() > 0.9

        clusters.push({
          position: [x, y, z],
          scale: (0.1 + Math.random() * 0.08) * (flowerDensity > 1 ? 1.2 : 1),
          isMainColor,
          isGreen,
        })
      }
    }
    return clusters
  }, [width, height, flowerDensity, altarStyle.flowerRatio])

  return (
    <group>
      {/* 祭壇の段 - テーマで色が変わる */}
      {[0, 0.5, 1.0].map((y, i) => (
        <mesh key={i} position={[0, y + 0.15, -i * 0.2]} castShadow receiveShadow>
          <boxGeometry args={[width - i * 0.3, 0.3, 0.8 - i * 0.1]} />
          <meshStandardMaterial color={altarStyle.woodColor} roughness={0.5} />
        </mesh>
      ))}

      {/* 祭壇の布（テーマで色が変わる） */}
      <mesh position={[0, 0.32, 0.38]}>
        <boxGeometry args={[width + 0.05, 0.25, 0.02]} />
        <meshStandardMaterial color={altarStyle.clothColor} roughness={0.8} />
      </mesh>

      {/* 花の塊 - カラーがはっきり反映される */}
      {flowerClusters.map((cluster, i) => (
        <FlowerCluster
          key={i}
          position={cluster.position}
          scale={cluster.scale}
          color={cluster.isGreen ? '#228b22' : cluster.isMainColor ? color.main : '#ffffff'}
          isMobile={isMobile}
        />
      ))}

      {/* 祭壇装飾（テーマで色が変わる） */}
      <mesh position={[0, 0.32, 0.4]}>
        <boxGeometry args={[width + 0.1, 0.05, 0.05]} />
        <meshStandardMaterial color={altarStyle.trimColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 豪華版（flowerDensity > 1）の場合、サイド花を追加 */}
      {flowerDensity > 1 && (
        <>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * (width / 2 + 0.3), 0.5, 0]}>
              {[0, 1, 2].map((i) => (
                <mesh key={i} position={[0, i * 0.3, 0]}>
                  <icosahedronGeometry args={[0.15, 1]} />
                  <meshStandardMaterial color={i % 2 === 0 ? color.main : '#ffffff'} roughness={0.7} />
                </mesh>
              ))}
            </group>
          ))}
        </>
      )}
    </group>
  )
}

// 花の塊（単体の花ではなく塊として表現）
function FlowerCluster({ position, scale, color, isMobile }) {
  const segments = isMobile ? 6 : 10

  return (
    <group position={position}>
      {/* メインの花塊 */}
      <mesh>
        <icosahedronGeometry args={[scale, isMobile ? 0 : 1]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* 周囲の小さな花 */}
      {!isMobile && [0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2
        const r = scale * 0.6
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
            <icosahedronGeometry args={[scale * 0.5, 0]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

// ========== 遺影 ==========
function Portrait({ position }) {
  return (
    <group position={position}>
      {/* 額縁 */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* 金の内枠 */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.55, 0.75, 0.02]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* 写真エリア */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[0.45, 0.65]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      {/* 黒いリボン */}
      <mesh position={[0.22, 0.32, 0.06]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.2, 0.03, 0.01]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.28, 0.22, 0.06]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.2, 0.03, 0.01]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  )
}

// ========== 棺 ==========
function Coffin({ position, type }) {
  const colors = {
    standard: { body: '#8b7355', trim: '#a08060' },
    cloth: { body: '#f8f8f8', trim: '#e8e8e8' },
    luxury: { body: '#3d2817', trim: '#d4af37' },
  }
  const c = colors[type] || colors.standard

  return (
    <group position={position}>
      {/* 棺本体 */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.4, 1.8]} />
        <meshStandardMaterial color={c.body} roughness={type === 'cloth' ? 0.9 : 0.4} />
      </mesh>
      {/* 蓋 */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.72, 0.05, 1.82]} />
        <meshStandardMaterial color={c.body} roughness={type === 'cloth' ? 0.9 : 0.4} />
      </mesh>
      {/* 装飾ライン */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.74, 0.02, 0.1]} />
        <meshStandardMaterial color={c.trim} metalness={type === 'luxury' ? 0.7 : 0} roughness={0.3} />
      </mesh>
      {/* ハンドル */}
      {[-0.38, 0.38].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.1, 0.5]}>
            <boxGeometry args={[0.04, 0.08, 0.15]} />
            <meshStandardMaterial color={type === 'luxury' ? '#d4af37' : '#888888'} metalness={0.6} />
          </mesh>
          <mesh position={[x, 0.1, -0.5]}>
            <boxGeometry args={[0.04, 0.08, 0.15]} />
            <meshStandardMaterial color={type === 'luxury' ? '#d4af37' : '#888888'} metalness={0.6} />
          </mesh>
        </group>
      ))}
      {/* 棺台 */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[0.9, 0.1, 2]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </group>
  )
}

// ========== 焼香台 ==========
function IncenseStand({ position }) {
  return (
    <group position={position}>
      {/* テーブル */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.05, 0.5]} />
        <meshStandardMaterial color="#2c1810" roughness={0.5} />
      </mesh>
      {/* 脚 */}
      {[[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.18, z]}>
          <boxGeometry args={[0.05, 0.36, 0.05]} />
          <meshStandardMaterial color="#2c1810" />
        </mesh>
      ))}
      {/* 香炉 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.12, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* 線香立て */}
      <mesh position={[0.2, 0.48, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.08, 12]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>
      {/* ろうそく */}
      {[-0.25, 0.25].map((x, i) => (
        <group key={i} position={[x, 0.5, -0.1]}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.02, 0.15, 8]} />
            <meshStandardMaterial color="#f5f5dc" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <coneGeometry args={[0.015, 0.04, 6]} />
            <meshBasicMaterial color="#ff8800" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ========== 直葬シーン ==========
function DirectFuneralScene({ coffinType }) {
  return (
    <group position={[0, 0, -0.5]}>
      {/* 簡素な棺置き台 */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[2.2, 0.3, 1]} />
        <meshStandardMaterial color="#404040" />
      </mesh>

      {/* 棺 */}
      <Coffin position={[0, 0.5, 0]} type={coffinType} />

      {/* 小さな花束 */}
      <group position={[0.6, 0.4, 0.5]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.06, 0, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* 時計（控室の雰囲気） */}
      <group position={[0, 2.2, -2]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.03, 24]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.18, 24]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  )
}

// ========== 椅子エリア ==========
function SeatingArea({ config, planType }) {
  const { seatRows, seatsPerRow, hallDepth } = config
  const isDirect = planType === 'direct'

  const chairs = useMemo(() => {
    const result = []
    const startZ = isDirect ? 1.5 : 2

    for (let row = 0; row < seatRows; row++) {
      for (let col = 0; col < seatsPerRow; col++) {
        // 中央通路を空ける
        const halfSeats = seatsPerRow / 2
        const side = col < halfSeats ? -1 : 1
        const colInSide = col < halfSeats ? col : col - halfSeats

        const x = side * (0.8 + colInSide * 0.6)
        const z = startZ + row * 0.9

        result.push({ position: [x, 0, z], type: isDirect ? 'folding' : 'standard' })
      }
    }
    return result
  }, [seatRows, seatsPerRow, isDirect])

  return (
    <group>
      {chairs.map((chair, i) => (
        <Chair key={i} position={chair.position} type={chair.type} />
      ))}
    </group>
  )
}

function Chair({ position, type }) {
  if (type === 'folding') {
    // パイプ椅子
    return (
      <group position={position}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.4, 0.03, 0.4]} />
          <meshStandardMaterial color="#404040" />
        </mesh>
        <mesh position={[0, 0.65, -0.18]}>
          <boxGeometry args={[0.4, 0.45, 0.02]} />
          <meshStandardMaterial color="#404040" />
        </mesh>
      </group>
    )
  }

  // 葬儀用椅子
  return (
    <group position={position}>
      {/* 座面 */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.45, 0.06, 0.45]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* クッション */}
      <mesh position={[0, 0.46, 0]}>
        <boxGeometry args={[0.4, 0.04, 0.4]} />
        <meshStandardMaterial color="#4a0040" roughness={0.9} />
      </mesh>
      {/* 背もたれ */}
      <mesh position={[0, 0.75, -0.2]} castShadow>
        <boxGeometry args={[0.45, 0.55, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.75, -0.17]}>
        <boxGeometry args={[0.4, 0.5, 0.02]} />
        <meshStandardMaterial color="#4a0040" roughness={0.9} />
      </mesh>
      {/* 脚 */}
      {[[-0.18, 0.15], [0.18, 0.15], [-0.18, -0.15], [0.18, -0.15]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
          <meshStandardMaterial color="#333333" metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// ========== 受付エリア ==========
function ReceptionArea({ position }) {
  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      {/* 受付デスク */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.8, 0.5]} />
        <meshStandardMaterial color="#f0e8e0" />
      </mesh>
      {/* 天板 */}
      <mesh position={[0, 0.82, 0]}>
        <boxGeometry args={[1.25, 0.04, 0.55]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>

      {/* 芳名帳 */}
      <mesh position={[-0.3, 0.86, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.22]} />
        <meshStandardMaterial color="#f8f8f0" />
      </mesh>

      {/* 筆ペン立て */}
      <mesh position={[0, 0.9, 0.1]}>
        <cylinderGeometry args={[0.03, 0.04, 0.08, 8]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>

      {/* 香典盆 */}
      <mesh position={[0.35, 0.87, 0]}>
        <boxGeometry args={[0.25, 0.03, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* 「受付」看板 */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// ========== 供花スタンド ==========
function FlowerStands({ color }) {
  const positions = [
    [-5, 0, -3],
    [5, 0, -3],
    [-5, 0, -1],
    [5, 0, -1],
  ]

  return (
    <group>
      {positions.map((pos, i) => (
        <FlowerStand key={i} position={pos} color={i % 2 === 0 ? color.main : '#ffffff'} />
      ))}
    </group>
  )
}

function FlowerStand({ position, color }) {
  return (
    <group position={position}>
      {/* スタンド */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.2, 12]} />
        <meshStandardMaterial color="#333333" metalness={0.3} />
      </mesh>
      {/* ベース */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.04, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* 花器 */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.25, 0.15, 0.15, 12]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>
      {/* 花 */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2
        const r = 0.15
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 1.4 + Math.random() * 0.1, Math.sin(angle) * r]}>
            <icosahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial color={i % 2 === 0 ? color : '#228b22'} roughness={0.8} />
          </mesh>
        )
      })}
      {/* 中央の花 */}
      <mesh position={[0, 1.5, 0]}>
        <icosahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* リボン */}
      <mesh position={[0, 0.9, 0.1]}>
        <boxGeometry args={[0.08, 0.2, 0.01]} />
        <meshStandardMaterial color="#4a0080" />
      </mesh>
      {/* 名札 */}
      <mesh position={[0, 0.5, 0.08]}>
        <planeGeometry args={[0.1, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// ========== カメラコントロール ==========
function CameraControls({ viewMode }) {
  const { planType } = useFuneralStore()

  const config = useMemo(() => {
    switch (planType) {
      case 'direct':
        return {
          orbit: { target: [0, 0.8, 0] },
          firstPerson: { position: [0, 1.5, 3] },
        }
      case 'family':
        return {
          orbit: { target: [0, 1.2, -1] },
          firstPerson: { position: [0, 1.5, 4] },
        }
      default:
        return {
          orbit: { target: [0, 1.5, -2] },
          firstPerson: { position: [0, 1.5, 6] },
        }
    }
  }, [planType])

  if (viewMode === 'orbit') {
    return (
      <OrbitControls
        target={config.orbit.target}
        enablePan={false}
        minDistance={3}
        maxDistance={15}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.3}
      />
    )
  }

  return null
}

export default RealisticFuneralScene
