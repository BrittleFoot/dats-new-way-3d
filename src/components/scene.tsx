/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useCameraControls } from '@/lib/hooks'
import { Point } from '@/lib/type'
import { animated, useSpring } from '@react-spring/three'
import { CameraControls, Environment, Line, Sparkles } from '@react-three/drei'
import { Canvas, ThreeElements } from '@react-three/fiber'
import {
    memo,
    PropsWithChildren,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {
    BoxGeometry,
    Color,
    InstancedBufferAttribute,
    InstancedMesh,
    Matrix4,
    Mesh,
    MeshStandardMaterial,
    SphereGeometry,
} from 'three'
import { useConfig } from './config'
import { KeyControlsHandler, KeyControlsProvider } from './key'
import { useWorld, useWorldCursor } from './world'

type PositionProps = {
    x: number
    y: number
    z: number
}

function posHash(x: number, y: number, z: number) {
    return x + y * 1000 + z * 1_000_000
}

function SnakeBody({
    position,
    color,
    ...props
}: { position: Point; color: Color } & ThreeElements['mesh']) {
    const meshRef = useRef<Mesh>(null!)
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)

    const spring = useSpring({
        position: position,
    })

    return (
        <animated.mesh
            {...props}
            position={spring.position}
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
            <meshStandardMaterial color={color} opacity={0.5} transparent />
        </animated.mesh>
    )
}
const EnemyBody = memo(function EnemyBody({
    x,
    y,
    z,
    color,
    ...props
}: PositionProps & { color: number } & ThreeElements['mesh']) {
    const meshRef = useRef<Mesh>(null!)

    return (
        <mesh
            {...props}
            position={[x, y, z]}
            ref={meshRef}
            onClick={(e) => {
                e.stopPropagation()
            }}
            onPointerOver={(e) => {
                e.stopPropagation()
            }}
            onPointerOut={(e) => {
                e.stopPropagation()
            }}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={new Color(color)} />
        </mesh>
    )
})
EnemyBody.displayName = 'EnemyBody'

function Oranges() {
    const {
        world: {
            parsedFood,
            specialFood: { golden },
        },
    } = useWorld()

    const instancedOranges = useMemo(() => {
        const geometry = new SphereGeometry(0.5, 16, 16) // Sphere geometry for oranges
        const material = new MeshStandardMaterial({ vertexColors: true }) // Enable vertex colors
        const instancedMesh = new InstancedMesh(
            geometry,
            material,
            parsedFood.length,
        )

        const colors = new Float32Array(parsedFood.length * 3) // RGB color for each instance
        parsedFood.forEach(({ c: [x, y, z], type }, i) => {
            const matrix = new Matrix4()
            matrix.setPosition(x, y, z)
            instancedMesh.setMatrixAt(i, matrix)

            // Assign color based on type
            const color = new Color()
            if (type === 'golden') {
                color.set(0xffff00) // Yellow
            } else if (type === 'suspicious') {
                color.set(0x99ff22) // Greenish
            } else {
                color.set(0xffa500) // Orange
            }
            colors.set(color.toArray(), i * 3)
        })

        instancedMesh.instanceMatrix.needsUpdate = true // Notify Three.js of matrix updates
        instancedMesh.geometry.setAttribute(
            'color',
            new InstancedBufferAttribute(colors, 3),
        ) // Add colors
        return instancedMesh
    }, [parsedFood])

    return (
        <>
            <primitive object={instancedOranges} />
            {golden.map(([x, y, z], i) => (
                <group key={i} position={[x, y, z]}>
                    <Sparkles scale={2} color={0xffff00} size={20} />
                </group>
            ))}
        </>
    )
}

