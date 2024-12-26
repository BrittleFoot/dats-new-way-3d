'use client'

import { replay } from '@/actions/replay'
import { Food, GameState, WORLD_ZERO } from '@/lib/type'
import { useInfiniteQuery } from '@tanstack/react-query'
import { createContext, ReactNode, useContext, useMemo, useState } from 'react'

const WorldContext = createContext<GameState>(WORLD_ZERO)

export const WorldProvider = ({ children }: { children: ReactNode }) => {
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
        <WorldContext.Provider value={currentScene?.state ?? WORLD_ZERO}>
            {children}
        </WorldContext.Provider>
    )
}

export const useWorld = () => {
    const rawWorld = useContext(WorldContext)
    if (!rawWorld) {
        throw new Error('useConfig must be used within a WorldProvider')
    }

    const parsedWorld = useMemo(() => {
        const golden = new Set(
            rawWorld.specialFood.golden.map((c) => c.join(',')),
        )
        const sus = new Set(
            rawWorld.specialFood.suspicious.map((c) => c.join(',')),
        )

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
    }, [rawWorld])

    return parsedWorld
}
