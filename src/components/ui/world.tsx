'use client'

import { replay } from '@/actions/replay'
import { Food, GameState, WORLD_ZERO } from '@/lib/type'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useMemo,
    useState,
} from 'react'

type QueryType = {
    query: UseQueryResult<GameState, Error>
    cursor: number
    setCursor: Dispatch<SetStateAction<number>>
    maxPages: number
    cache: Record<number, GameState>
}

const WorldContext = createContext<QueryType>(null!)

export const WorldProvider = ({ children }: { children: ReactNode }) => {
    const [maxPages, setMaxPages] = useState(0)
    const [cursor, setCursor] = useState(0)
    const [cache, setCache] = useState<Record<number, GameState>>({})

    const preload = async (page: number, extra: number = 5) => {
        const data = await replay(page, extra)

        if (maxPages !== data.framesCount) setMaxPages(data.framesCount)
        setCache((prev) => ({ ...prev, ...data.extra }))

        return data
    }

    function findFirstGapInCache() {
        let i = 0
        while (cache[i]) i++
        return i
    }

    // useEffect(() => {
    //     const prefetchJob = setInterval(async () => {
    //         let start = findFirstGapInCache()
    //         const data = await preload(start, 50)

    //         console.log('🔍 Prefetching', start, '/', data.framesCount)
    //         if (start >= data.framesCount) {
    //             console.log('✅ World Prefetch Done')
    //             clearInterval(prefetchJob)
    //         }
    //     }, 100)

    //     return () => {
    //         clearInterval(prefetchJob)
    //     }
    // }, [])

    const query = useQuery({
        queryKey: ['scene', cursor],
        queryFn: async () => {
            if (cursor > 0 && cursor < maxPages - 3 && cache[cursor]) {
                return cache[cursor]
            }
            const data = await preload(cursor)

            return data.state
        },
        placeholderData: (prev) => {
            const cached = cache[cursor]
            if (cached) return cached

            return prev ?? WORLD_ZERO
        },
    })

    return (
        <WorldContext.Provider
            value={{
                query,
                cursor,
                setCursor,
                maxPages,
                cache,
            }}
        >
            {children}
        </WorldContext.Provider>
    )
}

function parseWorld(state: GameState) {
    const golden = new Set(state.specialFood.golden.map((c) => c.join(',')))
    const sus = new Set(state.specialFood.suspicious.map((c) => c.join(',')))

    const getType = (food: Food) => {
        const c = food.c.join(',')
        if (golden.has(c)) return 'golden'
        if (sus.has(c)) return 'suspicious'
        return 'normal'
    }

    const food = state.food.map(
        (f) =>
            ({
                c: f.c,
                points: f.points,
                type: getType(f),
            }) as Food,
    )

    return {
        rawWorld: state,
        food,
    }
}

export const useWorld = () => {
    const worldContext = useContext(WorldContext)

    if (!worldContext) {
        throw new Error('useWrold must be used within a WorldProvider')
    }

    const { query, cursor, setCursor, maxPages, cache } = worldContext

    return useMemo(
        () => ({
            maxCursor: maxPages,
            query,
            cursor,
            cache,
            seek(page: number) {
                setCursor((prev) => Math.min(maxPages, Math.max(0, page)))
            },
            next() {
                setCursor((prev) => Math.min(maxPages, prev + 1))
            },
            prev() {
                setCursor((prev) => Math.max(0, prev - 1))
            },
            get world() {
                return parseWorld(query.data ?? WORLD_ZERO)
            },
        }),
        [query, cursor, setCursor, maxPages],
    )
}
