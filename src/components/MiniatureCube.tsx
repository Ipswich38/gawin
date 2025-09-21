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

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.x += 0.003
      meshRef.current.rotation.y += 0.005

      // Subtle breathing animation
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      const activeScale = isActive ? 1.1 : 1
      meshRef.current.scale.setScalar(breathingScale * activeScale)
    }
  })

  return (
    <mesh ref={meshRef}>
      <RoundedBox args={[1, 1, 1]} radius={0.3} smoothness={4}>
        <meshPhongMaterial
          color={isActive ? "#60a5fa" : "#e5e7eb"}
          transparent
          opacity={0.8}
        />
      </RoundedBox>
    </mesh>
  )
}

export function MiniatureCube({ isActive = false, size = 32, onClick }: MiniatureCubeProps) {
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
      onTouchEnd={onClick} // Add touch support for mobile
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1} // Optimize for mobile
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 2]} intensity={0.8} />
        <MiniCube isActive={isActive} />
      </Canvas>
    </div>
  )
}