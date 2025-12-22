/**
 * プロシージャル3Dモデル
 * GLTFなしで本格的な葬儀シーンを構築
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ========== 菊の花 (Chrysanthemum) ==========
export function Chrysanthemum({ position = [0, 0, 0], scale = 1, color = '#ffffff' }) {
  const groupRef = useRef()

  // 花びらを放射状に配置
  const petals = useMemo(() => {
    const result = []
    const layers = 4
    const petalsPerLayer = [8, 12, 16, 20]

    for (let layer = 0; layer < layers; layer++) {
      const count = petalsPerLayer[layer]
      const radius = 0.05 + layer * 0.03
      const height = 0.1 - layer * 0.02

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + layer * 0.2
        result.push({
          position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
          rotation: [0.3 + layer * 0.15, angle, 0],
          scale: [0.02, 0.06 + layer * 0.01, 0.015],
          layer,
        })
      }
    }
    return result
  }, [])

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* 花の中心 */}
      <mesh>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#ffdd00" roughness={0.8} />
      </mesh>

      {/* 花びら */}
      {petals.map((petal, i) => (
        <mesh
          key={i}
          position={petal.position}
          rotation={petal.rotation}
          scale={petal.scale}
        >
          <sphereGeometry args={[1, 6, 4]} />
          <meshStandardMaterial
            color={color}
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* 茎 */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.005, 0.008, 0.2, 8]} />
        <meshStandardMaterial color="#228b22" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ========== 位牌 (Memorial Tablet) ==========
export function MemorialTablet({ position = [0, 0, 0], name = '' }) {
  return (
    <group position={position}>
      {/* 台座 */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.25, 0.1, 0.12]} />
        <meshStandardMaterial color="#1a0a00" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 本体 */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.18, 0.4, 0.03]} />
        <meshStandardMaterial color="#0a0500" roughness={0.2} metalness={0.2} />
      </mesh>

      {/* 金縁 */}
      <mesh position={[0, 0.3, 0.018]}>
        <boxGeometry args={[0.16, 0.36, 0.005]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 頭部装飾 */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <coneGeometry args={[0.06, 0.08, 4]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

// ========== 線香立て (Incense Holder) ==========
export function IncenseHolder({ position = [0, 0, 0], lit = true }) {
  const smokeRef = useRef()

  useFrame((state) => {
    if (smokeRef.current && lit) {
      smokeRef.current.rotation.y = state.clock.elapsedTime * 0.3
      smokeRef.current.children.forEach((child, i) => {
        child.position.y = 0.15 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.02 + i * 0.08
        child.material.opacity = 0.4 - i * 0.08
      })
    }
  })

  return (
    <group position={position}>
      {/* 香炉本体 */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.08, 24]} />
        <meshStandardMaterial color="#8b4513" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* 灰 */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.01, 24]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.95} />
      </mesh>

      {/* 線香 */}
      {lit && (
        <>
          <mesh position={[0, 0.12, 0]} rotation={[0.1, 0, 0.05]}>
            <cylinderGeometry args={[0.003, 0.003, 0.15, 8]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>

          {/* 火 */}
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshBasicMaterial color="#ff4400" />
          </mesh>
          <pointLight position={[0, 0.2, 0]} intensity={0.1} color="#ff6600" distance={0.5} />

          {/* 煙 */}
          <group ref={smokeRef} position={[0, 0.05, 0]}>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[0, 0.15 + i * 0.08, 0]}>
                <sphereGeometry args={[0.01 + i * 0.005, 8, 8]} />
                <meshBasicMaterial color="#cccccc" transparent opacity={0.4 - i * 0.08} />
              </mesh>
            ))}
          </group>
        </>
      )}
    </group>
  )
}

