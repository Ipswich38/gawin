"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { RoundedBox, Environment, MeshTransmissionMaterial } from "@react-three/drei"
import type * as THREE from "three"

interface MiniatureCubeProps {
  isActive?: boolean
  size?: number
  onClick?: () => void
}

function MiniCube({ isActive = false }: { isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768

  // Dynamic color for active state - will be updated in useFrame
  const materialRef = useRef<any>(null)

  // Calculate dynamic color
  const calculateColor = (time: number) => {
    if (isActive) {
      const hue = 180 + Math.sin(time * 0.5) * 10 // Turquoise base with shift
      const saturation = 70 + Math.sin(time * 0.3) * 15
      const lightness = 55 + Math.sin(time * 0.7) * 10
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }
    return "#14b8a6" // Static turquoise when inactive
  }

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth rotation with delta time for consistent speed
      meshRef.current.rotation.x += delta * 0.6
      meshRef.current.rotation.y += delta * 0.8
      meshRef.current.rotation.z += delta * 0.4

      // Enhanced breathing animation
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.08
      const activeScale = isActive ? 1.12 : 1
      meshRef.current.scale.setScalar(breathingScale * activeScale)

      // Update dynamic color for active state
      if (materialRef.current && isActive) {
        const newColor = calculateColor(state.clock.elapsedTime)
        materialRef.current.color.set(newColor)
      }
    }
  })

  return (
    <mesh ref={meshRef}>
      <RoundedBox args={[1.2, 1.2, 1.2]} radius={0.3} smoothness={4}>
        <MeshTransmissionMaterial
          ref={materialRef}
          color="#14b8a6" // Initial turquoise color
          thickness={0.3}
          roughness={0.05}
          transmission={0.95}
          ior={1.2}
          chromaticAberration={0.04}
          backside={true}
          samples={isDesktop ? 8 : 4} // Fewer samples on mobile
          resolution={isDesktop ? 256 : 128} // Lower resolution on mobile
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          transparent
          opacity={isActive ? 0.95 : 0.9}
        />
      </RoundedBox>
    </mesh>
  )
}

export function MiniatureCube({ isActive = false, size = 56, onClick }: MiniatureCubeProps) {
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768;
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  return (
    <div
      className="cursor-pointer touch-manipulation"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size
      }}
      onClick={onClick}
      onTouchEnd={onClick}
    >
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 60 }}
        gl={{
          antialias: isDesktop, // Enable on desktop only
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false
        }}
        dpr={Math.min(devicePixelRatio, 2)} // Cap at 2x for performance
        frameloop="always" // Always render for smooth animation
        performance={{ min: 0.5, max: 1, debounce: 150 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[2, 2, 1]} intensity={0.8} />
        <Environment preset="city" />
        <MiniCube isActive={isActive} />
      </Canvas>
    </div>
  )
}