import { useState, useEffect, useMemo } from 'react'

// Performance tier detection for adaptive quality
export function useDevicePerformance() {
  const [tier, setTier] = useState('high')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Mobile detection
    const checkMobile = () => {
      const ua = navigator.userAgent
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const smallScreen = window.innerWidth < 768
      return mobile || (touchDevice && smallScreen)
    }

    // GPU detection (rough estimate)
    const checkGPU = () => {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) return 'low'

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase()

        // High-end GPUs
        if (renderer.includes('nvidia') || renderer.includes('radeon') ||
            renderer.includes('geforce') || renderer.includes('apple m')) {
          return 'high'
        }

        // Mid-range mobile GPUs
        if (renderer.includes('adreno 6') || renderer.includes('mali-g7') ||
            renderer.includes('apple gpu')) {
          return 'medium'
        }

        // Low-end / integrated
        if (renderer.includes('intel') || renderer.includes('adreno 5') ||
            renderer.includes('mali')) {
          return 'low'
        }
      }

      // Fallback: check by device memory
      if (navigator.deviceMemory) {
        if (navigator.deviceMemory >= 8) return 'high'
        if (navigator.deviceMemory >= 4) return 'medium'
        return 'low'
      }

      // Default to medium for unknown
      return 'medium'
    }

    const mobile = checkMobile()
    setIsMobile(mobile)

    // Mobile devices get lower tier by default
    if (mobile) {
      setTier('low')
    } else {
      setTier(checkGPU())
    }

    // Re-check on resize
    const handleResize = () => {
      setIsMobile(checkMobile())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Performance settings based on tier
  const settings = useMemo(() => ({
    // Flower instances
    flowerMultiplier: tier === 'high' ? 1 : tier === 'medium' ? 0.4 : 0.2,

    // Lighting
    maxPointLights: tier === 'high' ? 20 : tier === 'medium' ? 8 : 4,
    shadowMapSize: tier === 'high' ? 2048 : tier === 'medium' ? 1024 : 512,
    useShadows: tier !== 'low',

    // Effects
    enablePostProcessing: tier === 'high',
    enableParticles: tier !== 'low',
    enableGodRays: tier === 'high',

    // Geometry complexity
    geometryDetail: tier === 'high' ? 1 : tier === 'medium' ? 0.7 : 0.5,

    // Chandelier
    chandelierLights: tier === 'high' ? 6 : tier === 'medium' ? 2 : 0,

    // Animation
    enableAnimations: tier !== 'low',

    // Render
    pixelRatio: tier === 'high' ? window.devicePixelRatio : tier === 'medium' ? Math.min(window.devicePixelRatio, 1.5) : 1,
    antialias: tier !== 'low',
  }), [tier])

  return { tier, isMobile, settings }
}

// Static presets for SSR or initial render
export const performancePresets = {
  high: {
    flowerMultiplier: 1,
    maxPointLights: 20,
    shadowMapSize: 2048,
    useShadows: true,
    enablePostProcessing: true,
    enableParticles: true,
    enableGodRays: true,
    geometryDetail: 1,
    chandelierLights: 6,
    enableAnimations: true,
    pixelRatio: 2,
    antialias: true,
  },
  medium: {
    flowerMultiplier: 0.4,
    maxPointLights: 8,
    shadowMapSize: 1024,
    useShadows: true,
    enablePostProcessing: false,
    enableParticles: true,
    enableGodRays: false,
    geometryDetail: 0.7,
    chandelierLights: 2,
    enableAnimations: true,
    pixelRatio: 1.5,
    antialias: true,
  },
  low: {
    flowerMultiplier: 0.2,
    maxPointLights: 4,
    shadowMapSize: 512,
    useShadows: false,
    enablePostProcessing: false,
    enableParticles: false,
    enableGodRays: false,
    geometryDetail: 0.5,
    chandelierLights: 0,
    enableAnimations: false,
    pixelRatio: 1,
    antialias: false,
  },
}
