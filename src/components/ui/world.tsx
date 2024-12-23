'use client'

import { Food, GameState, WORLD_ZERO } from '@/lib/type'
import { createContext, ReactNode, useContext } from 'react'

const WorldContext = createContext<GameState>(WORLD_ZERO)

export const WorldProvider = ({
    children,
    world,
}: {
    world: GameState
    children: ReactNode
}) => {
    return (
        <WorldContext.Provider value={world}>{children}</WorldContext.Provider>
    )
}

export const useWorld = () => {
    const rawWorld = useContext(WorldContext)
    if (!rawWorld) {
        throw new Error('useConfig must be used within a WorldProvider')
    }

    const golden = new Set(rawWorld.specialFood.golden.map((c) => c.join(',')))
    const sus = new Set(rawWorld.specialFood.suspicious.map((c) => c.join(',')))

    const getType = (food: Food) => {
        const c = food.c.join(',')
        if (golden.has(c)) return 'golden'
        if (sus.has(c)) return 'suspicious'
        return 'normal'
    }

    const food = rawWorld.food.map(
        (f) =>
            ({
                c: f.c,
                points: f.points,
                type: getType(f),
            }) as Food,
    )

    return {
        rawWorld,
        food,
    }
}
