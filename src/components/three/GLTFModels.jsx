/**
 * GLTFモデルコンポーネント
 *
 * このファイルはGLTFモデルを読み込んで表示するためのコンポーネント集です。
 *
 * モデルの追加方法:
 * 1. public/models/ 以下にGLB/GLTFファイルを配置
 * 2. このファイルにコンポーネントを追加
 * 3. FuneralScene.jsxで使用
 *
 * 推奨ダウンロード元:
 * - Sketchfab (https://sketchfab.com) - 要ログイン、GLB形式でダウンロード可
 * - Poly Haven (https://polyhaven.com/models) - CC0ライセンス
 */

import { useGLTF, Clone } from '@react-three/drei'
import { useMemo, Suspense } from 'react'
import * as THREE from 'three'

// Preload models (run at module load time)
try {
  useGLTF.preload('/models/flowers/flower.glb')
} catch (e) {
  console.log('Flower model not found - using procedural fallback')
}

/**
 * GLTFフラワーモデル
 * Three.jsサンプルの花モデルを使用
 */
export function GLTFFlower({ position = [0, 0, 0], scale = 1, color }) {
  try {
    const { scene } = useGLTF('/models/flowers/flower.glb')

    // Clone and modify color if needed
    const clonedScene = useMemo(() => {
      const clone = scene.clone()
      if (color) {
        clone.traverse((child) => {
          if (child.isMesh) {
            child.material = child.material.clone()
            child.material.color = new THREE.Color(color)
          }
        })
      }
      return clone
    }, [scene, color])

    return (
      <primitive
        object={clonedScene}
        position={position}
        scale={scale}
        castShadow
        receiveShadow
      />
    )
  } catch (e) {
    // Fallback to simple geometry
    return (
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={color || '#ffb7c5'} />
      </mesh>
    )
  }
}

/**
 * 複数のGLTFフラワーをインスタンス配置
 */
export function GLTFFlowerArrangement({ count = 50, color, spread = 5 }) {
  const positions = useMemo(() => {
    const pos = []
    for (let i = 0; i < count; i++) {
      pos.push([
        (Math.random() - 0.5) * spread,
        0.5 + Math.random() * 2,
        (Math.random() - 0.5) * spread - 2,
      ])
    }
    return pos
  }, [count, spread])

  return (
    <group>
      {positions.map((pos, i) => (
        <Suspense key={i} fallback={null}>
          <GLTFFlower
            position={pos}
            scale={0.3 + Math.random() * 0.3}
            color={color}
          />
        </Suspense>
      ))}
    </group>
  )
}

/**
 * GLTFモデルローダー（汎用）
 *
 * 使用例:
 * <GLTFModel path="/models/coffin/luxury.glb" position={[0, 0, 0]} scale={1} />
 */
export function GLTFModel({ path, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, onLoad }) {
  try {
    const { scene } = useGLTF(path)

    if (onLoad) {
      onLoad(scene)
    }

    return (
      <primitive
        object={scene.clone()}
        position={position}
        rotation={rotation}
        scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
        castShadow
        receiveShadow
      />
    )
  } catch (e) {
    console.warn(`Failed to load model: ${path}`)
    return null
  }
}

/**
 * 棺モデル（GLTFがあれば使用、なければプロシージャル）
 */
export function GLTFCoffin({ type = 'standard', position = [0, 0, 0] }) {
  const modelPaths = {
    standard: '/models/coffin/standard.glb',
    cloth: '/models/coffin/cloth.glb',
    luxury: '/models/coffin/luxury.glb',
  }

  try {
    const { scene } = useGLTF(modelPaths[type])
    return (
      <primitive
        object={scene.clone()}
        position={position}
        castShadow
        receiveShadow
      />
    )
  } catch (e) {
    // Return null - fallback handled in parent component
    return null
  }
}

/**
 * 祭壇モデル（GLTFがあれば使用）
 */
export function GLTFAltar({ theme = 'modern', position = [0, 0, 0] }) {
  const modelPaths = {
    traditional: '/models/altar/traditional.glb',
    modern: '/models/altar/modern.glb',
    nature: '/models/altar/nature.glb',
  }

  try {
    const { scene } = useGLTF(modelPaths[theme])
    return (
      <primitive
        object={scene.clone()}
        position={position}
        castShadow
        receiveShadow
      />
    )
  } catch (e) {
    return null
  }
}

/**
 * 椅子モデル
 */
export function GLTFChair({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  try {
    const { scene } = useGLTF('/models/furniture/chair.glb')
    return (
      <primitive
        object={scene.clone()}
        position={position}
        rotation={rotation}
        scale={1}
        castShadow
      />
    )
  } catch (e) {
    return null
  }
}

// Export a helper to check if a model exists
export function useModelExists(path) {
  try {
    useGLTF(path)
    return true
  } catch {
    return false
  }
}
