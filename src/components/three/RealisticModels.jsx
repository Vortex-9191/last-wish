/**
 * リアルな葬儀3Dモデル
 * より本物らしい質感とディテール
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ========== 木目テクスチャ生成 ==========
function createWoodTexture(color = '#8B4513', grain = 0.3) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  // ベース色
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 256, 256)

  // 木目ライン
  ctx.strokeStyle = `rgba(0,0,0,${grain})`
  for (let i = 0; i < 50; i++) {
    ctx.beginPath()
    ctx.lineWidth = Math.random() * 2 + 0.5
    const y = Math.random() * 256
    ctx.moveTo(0, y)
    for (let x = 0; x < 256; x += 10) {
      ctx.lineTo(x, y + Math.sin(x * 0.05) * 3 + (Math.random() - 0.5) * 2)
    }
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

// ========== 布テクスチャ生成 ==========
function createFabricTexture(color = '#1a1a4a') {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = color
  ctx.fillRect(0, 0, 128, 128)

  // 織り目パターン
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  for (let i = 0; i < 128; i += 2) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, 128)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(128, i)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  return texture
}

// ========== 白木祭壇（伝統的） ==========
export function ShirakiAltar({ position = [0, 0, 0], tiers = 3 }) {
  const woodTexture = useMemo(() => createWoodTexture('#f5e6d3', 0.15), [])

  const tierData = [
    { width: 4, height: 0.4, depth: 1.5, y: 0.2 },
    { width: 3.5, height: 0.35, depth: 1.3, y: 0.6 },
    { width: 3, height: 0.3, depth: 1.1, y: 0.95 },
    { width: 2, height: 0.25, depth: 0.8, y: 1.25 },
  ].slice(0, tiers)

  return (
    <group position={position}>
      {/* 段 */}
      {tierData.map((tier, i) => (
        <group key={i}>
          {/* メイン段 */}
          <mesh position={[0, tier.y, 0]} castShadow receiveShadow>
            <boxGeometry args={[tier.width, tier.height, tier.depth]} />
            <meshStandardMaterial
              map={woodTexture}
              color="#f5e6d3"
              roughness={0.6}
              metalness={0}
            />
          </mesh>
          {/* 金縁装飾 */}
          <mesh position={[0, tier.y + tier.height / 2 + 0.01, tier.depth / 2]}>
            <boxGeometry args={[tier.width, 0.02, 0.05]} />
            <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 屋根装飾 */}
      <mesh position={[0, tierData[tiers - 1].y + 0.4, -0.2]} castShadow>
        <boxGeometry args={[tierData[tiers - 1].width + 0.3, 0.08, 0.6]} />
        <meshStandardMaterial color="#f5e6d3" roughness={0.5} />
      </mesh>

      {/* 柱 */}
      {[-tierData[0].width / 2 + 0.1, tierData[0].width / 2 - 0.1].map((x, i) => (
        <group key={i} position={[x, 0, tierData[0].depth / 2]}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 1.6, 12]} />
            <meshStandardMaterial map={woodTexture} color="#f5e6d3" roughness={0.5} />
          </mesh>
          {/* 柱頭 */}
          <mesh position={[0, 1.65, 0]} castShadow>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ========== 生花祭壇（モダン） ==========
export function FlowerAltar({ position = [0, 0, 0], flowerColor = '#ffffff' }) {
  return (
    <group position={position}>
      {/* ベースフレーム */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[5, 1.6, 0.3]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 花の壁 - 密集した球体で表現 */}
      {useMemo(() => {
        const flowers = []
        for (let x = -2; x <= 2; x += 0.25) {
          for (let y = 0.2; y <= 1.4; y += 0.2) {
            const offset = (y * 10) % 2 === 0 ? 0.125 : 0
            flowers.push({
              position: [x + offset, y, 0.2],
              scale: 0.08 + Math.random() * 0.04,
              color: Math.random() > 0.3 ? flowerColor : '#90EE90'
            })
          }
        }
        return flowers
      }, [flowerColor]).map((flower, i) => (
        <mesh key={i} position={flower.position} castShadow>
          <icosahedronGeometry args={[flower.scale, 1]} />
          <meshStandardMaterial color={flower.color} roughness={0.8} />
        </mesh>
      ))}

      {/* 遺影台 */}
      <mesh position={[0, 1.5, 0.3]} castShadow>
        <boxGeometry args={[1, 0.1, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
    </group>
  )
}

// ========== リアルな棺 ==========
export function RealisticCoffin({ position = [0, 0, 0], type = 'standard' }) {
  const woodTexture = useMemo(() => {
    switch (type) {
      case 'luxury':
        return createWoodTexture('#4a3728', 0.4)
      case 'cloth':
        return null
      default:
        return createWoodTexture('#8b6914', 0.3)
    }
  }, [type])

  const fabricTexture = useMemo(() => createFabricTexture('#f8f8f8'), [])

  // 棺の形状 - 六角形ベース
  const coffinShape = useMemo(() => {
    const shape = new THREE.Shape()
    // 頭側が広く、足側が狭い六角形
    shape.moveTo(-0.35, 0)      // 左下
    shape.lineTo(-0.45, 0.15)   // 左肩
    shape.lineTo(-0.35, 0.3)    // 左上
    shape.lineTo(0.35, 0.3)     // 右上
    shape.lineTo(0.45, 0.15)    // 右肩
    shape.lineTo(0.35, 0)       // 右下
    shape.closePath()
    return shape
  }, [])

  const clothColor = type === 'cloth' ? '#f5f5f5' : undefined

  return (
    <group position={position}>
      {/* 棺本体 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry
          args={[
            coffinShape,
            { depth: 1.8, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 }
          ]}
        />
        {type === 'cloth' ? (
          <meshStandardMaterial map={fabricTexture} color={clothColor} roughness={0.9} />
        ) : (
          <meshStandardMaterial map={woodTexture} roughness={0.4} />
        )}
      </mesh>

      {/* 蓋 */}
      <mesh position={[0, 0.32, 0.9]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <extrudeGeometry
          args={[
            coffinShape,
            { depth: 0.9, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 }
          ]}
        />
        {type === 'cloth' ? (
          <meshStandardMaterial map={fabricTexture} color={clothColor} roughness={0.9} />
        ) : (
          <meshStandardMaterial map={woodTexture} roughness={0.4} />
        )}
      </mesh>

      {/* 取っ手 */}
      {[[-0.47, 0.5], [-0.47, 1.3], [0.47, 0.5], [0.47, 1.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.15, z]} castShadow>
          <boxGeometry args={[0.03, 0.08, 0.15]} />
          <meshStandardMaterial
            color={type === 'luxury' ? '#d4af37' : '#888888'}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}

      {/* 布棺の場合は装飾リボン */}
      {type === 'cloth' && (
        <>
          <mesh position={[0, 0.35, 0.9]}>
            <torusGeometry args={[0.12, 0.015, 8, 24]} />
            <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.35, 0.9]}>
            <circleGeometry args={[0.1, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.8} />
          </mesh>
        </>
      )}

      {/* 台 */}
      <mesh position={[0, -0.08, 0.9]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.15, 2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
    </group>
  )
}

// ========== 遺影（リアル） ==========
export function RealisticPortrait({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* 額縁 - 黒塗り */}
      <mesh castShadow>
        <boxGeometry args={[0.65, 0.85, 0.06]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* 金縁インナー */}
      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[0.58, 0.78, 0.02]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* 写真エリア（グレー） */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[0.5, 0.7]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.5} />
      </mesh>

      {/* 人のシルエット（簡易表現） */}
      <mesh position={[0, 0.05, 0.045]}>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial color="#a0a0a0" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.18, 0.045]}>
        <planeGeometry args={[0.3, 0.35]} />
        <meshStandardMaterial color="#a0a0a0" roughness={0.6} />
      </mesh>

      {/* 黒リボン */}
      <mesh position={[0.25, 0.32, 0.05]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.18, 0.03, 0.005]} />
        <meshStandardMaterial color="#000000" roughness={0.9} />
      </mesh>
      <mesh position={[0.3, 0.22, 0.05]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.18, 0.03, 0.005]} />
        <meshStandardMaterial color="#000000" roughness={0.9} />
      </mesh>

      {/* スタンド */}
      <mesh position={[0, -0.5, -0.1]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.3]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.3} />
      </mesh>
    </group>
  )
}

