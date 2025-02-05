'use client'

import { BETTER_WORLD_ZERO, GameStateImproved } from '@/lib/type'
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'
import { useReplayStream } from './stream/stream'

type WorldContextType = {
    world: GameStateImproved
    seek: (cursor: number) => void
}

type WorldCursorType = {
    cursor: number
    setCursor: (cursor: number) => void
    maxCursor: number
}

const WorldContext = createContext<WorldContextType>(null!)
const WorldCursor = createContext<WorldCursorType>(null!)

export const WorldProvider = ({ children }: { children: ReactNode }) => {
    const startTurn = 500
    const { snapshots, seek } = useReplayStream('snake3d-final-5-buft', {
        rate: 1 / 8,
        turn: startTurn,
        combo: 2,
    })

    const [cursor, _setCursor] = useState(startTurn)
    const [latestWorld, setLatestWorld] =
        useState<GameStateImproved>(BETTER_WORLD_ZERO)

    const setCursor = useCallback(
        (cursor: number) => {
            const next = Math.max(0, Math.min(cursor, snapshots.length - 1))
            _setCursor(next)
        },
        [snapshots.length],
    )

    const world = snapshots[cursor]?.data ?? latestWorld ?? BETTER_WORLD_ZERO

    if (latestWorld !== world) {
        setLatestWorld(world)
    }

    const worldValue = useMemo(
        () => ({
            world,
            seek,
        }),
        [world, seek],
    )

    const cursorValue = useMemo(
        () => ({
            cursor,
            setCursor,
            maxCursor: snapshots.length,
        }),
        [cursor, snapshots.length],
    )

    return (
        <WorldContext.Provider value={worldValue}>
            <WorldCursor.Provider value={cursorValue}>
                {children}
            </WorldCursor.Provider>
        </WorldContext.Provider>
    )
}

export const useWorld = () => {
    const worldContext = useContext(WorldContext)

    if (!worldContext) {
        throw new Error('useWrold must be used within a WorldProvider')
    }

    return worldContext
}

export const useWorldCursor = () => {
    const cursorContext = useContext(WorldCursor)

    if (!cursorContext) {
        throw new Error('useWorldCursor must be used within a WorldProvider')
    }

    const next = useCallback(
        () => cursorContext.setCursor(cursorContext.cursor + 1),
        [cursorContext],
    )

    return {
        ...cursorContext,
        next,
    }
}
