/**
 * 葬儀式場の展示物・装飾
 * 受付、看板、弔電、供物など
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ========== 受付台 ==========
export function ReceptionDesk({ position = [0, 0, 0], side = 'left' }) {
  const xOffset = side === 'left' ? -1 : 1

  return (
    <group position={position}>
      {/* デスク本体 */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.9, 0.6]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.5} />
      </mesh>

      {/* 天板 */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[1.3, 0.04, 0.7]} />
        <meshStandardMaterial color="#2c1810" roughness={0.4} />
      </mesh>

      {/* 芳名帳 */}
      <mesh position={[-0.3, 0.96, 0]} castShadow>
        <boxGeometry args={[0.35, 0.02, 0.25]} />
        <meshStandardMaterial color="#f8f8f0" roughness={0.6} />
      </mesh>
      {/* 芳名帳の表紙 */}
      <mesh position={[-0.3, 0.975, 0]}>
        <planeGeometry args={[0.33, 0.23]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* 筆ペン立て */}
      <mesh position={[0, 0.99, 0.15]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.08, 12]} />
        <meshStandardMaterial color="#2c1810" roughness={0.5} />
      </mesh>
      {/* ペン */}
      <mesh position={[0, 1.05, 0.15]} rotation={[0.1, 0, 0.2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.15, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* 香典受け箱 */}
      <mesh position={[0.35, 0.99, 0]} castShadow>
        <boxGeometry args={[0.3, 0.06, 0.2]} />
        <meshStandardMaterial color="#4a0080" roughness={0.7} />
      </mesh>

      {/* 「御香典」の札 */}
      <mesh position={[0.35, 1.05, 0.12]}>
        <planeGeometry args={[0.15, 0.08]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* 椅子 */}
      <group position={[0, 0, 0.5]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.4, 0.04, 0.4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.2, z]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
            <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ========== 式場看板（○○家） ==========
export function FamilySignboard({ position = [0, 0, 0], familyName = '故人' }) {
  return (
    <group position={position}>
      {/* 看板フレーム */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.5, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>

      {/* 白い背景 */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.1, 0.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* 「○○家」テキストエリア（視覚的表現） */}
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[0.8, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} transparent opacity={0.9} />
      </mesh>

      {/* スタンド */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.8, 12]} />
        <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.05, 24]} />
        <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  )
}