// ========== 供花スタンド（会社名入り） ==========
export function CompanyFlowerStand({ position = [0, 0, 0], color = '#ffffff', companyName = '' }) {
  return (
    <group position={position}>
      {/* スタンド脚 */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.08, 1.4, 12]} />
        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* ベース */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.22, 0.04, 24]} />
        <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* 花輪（トーラス＋花で覆う） */}
      <group position={[0, 1.4, 0]} rotation={[0.1, 0, 0]}>
        {/* 土台リング */}
        <mesh>
          <torusGeometry args={[0.35, 0.12, 12, 32]} />
          <meshStandardMaterial color="#228b22" roughness={0.9} />
        </mesh>

        {/* 花をリング上に配置 */}
        {useMemo(() => {
          const flowers = []
          for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2
            const r = 0.35
            flowers.push({
              position: [Math.cos(angle) * r, Math.sin(angle) * r * 0.3, Math.sin(angle) * r],
              rotation: [0, angle, 0]
            })
          }
          return flowers
        }, []).map((f, i) => (
          <mesh key={i} position={f.position} rotation={f.rotation}>
            <icosahedronGeometry args={[0.06 + Math.random() * 0.02, 0]} />
            <meshStandardMaterial color={i % 3 === 0 ? '#90EE90' : color} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* リボン */}
      <mesh position={[0, 0.95, 0.15]} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.01]} />
        <meshStandardMaterial color="#4a0080" roughness={0.7} />
      </mesh>
      <mesh position={[-0.04, 0.95, 0.15]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.1, 0.35, 0.01]} />
        <meshStandardMaterial color="#4a0080" roughness={0.7} />
      </mesh>
      <mesh position={[0.04, 0.95, 0.15]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.1, 0.35, 0.01]} />
        <meshStandardMaterial color="#4a0080" roughness={0.7} />
      </mesh>

      {/* 名札 */}
      <mesh position={[0, 0.5, 0.06]} castShadow>
        <boxGeometry args={[0.15, 0.25, 0.01]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
    </group>
  )
}

