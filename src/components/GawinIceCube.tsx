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
  const materialRef = useRef<any>(null)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768

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

  // Dynamic color calculation function
  const calculateColor = (time: number) => {
    const baseHue = 180 // Turquoise base

    switch (state) {
      case "listening":
        // Bright turquoise with subtle blue shift
        const listeningHue = baseHue + Math.sin(time * 0.8) * 20
        const listeningSat = 75 + Math.sin(time * 0.6) * 15
        const listeningLight = 60 + Math.sin(time * 1.2) * 15
        return `hsl(${listeningHue}, ${listeningSat}%, ${listeningLight}%)`
      case "processing":
        // Turquoise with warm amber hints
        const processingHue = baseHue - 30 + Math.sin(time * 1.5) * 40
        const processingSat = 80 + Math.sin(time * 0.9) * 20
        const processingLight = 55 + Math.sin(time * 1.8) * 20
        return `hsl(${processingHue}, ${processingSat}%, ${processingLight}%)`
      case "speaking":
        // Vibrant turquoise with green undertones
        const speakingHue = baseHue + 10 + Math.sin(time * 1.0) * 15
        const speakingSat = 85 + Math.sin(time * 0.7) * 15
        const speakingLight = 65 + Math.sin(time * 1.5) * 15
        return `hsl(${speakingHue}, ${speakingSat}%, ${speakingLight}%)`
      default:
        // Gentle turquoise idle state
        const idleHue = baseHue + Math.sin(time * 0.3) * 10
        const idleSat = 65 + Math.sin(time * 0.4) * 10
        const idleLight = 50 + Math.sin(time * 0.5) * 10
        return `hsl(${idleHue}, ${idleSat}%, ${idleLight}%)`
    }
  }

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

      // Update dynamic color in real-time
      if (materialRef.current) {
        const newColor = calculateColor(frameState.clock.elapsedTime)
        materialRef.current.color.set(newColor)
      }
    }
  })

  return (
    <mesh ref={meshRef} onClick={onClick}>
      <RoundedBox args={[2.2, 2.2, 2.2]} radius={0.6} smoothness={3}>
        <MeshTransmissionMaterial
          ref={materialRef}
          color="#14b8a6" // Initial turquoise color
          thickness={0.4}
          roughness={0.08}
          transmission={0.92}
          ior={1.25}
          chromaticAberration={0.06}
          backside={true}
          samples={isDesktop ? 16 : 8} // Fewer samples on mobile
          resolution={isDesktop ? 512 : 256} // Lower resolution on mobile
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
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768;
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  return (
    <div
      className="w-full h-full cursor-pointer touch-manipulation"
      onClick={onClick}
      onTouchEnd={onClick}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 55 }}
        gl={{
          antialias: isDesktop, // Enable on desktop, disable on mobile
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: false,
          preserveDrawingBuffer: false
        }}
        dpr={Math.min(devicePixelRatio, 2)} // Cap at 2x for performance
        frameloop="always" // Keep running for smooth animation
        performance={{ min: 0.4, max: 1, debounce: 200 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[8, 8, 4]} intensity={0.8} />
        <Environment preset="city" />
        <IceCube state={state} onClick={onClick} />
      </Canvas>
    </div>
  )
}