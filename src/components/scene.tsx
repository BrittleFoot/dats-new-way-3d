/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { replay } from '@/actions/replay'
import { Food, Point } from '@/lib/type'
import { CameraControls } from '@react-three/drei'
import { Canvas, ThreeElements, useFrame } from '@react-three/fiber'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { Color, Mesh } from 'three'
import { KeyControlsHandler, KeyControlsProvider } from './key'
import { useWorld, WorldProvider } from './ui/world'

function Template({ color, props }: ThreeElements['mesh'] & { color?: Color }) {
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

function Food() {
    const { food } = useWorld()

    return (
        <>
            {food.map((food) => (
                <Orange key={food.c.toString()} food={food} />
            ))}
        </>
    )
}

function Snakes() {
    const { rawWorld: world } = useWorld()

    return (
        <>
            {world.snakes.map((snake) => (
                <>
                    <SnakeBody
                        key={snake.id}
                        position={snake.geometry[0]}
                        color={new Color(0xff0000)}
                    />
                    {snake.geometry.slice(1).map((point, i) => (
                        <SnakeBody
                            key={i}
                            position={point}
                            color={new Color(0x00ff00)}
                        />
                    ))}
                </>
            ))}
        </>
    )
}

export function World() {
    return (
        <>
            <Snakes />
            <Food />
        </>
    )
}

export function Scene() {
    const [maxPages, setMaxPages] = useState(0)

    const query = useInfiniteQuery({
        queryKey: ['scene'],
        queryFn: async ({ pageParam }) => {
            const data = await replay(pageParam)
            setMaxPages(data.framesCount)
            return data
        },
        initialPageParam: 0,
        maxPages: maxPages,
        getNextPageParam: ({ frame, framesCount }) =>
            frame === framesCount ? undefined : frame + 1,
        getPreviousPageParam: ({ frame }) =>
            frame === 0 ? undefined : frame - 1,
    })

    const currentScene = query.data?.pages.find((e) => e)

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

                {currentScene && (
                    <WorldProvider world={currentScene.state}>
                        <World />
                    </WorldProvider>
                )}

                <KeyControlsHandler />
                <CameraControls makeDefault />
            </Canvas>
        </KeyControlsProvider>
    )
}
