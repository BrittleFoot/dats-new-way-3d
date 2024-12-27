/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useCameraControls } from '@/lib/hooks'
import { Food, Point } from '@/lib/type'
import {
    Box,
    CameraControls,
    CatmullRomLine,
    Line,
    Sky,
    Sphere,
    useFBX,
} from '@react-three/drei'
import { Canvas, ThreeElements } from '@react-three/fiber'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { Color, Mesh, Vector3 } from 'three'
import { useConfig } from './config'
import { KeyControlsHandler, KeyControlsProvider } from './key'
import { useWorld } from './ui/world'

function SnakeBody({
    position,
    color,
    ...props
}: { position: Point; color: Color } & ThreeElements['mesh']) {
    const meshRef = useRef<Mesh>(null!)
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)

    return (
        <Box
            {...props}
            position={position}
            ref={meshRef}
            scale={active ? 1.5 : 1}
            args={[1, 1, 1]}
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
            <meshStandardMaterial
                color={color}
                opacity={0.3}
                transparent
                forceSinglePass
            />
        </Box>
    )
}

function Orange({ food }: { food: Food }) {
    const model = useFBX('/orange.fbx')

    const color = new Color(0xffa500)
    if (food.type === 'golden') {
        color.set(0xffff00)
    }
    if (food.type === 'suspicious') {
        color.set(0x99ff22)
    }

    return (
        <>
            <Sphere position={food.c} args={[0.5, 8, 16]}>
                <meshStandardMaterial color={color} />
            </Sphere>
        </>
    )
}

function Oranges() {
    const {
        world: { food },
    } = useWorld()

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

function SlickSnake({ snake }: { snake: { geometry: Point[] } }) {
    return (
        <CatmullRomLine
            points={snake.geometry}
            color={'green'}
            lineWidth={5}
            tension={0.3}
            curveType="catmullrom"
            vertexColors={[
                [1, 0, 0],
                [0, 1, 0],
                [0, 1, 0],
            ]}
        />
    )
}

function Snakes() {
    const {
        world: { rawWorld },
    } = useWorld()

    return (
        <>
            {rawWorld.snakes.map((snake) => (
                <Each key={snake.id}>
                    <SlickSnake snake={snake} />
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

function BoundingBox() {
    const {
        world: {
            rawWorld: {
                mapSize: [boxX, boxY, boxZ],
            },
        },
    } = useWorld()

    const f1 = [
        [0, 0, 0],
        [0, 0, boxZ],
        [0, 0, 0],

        [boxX, 0, 0],
        [boxX, 0, boxZ],
        [boxX, 0, 0],

        [boxX, boxY, 0],
        [boxX, boxY, boxZ],
        [boxX, boxY, 0],

        [0, boxY, 0],
        [0, boxY, boxZ],
        [0, boxY, 0],

        [0, 0, 0],
        [0, 0, boxZ],
        [boxX, 0, boxZ],
        [boxX, boxY, boxZ],
        [0, boxY, boxZ],
        [0, 0, boxZ],
    ] as Point[]

    return <Line points={f1} color={'hotpink'} lineWidth={3} />
}

export function World() {
    return (
        <>
            <BoundingBox />
            <Snakes />
            <Oranges />
        </>
    )
}

function SnakeScene() {
    const {
        world: { rawWorld },
        next,
    } = useWorld()
    const { config, insertConfig } = useConfig()
    const cc = useCameraControls()
    const mapSize = rawWorld.mapSize

    if (config.cameraControls !== cc) {
        insertConfig({ cameraControls: cc ?? undefined })
    }

    if (!config.selectedSnakeId) {
        const snake = rawWorld.snakes.find((snake) => snake.status === 'alive')
        if (snake) {
            insertConfig({ selectedSnakeId: snake.id })
        }
    }

    if (cc && config.followSnake && config.selectedSnakeId) {
        const snake = rawWorld.snakes.find(
            (snake) => snake.id === config.selectedSnakeId,
        )

        if (snake) {
            cc.setTarget(...snake.geometry[0], true)
        }
    }

    useEffect(() => {
        if (config.playback !== 'play') {
            return
        }
        const timeout = setTimeout(() => {
            next()
        }, rawWorld.tickRemainMs / 10)

        return () => clearTimeout(timeout)
    }, [config.playback, rawWorld, next])

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
                sunPosition={new Vector3(...mapSize.map((v) => v * 2))}
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
