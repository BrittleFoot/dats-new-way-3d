/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { CameraControls } from '@react-three/drei'
import { Canvas, ThreeElements, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { KeyControlsHandler, KeyControlsProvider } from './key'

function Box(props: ThreeElements['mesh']) {
    const meshRef = useRef<THREE.Mesh>(null!)
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)

    useFrame((state, delta) => (meshRef.current.rotation.x += delta))

    return (
        <mesh
            {...props}
            ref={meshRef}
            scale={active ? 1.5 : 1}
            onClick={(e) => {
                e.stopPropagation()
                setActive(!active)
            }}
            onPointerOver={(e) => {
                e.stopPropagation()
                setHover(true)
            }}
            onPointerOut={(e) => {
                e.stopPropagation()
                setHover(false)
            }}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : '#2f74c0'} />
        </mesh>
    )
}

export function Scene() {
    return (
        <KeyControlsProvider>
            <Canvas shadows>
                <ambientLight intensity={Math.PI / 2} />
                <spotLight
                    position={[10, 10, 10]}
                    angle={0.15}
                    penumbra={1}
                    decay={0}
                    intensity={Math.PI}
                />
                <pointLight
                    position={[-10, -10, -10]}
                    decay={0}
                    intensity={Math.PI}
                />
                <Box position={[-1, 0, 0]} />
                <Box position={[1, 0, 0]} />

                <KeyControlsHandler />
                <CameraControls makeDefault />
            </Canvas>
        </KeyControlsProvider>
    )
}
