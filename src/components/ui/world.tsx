'use client'

import { replay, ReplayResponse } from '@/actions/replay'
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

const EXTRA = 15

const WorldContext = createContext<QueryType>(null!)

export const WorldProvider = ({ children }: { children: ReactNode }) => {
    const [maxPages, setMaxPages] = useState(0)
    const [cursor, setCursor] = useState(0)
    const [cache, setCache] = useState<Record<number, GameState>>({})
    const [loadPromise, setLoadPromise] = useState<
        Record<number, undefined | Promise<ReplayResponse>>
    >({})

    const preload = async (start: number, extra: number = 5) => {
        const dataPromise = replay(start, extra)

        const expectedIndexies = Array.from(
            { length: extra },
            (_, i) => start + i,
        ).filter((i) => i < maxPages)

        setLoadPromise((prev) => ({
            ...prev,
            ...Object.fromEntries(
                expectedIndexies.map((i) => [i, dataPromise]),
            ),
        }))

        const data = await dataPromise
        if (maxPages !== data.framesCount) setMaxPages(data.framesCount)
        setCache((prev) => ({ ...prev, ...data.extra }))

        return data
    }

    const query = useQuery({
        queryKey: ['scene', cursor],
        queryFn: async () => {
            if (cursor > 0 && cursor < maxPages - EXTRA / 2 && cache[cursor]) {
                let firstMissing = cursor + 1
                while (firstMissing < maxPages && cache[firstMissing]) {
                    firstMissing++
                }

                if (firstMissing < maxPages && !loadPromise[firstMissing]) {
                    console.log('Preloading', firstMissing)
                    preload(firstMissing, EXTRA / 2)
                }

                return cache[cursor]
            }

            if (loadPromise[cursor]) {
                const data = await loadPromise[cursor]

                const lCursor = Math.max(
                    0,
                    Math.min(data.framesCount - 1, cursor),
                )

                if (data.extra[lCursor]) {
                    return data.extra[lCursor]
                }
            }

            const data = await preload(cursor, EXTRA)

            if (cursor + EXTRA < data.framesCount) {
                console.log('Loading ahead', cursor + EXTRA)
                preload(cursor + EXTRA, EXTRA * 5)
            }

            const lCursor = Math.max(0, Math.min(data.framesCount - 1, cursor))
            return data.extra[lCursor]
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
                setCursor((prev) => Math.min(maxPages - 1, prev + 1))
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
