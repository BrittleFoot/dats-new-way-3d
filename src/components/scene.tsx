/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useCameraControls } from '@/lib/hooks'
import { Food, Point } from '@/lib/type'
import { CameraControls, Sky } from '@react-three/drei'
import { Canvas, ThreeElements, useFrame } from '@react-three/fiber'
import { PropsWithChildren, useRef, useState } from 'react'
import { Color, Mesh } from 'three'
import { useConfig } from './config'
import { KeyControlsHandler, KeyControlsProvider } from './key'
import { useWorld } from './ui/world'

function Template({
    color,
    ...props
}: ThreeElements['mesh'] & { color?: Color }) {
    const meshRef = useRef<Mesh>(null!)
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
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

function SnakeBody({
    position,
    color,
    ...props
}: { position: Point; color: Color } & ThreeElements['mesh']) {
    const meshRef = useRef<Mesh>(null!)
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)

    return (
        <mesh
            {...props}
            position={position}
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
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

function Orange({ food }: { food: Food }) {
    const color = new Color(0xffa500)
    if (food.type === 'golden') {
        color.set(0xffff00)
    }
    if (food.type === 'suspicious') {
        color.set(0x99ff22)
    }

    return (
        <mesh position={food.c}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

function Oranges() {
    const { food } = useWorld()

    return (
        <>
            {food.map((food) => (
                <Orange key={food.c.toString()} food={food} />
            ))}
        </>
    )
}

function Each({ children }: PropsWithChildren) {
    return <>{children}</>
}

function Snakes() {
    const { rawWorld: world } = useWorld()

    return (
        <>
            {world.snakes.map((snake) => (
                <Each key={snake.id}>
                    <SnakeBody
                        position={snake.geometry[0]}
                        color={new Color(0xff0000)}
                    />
                    {snake.geometry.slice(1).map((point, i) => (
                        <SnakeBody
                            key={`${snake.id}-${i}`}
                            position={point}
                            color={new Color(0x00ff00)}
                        />
                    ))}
                </Each>
            ))}
        </>
    )
}

export function World() {
    return (
        <>
            <Snakes />
            <Oranges />
        </>
    )
}

function SnakeScene() {
    const { rawWorld } = useWorld()
    const { config, insertConfig } = useConfig()
    const camera = useCameraControls()

    if (config.cameraControls !== camera) {
        insertConfig({ cameraControls: camera ?? undefined })
    }

    if (!config.selectedSnakeId) {
        const snake = rawWorld.snakes.find((snake) => snake.status === 'alive')
        if (snake) {
            insertConfig({ selectedSnakeId: snake.id })
        }
    }

    return (
        <>
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
            <World />
            <Sky
                sunPosition={[300, 300, 300]}
                turbidity={0.1}
                rayleigh={0.001}
            />
        </>
    )
}

export function Scene() {
    return (
        <KeyControlsProvider>
            <Canvas shadows>
                <SnakeScene />
                <CameraControls makeDefault />
                <KeyControlsHandler />
            </Canvas>
        </KeyControlsProvider>
    )
}