// ========== 弔電掲示板 ==========
export function TelegramBoard({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* ボードフレーム */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 1.2, 0.05]} />
        <meshStandardMaterial color="#2c1810" roughness={0.5} />
      </mesh>

      {/* ボード面 */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.4, 1.1]} />
        <meshStandardMaterial color="#f5e6d3" roughness={0.7} />
      </mesh>

      {/* 弔電（複数枚） */}
      {[
        [-0.35, 0.3], [0.35, 0.3],
        [-0.35, -0.1], [0.35, -0.1],
        [0, 0.1],
      ].map(([x, y], i) => (
        <group key={i} position={[x, y, 0.04]}>
          <mesh>
            <planeGeometry args={[0.25, 0.35]} />
            <meshStandardMaterial color="#fffef8" roughness={0.5} />
          </mesh>
          {/* 文字を示す横線 */}
          {[0.1, 0.05, 0, -0.05, -0.1].map((ly, j) => (
            <mesh key={j} position={[0, ly, 0.001]}>
              <planeGeometry args={[0.18, 0.008]} />
              <meshStandardMaterial color="#333333" roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 「弔電」タイトル */}
      <mesh position={[0, 0.5, 0.04]}>
        <planeGeometry args={[0.4, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* スタンド脚 */}
      <mesh position={[-0.5, -0.9, 0]} castShadow>
        <boxGeometry args={[0.04, 0.8, 0.04]} />
        <meshStandardMaterial color="#2c1810" roughness={0.5} />
      </mesh>
      <mesh position={[0.5, -0.9, 0]} castShadow>
        <boxGeometry args={[0.04, 0.8, 0.04]} />
        <meshStandardMaterial color="#2c1810" roughness={0.5} />
      </mesh>
    </group>
  )
}

// ========== 供物台（盛籠） ==========
export function OfferingDisplay({ position = [0, 0, 0], type = 'fruit' }) {
  return (
    <group position={position}>
      {/* 台 */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.4]} />
        <meshStandardMaterial color="#f5e6d3" roughness={0.6} />
      </mesh>

      {/* 籠 */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.15, 0.12, 16]} />
        <meshStandardMaterial color="#d4af37" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* 内容物 */}
      {type === 'fruit' && (
        <>
          {/* りんご */}
          <mesh position={[-0.05, 0.68, 0]} castShadow>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color="#cc0000" roughness={0.6} />
          </mesh>
          {/* みかん */}
          <mesh position={[0.05, 0.68, 0.05]} castShadow>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#ff8c00" roughness={0.7} />
          </mesh>
          {/* バナナ */}
          <mesh position={[0, 0.65, -0.05]} rotation={[0, 0, 0.3]} castShadow>
            <capsuleGeometry args={[0.015, 0.08, 4, 8]} />
            <meshStandardMaterial color="#ffe135" roughness={0.6} />
          </mesh>
        </>
      )}

      {type === 'sweets' && (
        <>
          {/* 饅頭 */}
          {[-0.04, 0.04].map((x, i) => (
            <mesh key={i} position={[x, 0.65, 0]} castShadow>
              <sphereGeometry args={[0.035, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              <meshStandardMaterial color="#f5deb3" roughness={0.8} />
            </mesh>
          ))}
        </>
      )}

      {type === 'cans' && (
        <>
          {/* 缶詰 */}
          {[-0.05, 0.05].map((x, i) => (
            <mesh key={i} position={[x, 0.65, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.06, 16]} />
              <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.5} />
            </mesh>
          ))}
        </>
      )}

      {/* リボン */}
      <mesh position={[0, 0.75, 0.1]} castShadow>
        <boxGeometry args={[0.15, 0.08, 0.01]} />
        <meshStandardMaterial color="#4a0080" roughness={0.7} />
      </mesh>

      {/* 名札 */}
      <mesh position={[0, 0.35, 0.21]}>
        <planeGeometry args={[0.15, 0.08]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
    </group>
  )
}

// ========== 返礼品コーナー ==========
export function ReturnGiftTable({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* テーブル */}
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.04, 0.6]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.5} />
      </mesh>
      {/* 脚 */}
      {[[-0.65, -0.25], [0.65, -0.25], [-0.65, 0.25], [0.65, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.18, z]} castShadow>
          <boxGeometry args={[0.04, 0.36, 0.04]} />
          <meshStandardMaterial color="#f5f0e6" roughness={0.5} />
        </mesh>
      ))}

      {/* テーブルクロス */}
      <mesh position={[0, 0.41, 0.31]}>
        <boxGeometry args={[1.5, 0.01, 0.02]} />
        <meshStandardMaterial color="#4a0080" roughness={0.8} />
      </mesh>

      {/* 返礼品の箱（複数） */}
      {[-0.5, -0.25, 0, 0.25, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0.48, 0]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.15]} />
          <meshStandardMaterial color="#f8f8f8" roughness={0.6} />
        </mesh>
      ))}

      {/* 「会葬御礼」看板 */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.75, 0.015]}>
        <planeGeometry args={[0.35, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ========== 式次第看板 ==========
export function ProgramBoard({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* フレーム */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.9, 0.03]} />
        <meshStandardMaterial color="#2c1810" roughness={0.4} />
      </mesh>

      {/* 白い面 */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.5, 0.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* 「式次第」タイトル */}
      <mesh position={[0, 0.3, 0.025]}>
        <planeGeometry args={[0.3, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* 項目（横線で表現） */}
      {[0.15, 0.05, -0.05, -0.15, -0.25].map((y, i) => (
        <mesh key={i} position={[0, y, 0.025]}>
          <planeGeometry args={[0.35, 0.015]} />
          <meshStandardMaterial color="#333333" roughness={0.8} />
        </mesh>
      ))}

      {/* イーゼルスタンド */}
      <mesh position={[-0.2, -0.6, 0.15]} rotation={[0.2, 0, -0.1]} castShadow>
        <boxGeometry args={[0.02, 0.8, 0.02]} />
        <meshStandardMaterial color="#2c1810" roughness={0.5} />
      </mesh>
      <mesh position={[0.2, -0.6, 0.15]} rotation={[0.2, 0, 0.1]} castShadow>
        <boxGeometry args={[0.02, 0.8, 0.02]} />
        <meshStandardMaterial color="#2c1810" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.6, -0.15]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.02, 0.9, 0.02]} />
        <meshStandardMaterial color="#2c1810" roughness={0.5} />
      </mesh>
    </group>
  )
}

