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

// カラーマップ - より鮮やかな色に
const flowerColors = {
  white: { main: '#ffffff', accent: '#f5f5f5' },
  pink: { main: '#ff69b4', accent: '#ff1493' },      // より鮮やかなピンク
  purple: { main: '#9932cc', accent: '#8b008b' },    // より鮮やかな紫
  yellow: { main: '#ffd700', accent: '#ffb300' },    // より鮮やかな黄色
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
// 典礼会館の実際のプランを参考に設定
// 直葬: 19.8万円 - 祭壇なし
// 家族葬45: 45万円 - 小規模祭壇
// 家族葬60: 60万円 - 中規模祭壇
// 一般葬100: 100万円 - 大規模祭壇
// 一般葬140: 140万円 - 特大祭壇
function FuneralHall({ isMobile }) {
  const { planType, customization } = useFuneralStore()
  const { theme, flowerColor, coffinType, flowerVolume } = customization

  // プラン別設定（典礼会館風）
  const config = useMemo(() => {
    // 花のボリューム係数
    const volumeMultiplier = flowerVolume === 'minimal' ? 0.6 : flowerVolume === 'lavish' ? 1.8 : 1

    switch (planType) {
      case 'direct':
        // 直葬プラン（19.8万円）- 祭壇なし、安置室風
        return {
          hallWidth: 5,
          hallDepth: 4,
          hallHeight: 2.8,
          hasAltar: false,
          seatRows: 1,
          seatsPerRow: 4,
          altarWidth: 0,
          altarHeight: 0,
          altarTiers: 0,
          flowerDensity: 0,
          flowerCount: 0,
        }
      case 'plan45':
        // 家族葬45（45万円）- 1段祭壇、幅1.8m、小規模
        return {
          hallWidth: 6,
          hallDepth: 5,
          hallHeight: 3,
          hasAltar: true,
          altarWidth: 1.8,
          altarHeight: 1.2,
          altarTiers: 1,
          seatRows: 2,
          seatsPerRow: 4,
          flowerDensity: 0.8 * volumeMultiplier,
          flowerCount: 300,  // 大幅増加
        }
      case 'plan60':
        // 家族葬60（60万円）- 2段祭壇、幅2.5m
        return {
          hallWidth: 8,
          hallDepth: 7,
          hallHeight: 3.5,
          hasAltar: true,
          altarWidth: 2.5,
          altarHeight: 1.8,
          altarTiers: 2,
          seatRows: 2,
          seatsPerRow: 5,
          flowerDensity: 1.0 * volumeMultiplier,
          flowerCount: 600,  // 大幅増加
        }
      case 'plan100':
        // 一般葬100（100万円）- 3段祭壇、幅4m
        return {
          hallWidth: 11,
          hallDepth: 9,
          hallHeight: 4,
          hasAltar: true,
          altarWidth: 4,
          altarHeight: 2.4,
          altarTiers: 3,
          seatRows: 3,
          seatsPerRow: 7,
          flowerDensity: 1.3 * volumeMultiplier,
          flowerCount: 1000,  // 大幅増加
        }
      case 'plan140':
        // 一般葬140（140万円）- 4段祭壇、幅5m、特大
        return {
          hallWidth: 14,
          hallDepth: 11,
          hallHeight: 5,
          hasAltar: true,
          altarWidth: 5.5,
          altarHeight: 3,
          altarTiers: 4,
          seatRows: 5,
          seatsPerRow: 8,
          flowerDensity: 1.6 * volumeMultiplier,
          flowerCount: 1500,  // 大幅増加
        }
      default:
        // デフォルトはplan60
        return {
          hallWidth: 8,
          hallDepth: 7,
          hallHeight: 3.5,
          hasAltar: true,
          altarWidth: 2.5,
          altarHeight: 1.8,
          altarTiers: 2,
          seatRows: 2,
          seatsPerRow: 5,
          flowerDensity: 1.0 * volumeMultiplier,
          flowerCount: 600,
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
            tiers={config.altarTiers}
            flowerCount={config.flowerCount || 100}
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
      {(planType === 'plan100' || planType === 'plan140') && (
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

// ========== 生花祭壇（典礼会館風リアル版） ==========
// 花で埋め尽くす壁のような表現
function FlowerAltar({ width, height, tiers = 3, flowerCount = 600, color, theme, flowerDensity = 1, isMobile }) {
  // テーマ別の祭壇スタイル
  const altarStyle = useMemo(() => {
    switch (theme) {
      case 'traditional':
        return {
          frameColor: '#5c4033',
          trimColor: '#d4af37',
          clothColor: '#1a1a4a',
          colorRatio: 0.25,  // アクセントカラーの割合
          greenRatio: 0.15,
        }
      case 'modern':
        return {
          frameColor: '#1a1a1a',
          trimColor: '#c0c0c0',
          clothColor: '#2a2a2a',
          colorRatio: 0.5,
          greenRatio: 0.1,
        }
      case 'nature':
      default:
        return {
          frameColor: '#6b5344',
          trimColor: '#a08060',
          clothColor: '#1a3a1a',
          colorRatio: 0.35,
          greenRatio: 0.25,
        }
    }
  }, [theme])

  // 花のグリッド配置を生成（壁のように密集）
  const flowers = useMemo(() => {
    const result = []
    const actualCount = Math.floor(flowerCount * flowerDensity * (isMobile ? 0.3 : 1))

    // グリッド計算
    const cols = Math.ceil(Math.sqrt(actualCount * (width / height)))
    const rows = Math.ceil(actualCount / cols)
    const cellWidth = width / cols
    const cellHeight = height / rows
    const flowerSize = Math.min(cellWidth, cellHeight) * 0.8

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // 遺影エリアを避ける（中央上部）
        const x = (col - cols / 2 + 0.5) * cellWidth + (Math.random() - 0.5) * cellWidth * 0.3
        const y = (row + 0.5) * cellHeight + (Math.random() - 0.5) * cellHeight * 0.3
        const z = (Math.random() - 0.5) * 0.15

        // 遺影エリア（上部中央）を避ける
        const relY = y / height
        const relX = Math.abs(x) / (width / 2)
        if (relY > 0.55 && relY < 0.95 && relX < 0.25) continue

        // 花の種類を決定（白ベース + グリーン + アクセントカラー）
        const rand = Math.random()
        let flowerColor = '#ffffff'
        if (rand < altarStyle.greenRatio) {
          flowerColor = '#2d5a2d'
        } else if (rand < altarStyle.greenRatio + altarStyle.colorRatio) {
          flowerColor = color.main
        }

        result.push({
          position: [x, y, z],
          scale: flowerSize * (0.8 + Math.random() * 0.4),
          color: flowerColor,
        })
      }
    }

    return result
  }, [flowerCount, flowerDensity, width, height, color, altarStyle, isMobile])

  // サイドアレンジメント用の花
  const sideFlowers = useMemo(() => {
    const result = []
    const count = isMobile ? 15 : 40

    for (let side of [-1, 1]) {
      for (let i = 0; i < count; i++) {
        const y = (i / count) * height * 0.9 + 0.1
        const x = side * (width / 2 + 0.15 + Math.random() * 0.1)
        const z = Math.random() * 0.1

        result.push({
          position: [x, y, z],
          scale: 0.04 + Math.random() * 0.02,
          color: Math.random() < 0.7 ? color.main : '#ffffff',
        })
      }
    }
    return result
  }, [width, height, color, isMobile])

  return (
    <group>
      {/* 背面パネル */}
      <mesh position={[0, height / 2, -0.15]}>
        <boxGeometry args={[width + 0.3, height + 0.1, 0.1]} />
        <meshStandardMaterial color={altarStyle.clothColor} />
      </mesh>

      {/* 花を大量配置 - シンプルな球体で高速化 */}
      {flowers.map((flower, i) => (
        <mesh key={i} position={flower.position}>
          <sphereGeometry args={[flower.scale, isMobile ? 4 : 6, isMobile ? 4 : 6]} />
          <meshStandardMaterial color={flower.color} roughness={0.8} />
        </mesh>
      ))}

      {/* サイドの花 */}
      {sideFlowers.map((flower, i) => (
        <mesh key={`side-${i}`} position={flower.position}>
          <sphereGeometry args={[flower.scale, 5, 5]} />
          <meshStandardMaterial color={flower.color} roughness={0.8} />
        </mesh>
      ))}

      {/* 上部装飾フレーム */}
      <mesh position={[0, height + 0.05, 0]}>
        <boxGeometry args={[width + 0.4, 0.1, 0.25]} />
        <meshStandardMaterial color={altarStyle.trimColor} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* 左右の柱フレーム */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 + 0.15), height / 2, 0]}>
          <boxGeometry args={[0.12, height + 0.1, 0.2]} />
          <meshStandardMaterial color={altarStyle.trimColor} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* 下部の段 */}
      {Array.from({ length: tiers }).map((_, i) => {
        const tierY = i * (height / tiers / 3)
        const tierWidth = width - i * 0.2
        return (
          <mesh key={`tier-${i}`} position={[0, tierY + 0.08, 0.2 + i * 0.1]}>
            <boxGeometry args={[tierWidth, 0.15, 0.3]} />
            <meshStandardMaterial color={altarStyle.frameColor} roughness={0.6} />
          </mesh>
        )
      })}

      {/* 供物台 */}
      <mesh position={[0, 0.25, 0.7]} castShadow>
        <boxGeometry args={[1.4, 0.5, 0.5]} />
        <meshStandardMaterial color={altarStyle.frameColor} roughness={0.5} />
      </mesh>

      {/* 供物台上の花 */}
      {[-0.4, -0.15, 0.1, 0.35].map((x, i) => (
        <mesh key={`table-${i}`} position={[x, 0.55, 0.7]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshStandardMaterial color={i % 2 === 0 ? color.main : '#ffffff'} roughness={0.8} />
        </mesh>
      ))}

      {/* サイド供花スタンド（豪華版） */}
      {flowerDensity > 1.2 && [-1, 1].map((side) => (
        <group key={`stand-${side}`} position={[side * (width / 2 + 0.7), 0, 0.4]}>
          {/* スタンド */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1, 8]} />
            <meshStandardMaterial color="#333" metalness={0.3} />
          </mesh>
          {/* 花のボール */}
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshStandardMaterial color={color.main} roughness={0.7} />
          </mesh>
          {/* 周りの小花 */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(angle) * 0.2, 1.1 + Math.sin(i) * 0.05, Math.sin(angle) * 0.2]}>
                <sphereGeometry args={[0.08, 5, 5]} />
                <meshStandardMaterial color={i % 2 === 0 ? '#ffffff' : color.main} roughness={0.8} />
              </mesh>
            )
          })}
          {/* リボン */}
          <mesh position={[0, 0.7, 0.08]}>
            <boxGeometry args={[0.1, 0.3, 0.02]} />
            <meshStandardMaterial color="#4a0080" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// 単体の花（より詳細な表現）
function SingleFlower({ position, scale, color, rotation = [0, 0, 0] }) {
  const petalCount = 8

  return (
    <group position={position} rotation={rotation}>
      {/* 中心 */}
      <mesh>
        <sphereGeometry args={[scale * 0.15, 6, 6]} />
        <meshStandardMaterial color="#ffd700" roughness={0.7} />
      </mesh>

      {/* 花びら */}
      {Array.from({ length: petalCount }).map((_, i) => {
        const angle = (i / petalCount) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * scale * 0.2,
              0,
              Math.sin(angle) * scale * 0.2,
            ]}
            rotation={[Math.PI / 4, -angle, 0]}
          >
            <circleGeometry args={[scale * 0.25, 6]} />
            <meshStandardMaterial color={color} roughness={0.5} side={2} />
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
    // パイプ椅子 - 背もたれを後ろ側（+Z）に配置して祭壇に向ける
    return (
      <group position={position}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.4, 0.03, 0.4]} />
          <meshStandardMaterial color="#404040" />
        </mesh>
        <mesh position={[0, 0.65, 0.18]}>
          <boxGeometry args={[0.4, 0.45, 0.02]} />
          <meshStandardMaterial color="#404040" />
        </mesh>
      </group>
    )
  }

  // 葬儀用椅子 - 背もたれを後ろ側（+Z）に配置して祭壇に向ける
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
      <mesh position={[0, 0.75, 0.2]} castShadow>
        <boxGeometry args={[0.45, 0.55, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.75, 0.17]}>
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

      {/* 花 - SingleFlowerを使用 */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2
        const r = 0.12
        const height = 1.38 + (i % 2) * 0.08
        return (
          <SingleFlower
            key={i}
            position={[Math.cos(angle) * r, height, Math.sin(angle) * r]}
            scale={0.12}
            color={i % 2 === 0 ? color : '#ffffff'}
            rotation={[0.2, angle, 0]}
          />
        )
      })}

      {/* 中央の花 */}
      <SingleFlower
        position={[0, 1.5, 0]}
        scale={0.15}
        color={color}
      />

      {/* 葉 */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2 + 0.3
        return (
          <mesh
            key={`leaf-${i}`}
            position={[Math.cos(angle) * 0.18, 1.3, Math.sin(angle) * 0.18]}
            rotation={[0.5, angle, 0]}
          >
            <planeGeometry args={[0.08, 0.15]} />
            <meshStandardMaterial color="#228b22" side={2} />
          </mesh>
        )
      })}

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