// ========== りん (Buddhist Bell) ==========
export function BuddhistBell({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* 座布団 */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.04, 24]} />
        <meshStandardMaterial color="#4a0080" roughness={0.9} />
      </mesh>

      {/* りん本体 */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <sphereGeometry args={[0.07, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* りん棒 */}
      <mesh position={[0.15, 0.05, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.012, 0.015, 0.15, 12]} />
        <meshStandardMaterial color="#8b4513" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ========== 蝋燭 (Candle) ==========
export function CandleStick({ position = [0, 0, 0], height = 0.3, lit = true }) {
  const flameRef = useRef()

  useFrame((state) => {
    if (flameRef.current && lit) {
      flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.15
      flameRef.current.scale.x = 1 + Math.cos(state.clock.elapsedTime * 12) * 0.1
    }
  })

  return (
    <group position={position}>
      {/* 燭台 */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.08, 16]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 蝋燭本体 */}
      <mesh position={[0, 0.04 + height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.02, height, 12]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.8} />
      </mesh>

      {/* 芯 */}
      <mesh position={[0, 0.04 + height + 0.01, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.02, 6]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* 炎 */}
      {lit && (
        <group position={[0, 0.04 + height + 0.04, 0]}>
          <mesh ref={flameRef}>
            <coneGeometry args={[0.015, 0.05, 8]} />
            <meshBasicMaterial color="#ff8800" transparent opacity={0.95} />
          </mesh>
          <mesh scale={[0.6, 0.6, 0.6]} position={[0, 0.01, 0]}>
            <coneGeometry args={[0.01, 0.03, 8]} />
            <meshBasicMaterial color="#ffff88" />
          </mesh>
          <pointLight intensity={0.3} color="#ff6600" distance={2} />
        </group>
      )}
    </group>
  )
}

// ========== 供物 (Offerings) ==========
export function Offerings({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* 三方（台） */}
      <mesh position={[0, 0.03, 0]} castShadow>
        <boxGeometry args={[0.2, 0.06, 0.15]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.7} />
      </mesh>

      {/* みかん */}
      <mesh position={[-0.04, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#ff8c00" roughness={0.8} />
      </mesh>

      {/* りんご */}
      <mesh position={[0.04, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#cc0000" roughness={0.6} />
      </mesh>

      {/* 饅頭 */}
      <mesh position={[0, 0.09, 0.04]} castShadow>
        <sphereGeometry args={[0.025, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ========== 遺影フレーム (Photo Frame) ==========
export function PhotoFrame({ position = [0, 0, 0], size = 1 }) {
  return (
    <group position={position} scale={size}>
      {/* 外枠 */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>

      {/* 金縁（内側） */}
      <mesh position={[0, 0, 0.026]}>
        <boxGeometry args={[0.55, 0.75, 0.01]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* 写真エリア */}
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[0.48, 0.68]} />
        <meshBasicMaterial color="#e8e8e8" />
      </mesh>

      {/* 黒リボン */}
      <mesh position={[0.22, 0.32, 0.04]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.15, 0.02, 0.005]} />
        <meshStandardMaterial color="#000000" roughness={0.9} />
      </mesh>
      <mesh position={[0.28, 0.25, 0.04]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.15, 0.02, 0.005]} />
        <meshStandardMaterial color="#000000" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ========== 花輪スタンド (Flower Wreath Stand) ==========
export function FlowerWreathStand({ position = [0, 0, 0], color = '#ffffff' }) {
  return (
    <group position={position}>
      {/* スタンド脚 */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 1.6, 12]} />
        <meshStandardMaterial color="#333333" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* 花輪（リース） */}
      <mesh position={[0, 1.5, 0]} rotation={[0.1, 0, 0]} castShadow>
        <torusGeometry args={[0.4, 0.12, 16, 32]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* リボン */}
      <mesh position={[0, 1.15, 0.1]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.02]} />
        <meshStandardMaterial color="#4a0080" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.15, 0.1]} rotation={[0.2, 0, 0.3]} castShadow>
        <boxGeometry args={[0.15, 0.35, 0.02]} />
        <meshStandardMaterial color="#4a0080" roughness={0.7} />
      </mesh>
    </group>
  )
}

// ========== 焼香台 (Incense Offering Table) ==========
export function IncenseTable({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* テーブル天板 */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.05, 0.5]} />
        <meshStandardMaterial color="#2c1810" roughness={0.4} />
      </mesh>

      {/* 脚 */}
      {[[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]} castShadow>
          <boxGeometry args={[0.05, 0.72, 0.05]} />
          <meshStandardMaterial color="#2c1810" roughness={0.4} />
        </mesh>
      ))}

      {/* 香炉 */}
      <IncenseHolder position={[0, 0.82, 0]} />

      {/* 抹香入れ */}
      <mesh position={[0.25, 0.82, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.06, 16]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}