// ========== 生花スタンド（大型） ==========
export function LargeFlowerStand({ position = [0, 0, 0], color = '#ffffff' }) {
  const flowers = useMemo(() => {
    const result = []
    // 階段状に花を配置
    for (let tier = 0; tier < 3; tier++) {
      const count = 8 - tier * 2
      const radius = 0.35 - tier * 0.08
      const y = 0.8 + tier * 0.25

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2
        result.push({
          position: [
            Math.cos(angle) * radius,
            y + Math.random() * 0.1,
            Math.sin(angle) * radius
          ],
          scale: 0.08 + Math.random() * 0.04,
          isGreen: Math.random() > 0.7
        })
      }
    }
    // 中央にも
    for (let i = 0; i < 5; i++) {
      result.push({
        position: [
          (Math.random() - 0.5) * 0.2,
          1.3 + Math.random() * 0.2,
          (Math.random() - 0.5) * 0.2
        ],
        scale: 0.1 + Math.random() * 0.05,
        isGreen: false
      })
    }
    return result
  }, [])

  return (
    <group position={position}>
      {/* スタンド */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.15, 0.7, 12]} />
        <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ベース */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.28, 0.04, 24]} />
        <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* 花器 */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.2, 0.15, 16]} />
        <meshStandardMaterial color="#2c1810" roughness={0.5} />
      </mesh>

      {/* 花 */}
      {flowers.map((flower, i) => (
        <mesh key={i} position={flower.position} castShadow>
          <icosahedronGeometry args={[flower.scale, 1]} />
          <meshStandardMaterial
            color={flower.isGreen ? '#228b22' : color}
            roughness={0.8}
          />
        </mesh>
      ))}

      {/* リボン */}
      <mesh position={[0, 0.5, 0.12]} castShadow>
        <boxGeometry args={[0.1, 0.25, 0.01]} />
        <meshStandardMaterial color="#4a0080" roughness={0.7} />
      </mesh>

      {/* 名札 */}
      <mesh position={[0, 0.25, 0.1]}>
        <planeGeometry args={[0.12, 0.18]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
    </group>
  )
}

// ========== 天井照明器具 ==========
export function CeilingLight({ position = [0, 0, 0], type = 'chandelier' }) {
  if (type === 'chandelier') {
    return (
      <group position={position}>
        {/* チェーン */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* シャンデリア本体 */}
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.2, 0.15, 24]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* ライト部分 */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2
          return (
            <group key={i} position={[Math.cos(angle) * 0.3, -0.1, Math.sin(angle) * 0.3]}>
              <mesh>
                <sphereGeometry args={[0.04, 12, 12]} />
                <meshBasicMaterial color="#fffaee" />
              </mesh>
              <pointLight intensity={0.3} color="#fff8ee" distance={3} />
            </group>
          )
        })}
      </group>
    )
  }

  // 蛍光灯タイプ
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.2, 0.05, 0.15]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.03, 0]}>
        <boxGeometry args={[1.1, 0.02, 0.1]} />
        <meshBasicMaterial color="#f8f8ff" />
      </mesh>
      <pointLight position={[0, -0.1, 0]} intensity={1} color="#f8f8ff" distance={5} />
    </group>
  )
}