const Wall = memo(({ x, y, z }: PositionProps) => {
    console.log('render wall')
    return (
        <mesh position={[x, y, z]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
                color={new Color(0xffffff)}
                transparent
                opacity={0.8}
            />
        </mesh>
    )
})
Wall.displayName = 'Wall'

function Walls() {
    const { world } = useWorld()

    const walls = useMemo(() => {
        const geometry = new BoxGeometry(1, 1, 1)
        const material = new MeshStandardMaterial({
            color: 0xaa6666,
            transparent: true,
            opacity: 0.5,

            polygonOffset: true,
            polygonOffsetFactor: 1, // Avoid z-fighting
            polygonOffsetUnits: 1,
        })
        const instancedMesh = new InstancedMesh(
            geometry,
            material,
            world.fences.length,
        )

        instancedMesh.frustumCulled = true

        world.fences.forEach(([x, y, z], i) => {
            const matrix = new Matrix4()
            matrix.setPosition(x, y, z)
            instancedMesh.setMatrixAt(i, matrix)
        })

        instancedMesh.instanceMatrix.needsUpdate = true
        return instancedMesh
    }, [world.fences])

    return <primitive object={walls} />
}

function Walls2({ wallPoints }: { wallPoints: Point[] }) {
    const walls = useMemo(() => {
        const geometry = new BoxGeometry(1, 1, 1)
        const material = new MeshStandardMaterial({
            color: 0xaa6666,
            transparent: true,
            opacity: 0.5,

            polygonOffset: true,
            polygonOffsetFactor: 1, // Avoid z-fighting
            polygonOffsetUnits: 1,
        })
        const instancedMesh = new InstancedMesh(
            geometry,
            material,
            wallPoints.length,
        )

        instancedMesh.frustumCulled = true

        wallPoints.forEach(([x, y, z], i) => {
            const matrix = new Matrix4()
            matrix.setPosition(x, y, z)
            instancedMesh.setMatrixAt(i, matrix)
        })

        instancedMesh.instanceMatrix.needsUpdate = true
        return instancedMesh
    }, [wallPoints])

    return <primitive object={walls} />
}

/**
 * React component to manage and render walls.
 */
function WallsRenderer() {
    const { world } = useWorld()

    const [parsedWalls, setParsedWalls] = useState<typeof world.parsedWalls>(
        new Map(),
    )

    useEffect(() => {
        const newChunks = world.parsedWalls

        setParsedWalls((currentChunks) => {
            const updatedChunks = new Map<string, Point[]>()

            // Iterate over new chunks
            newChunks.forEach((newPoints, key) => {
                const currentPoints = currentChunks.get(key)

                // Update only if the chunk size has changed
                if (
                    !currentPoints ||
                    currentPoints.length !== newPoints.length
                ) {
                    updatedChunks.set(key, newPoints)
                } else {
                    updatedChunks.set(key, currentPoints)
                }
            })

            // Retain only the chunks that are still in the newChunks
            currentChunks.forEach((_, key) => {
                if (!newChunks.has(key)) {
                    updatedChunks.delete(key)
                }
            })

            return updatedChunks
        })
    }, [world.parsedWalls]) // Runs whenever `world.parsedWalls` changes

    return (
        <>
            {Array.from(parsedWalls.entries()).map(([key, walls]) => (
                <Walls2 key={key} wallPoints={walls} />
            ))}
        </>
    )
}

function Each({ children }: PropsWithChildren) {
    return <>{children}</>
}

function SlickSnake({ snake }: { snake: { geometry: Point[] } }) {
    return <Line points={snake.geometry} color={'green'} lineWidth={5} />
}

function Snakes() {
    const { world } = useWorld()

    return (
        <>
            {world.snakes.map((snake) => (
                <Each key={snake.id}>
                    <SlickSnake snake={snake} />
                    <SnakeBody
                        position={snake.geometry[0]}
                        color={new Color(0xff6600)}
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

function Enemies() {
    const { world } = useWorld()

    const instancedEnemies = useMemo(() => {
        const totalInstances = world.enemies.reduce(
            (count, { geometry }) => count + geometry.length,
            0,
        )
        const geometry = new BoxGeometry(1, 1, 1)
        const material = new MeshStandardMaterial({ vertexColors: true }) // Enable vertex colors
        const instancedMesh = new InstancedMesh(
            geometry,
            material,
            totalInstances,
        )

        const colors = new Float32Array(totalInstances * 3) // RGB per instance
        let instanceIndex = 0

        world.enemies.forEach(({ geometry: [[hx, hy, hz], ...body] }) => {
            const headMatrix = new Matrix4()
            headMatrix.setPosition(hx, hy, hz)
            instancedMesh.setMatrixAt(instanceIndex, headMatrix)
            colors.set([0, 0, 1], instanceIndex * 3) // Blue for head
            instanceIndex++

            body.forEach(([x, y, z]) => {
                const bodyMatrix = new Matrix4()
                bodyMatrix.setPosition(x, y, z)
                instancedMesh.setMatrixAt(instanceIndex, bodyMatrix)
                colors.set([0.4, 0.2, 1], instanceIndex * 3) // Purple for body
                instanceIndex++
            })
        })

        instancedMesh.instanceMatrix.needsUpdate = true
        instancedMesh.geometry.setAttribute(
            'color',
            new InstancedBufferAttribute(colors, 3),
        ) // Set colors
        return instancedMesh
    }, [world.enemies])

    return <primitive object={instancedEnemies} />
}

function BoundingBox() {
    const {
        world: {
            mapSize: [boxX, boxY, boxZ],
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

const World = memo(() => {
    return (
        <>
            <BoundingBox />
            <Snakes />
            <Oranges />
            <Enemies />
            <WallsRenderer />
        </>
    )
})
World.displayName = 'World'

function SnakeScene() {
    const { world } = useWorld()
    const { next } = useWorldCursor()

    const { mapSize } = world
    const { config, insertConfig } = useConfig()
    const cc = useCameraControls()

    if (config.cameraControls !== cc) {
        insertConfig({ cameraControls: cc ?? undefined })
    }

    if (!config.selectedSnakeId) {
        const snake = world.snakes.find((snake) => snake.status === 'alive')
        if (snake) {
            insertConfig({ selectedSnakeId: snake.id })
        }
    }

    if (cc && config.followSnake && config.selectedSnakeId) {
        const snake = world.snakes.find(
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
        }, world.tickRemainMs)

        return () => clearTimeout(timeout)
    }, [config.playback, world, next])

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
            <Environment preset="sunset" />
            {/* <Sky
                sunPosition={new Vector3(...mapSize.map((v) => v * 2))}
                turbidity={0.1}
                rayleigh={0.001}
            /> */}
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
