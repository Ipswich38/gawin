"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { RoundedBox } from "@react-three/drei"
import type * as THREE from "three"

interface MiniatureCubeProps {
  isActive?: boolean
  size?: number
  onClick?: () => void
}

function MiniCube({ isActive = false }: { isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth rotation with delta time for consistent speed
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.8

      // Optimized breathing animation
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08
      const activeScale = isActive ? 1.15 : 1
      meshRef.current.scale.setScalar(breathingScale * activeScale)
    }
  })

  return (
    <mesh ref={meshRef}>
      <RoundedBox args={[1.2, 1.2, 1.2]} radius={0.25} smoothness={3}>
        <meshPhongMaterial
          color={isActive ? "#60a5fa" : "#e2e8f0"}
          transparent
          opacity={isActive ? 0.9 : 0.85}
          shininess={100}
        />
      </RoundedBox>
    </mesh>
  )
}

export function MiniatureCube({ isActive = false, size = 56, onClick }: MiniatureCubeProps) {
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
          antialias: false, // Disable for better performance
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        dpr={1} // Lock to 1 for consistent performance
        frameloop="demand" // Only render when needed
        performance={{ min: 0.8 }} // Maintain 80% performance
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[1, 1, 1]} intensity={0.7} />
        <MiniCube isActive={isActive} />
      </Canvas>
    </div>
  )
}