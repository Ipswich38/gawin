"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, MeshTransmissionMaterial, RoundedBox } from "@react-three/drei"
import type * as THREE from "three"

type VoiceState = "idle" | "listening" | "processing" | "speaking"

interface IceCubeProps {
  state: VoiceState
  onClick?: () => void
}

function IceCube({ state, onClick }: IceCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Optimized rotation speed based on state
  const rotationSpeed = useMemo(() => {
    switch (state) {
      case "listening":
        return 0.8
      case "processing":
        return 1.2
      case "speaking":
        return 1.6
      default:
        return 0.4
    }
  }, [state])

  // Color based on state
  const color = useMemo(() => {
    switch (state) {
      case "listening":
        return "#60a5fa" // blue
      case "processing":
        return "#f59e0b" // amber
      case "speaking":
        return "#10b981" // emerald
      default:
        return "#e2e8f0" // lighter gray
    }
  }, [state])

  useFrame((frameState, delta) => {
    if (meshRef.current) {
      // Smooth delta-based animation
      const breathingScale = 1 + Math.sin(frameState.clock.elapsedTime * 1.8) * 0.08
      const stateScale = state === "listening" ? 1.12 : state === "speaking" ? 1.08 : 1
      meshRef.current.scale.setScalar(breathingScale * stateScale)

      // Delta-based rotation for consistent speed
      meshRef.current.rotation.x += delta * rotationSpeed
      meshRef.current.rotation.y += delta * rotationSpeed * 0.8
      meshRef.current.rotation.z += delta * rotationSpeed * 0.4
    }
  })

  return (
    <mesh ref={meshRef} onClick={onClick}>
      <RoundedBox args={[2.2, 2.2, 2.2]} radius={0.6} smoothness={3}>
        <MeshTransmissionMaterial
          color={color}
          thickness={0.4}
          roughness={0.08}
          transmission={0.92}
          ior={1.25}
          chromaticAberration={0.06}
          backside={true}
          samples={16} // Reduced for performance
          resolution={512} // Reduced for performance
          distortion={0.15}
          distortionScale={0.25}
          temporalDistortion={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
        />
      </RoundedBox>
    </mesh>
  )
}

export function GawinIceCube({ state, onClick }: IceCubeProps) {
  return (
    <div
      className="w-full h-full cursor-pointer touch-manipulation"
      onClick={onClick}
      onTouchEnd={onClick}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 55 }}
        gl={{
          antialias: false, // Disabled for performance
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: false
        }}
        dpr={1} // Lock to 1 for consistent performance
        frameloop="always" // Keep running for smooth animation
        performance={{ min: 0.5, max: 1, debounce: 100 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[8, 8, 4]} intensity={0.8} />
        <Environment preset="city" />
        <IceCube state={state} onClick={onClick} />
      </Canvas>
    </div>
  )
}