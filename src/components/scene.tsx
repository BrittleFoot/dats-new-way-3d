/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import {
    CameraControls,
    KeyboardControls,
    useKeyboardControls,
} from '@react-three/drei'
import { Canvas, ThreeElements, useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

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
function KeyControlsProvider({ children }: { children: React.ReactNode }) {
    return (
        <KeyboardControls
            map={[
                { name: 'forward', keys: ['ArrowUp', 'w', 'W', 'ц', 'Ц'] },
                { name: 'backward', keys: ['ArrowDown', 's', 'S', 'ы', 'Ы'] },
                { name: 'left', keys: ['ArrowLeft', 'a', 'A', 'ф', 'Ф'] },
                { name: 'right', keys: ['ArrowRight', 'd', 'D', 'в', 'В'] },
                { name: 'jump', keys: ['Space'] },
                { name: 'crouch', keys: ['ShiftLeft', 'ShiftRight'] },
            ]}
        >
            {children}
        </KeyboardControls>
    )
}

function KeyControlsHandler() {
    const controls = useThree((state) => state.controls) as CameraControls
    const [_, get] = useKeyboardControls()

    const SPEED = 0.1

    useFrame((_, delta) => {
        const { forward, backward, left, right, jump, crouch } = get()

        if (forward) controls.forward(SPEED)
        if (backward) controls.forward(-SPEED)
        if (jump) controls.elevate(SPEED)
        if (crouch) controls.elevate(-SPEED)

        // if (left) controls.moveRight(-SPEED)
        // if (right) controls.moveRight(SPEED)
    })

    return <></>
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