// ========== 焼香セット ==========
export function IncenseSet({ position = [0, 0, 0] }) {
  const smokeRef = useRef()

  useFrame((state) => {
    if (smokeRef.current) {
      smokeRef.current.rotation.y = state.clock.elapsedTime * 0.2
      smokeRef.current.children.forEach((child, i) => {
        if (child.material) {
          child.position.y = 0.08 + i * 0.05 + Math.sin(state.clock.elapsedTime + i) * 0.01
          child.material.opacity = Math.max(0, 0.5 - i * 0.1 - Math.sin(state.clock.elapsedTime) * 0.1)
        }
      })
    }
  })

  return (
    <group position={position}>
      {/* テーブル */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.04, 0.4]} />
        <meshStandardMaterial color="#2c1810" roughness={0.4} />
      </mesh>
      {/* 脚 */}
      {[[-0.25, -0.15], [0.25, -0.15], [-0.25, 0.15], [0.25, 0.15]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.17, z]} castShadow>
          <boxGeometry args={[0.03, 0.34, 0.03]} />
          <meshStandardMaterial color="#2c1810" roughness={0.4} />
        </mesh>
      ))}

      {/* 香炉 */}
      <group position={[0, 0.4, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.08, 24]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* 灰 */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.01, 24]} />
          <meshStandardMaterial color="#aaaaaa" roughness={0.95} />
        </mesh>
        {/* 線香 */}
        <mesh position={[0, 0.08, 0]} rotation={[0.08, 0, 0.05]}>
          <cylinderGeometry args={[0.002, 0.002, 0.1, 6]} />
          <meshStandardMaterial color="#556b2f" />
        </mesh>
        {/* 火の先端 */}
        <mesh position={[0.003, 0.13, 0.004]}>
          <sphereGeometry args={[0.004, 8, 8]} />
          <meshBasicMaterial color="#ff4400" />
        </mesh>
        <pointLight position={[0, 0.13, 0]} intensity={0.05} color="#ff6600" distance={0.3} />

        {/* 煙 */}
        <group ref={smokeRef}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[0, 0.08 + i * 0.05, 0]}>
              <sphereGeometry args={[0.008 + i * 0.004, 6, 6]} />
              <meshBasicMaterial color="#cccccc" transparent opacity={0.5 - i * 0.1} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 抹香入れ */}
      <mesh position={[0.15, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.045, 0.05, 16]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* 抹香（蓋が開いている） */}
      <mesh position={[0.15, 0.44, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ========== 菊の花（リアル版） ==========
export function RealisticChrysanthemum({ position = [0, 0, 0], scale = 1, color = '#ffffff' }) {
  const petals = useMemo(() => {
    const result = []
    const layers = 5
    const petalsPerLayer = [12, 18, 24, 30, 36]

    for (let layer = 0; layer < layers; layer++) {
      const count = petalsPerLayer[layer]
      const radius = 0.02 + layer * 0.015
      const height = 0.05 - layer * 0.008
      const petalLength = 0.04 + layer * 0.008

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + layer * 0.15
        result.push({
          position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
          rotation: [0.4 + layer * 0.12, angle, 0],
          scale: [0.008, petalLength, 0.004],
          layer,
        })
      }
    }
    return result
  }, [])

  return (
    <group position={position} scale={scale}>
      {/* 花芯 */}
      <mesh>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshStandardMaterial color="#ffcc00" roughness={0.9} />
      </mesh>

      {/* 花びら */}
      {petals.map((petal, i) => (
        <mesh
          key={i}
          position={petal.position}
          rotation={petal.rotation}
          scale={petal.scale}
        >
          <sphereGeometry args={[1, 4, 3]} />
          <meshStandardMaterial
            color={petal.layer < 2 ? '#ffffee' : color}
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* 茎 */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.003, 0.004, 0.1, 6]} />
        <meshStandardMaterial color="#228b22" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ========== 式場の椅子（リアル版） ==========
export function CeremonyChair({ position = [0, 0, 0], withCushion = true }) {
  const woodTexture = useMemo(() => createWoodTexture('#4a3728', 0.25), [])

  return (
    <group position={position}>
      {/* 座面フレーム */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.42, 0.03, 0.42]} />
        <meshStandardMaterial map={woodTexture} roughness={0.5} />
      </mesh>

      {/* クッション */}
      {withCushion && (
        <mesh position={[0, 0.46, 0]} castShadow>
          <boxGeometry args={[0.38, 0.05, 0.38]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      )}

      {/* 背もたれフレーム */}
      <mesh position={[0, 0.72, -0.19]} castShadow>
        <boxGeometry args={[0.42, 0.55, 0.03]} />
        <meshStandardMaterial map={woodTexture} roughness={0.5} />
      </mesh>

      {/* 背もたれクッション */}
      {withCushion && (
        <mesh position={[0, 0.72, -0.16]} castShadow>
          <boxGeometry args={[0.36, 0.48, 0.03]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      )}

      {/* 脚 */}
      {[[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.21, z]} castShadow>
          <boxGeometry args={[0.03, 0.42, 0.03]} />
          <meshStandardMaterial map={woodTexture} roughness={0.5} />
        </mesh>
      ))}

      {/* 横棒 */}
      <mesh position={[0, 0.15, -0.17]} castShadow>
        <boxGeometry args={[0.36, 0.02, 0.02]} />
        <meshStandardMaterial map={woodTexture} roughness={0.5} />
      </mesh>
    </group>
  )
}
