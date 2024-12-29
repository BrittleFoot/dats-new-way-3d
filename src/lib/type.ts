export type Point = [number, number, number]

export type Snake = {
    id: string
    direction: Point
    oldDirection: Point
    geometry: Point[]
    deathCount: number
    status: 'alive' | 'dead'
    reviveRemainMs: number
}

export type Enemy = {
    geometry: Point[]
    status: 'alive' | 'dead'
    kills: number
}

export type Food = {
    c: Point
    points: number
    type: 'normal' | 'golden' | 'suspicious'
}

export type SpecialFood = {
    golden: Point[]
    suspicious: Point[]
}

export type GameState = {
    mapSize: Point
    name: string
    points: number
    fences: Point[]
    snakes: Snake[]
    enemies: Enemy[]
    food: Food[]
    specialFood: SpecialFood
    turn: number
    reviveTimeoutSec: number
    tickRemainMs: number
    errors: unknown[]
}

export const WORLD_ZERO: GameState = {
    enemies: [],
    snakes: [],
    food: [],
    specialFood: {
        golden: [],
        suspicious: [],
    },
    fences: [],
    mapSize: [0, 0, 0],
    name: '',
    points: 0,
    turn: 0,
    errors: [],
    reviveTimeoutSec: 0,
    tickRemainMs: 0,
}

function posHash(x: number, y: number, z: number) {
    return x + y * 1000 + z * 1_000_000
}

export function parseWorld(state: GameState) {
    const golden = new Set(
        state.specialFood.golden.map(([x, y, z]) => posHash(x, y, z)),
    )
    const sus = new Set(
        state.specialFood.suspicious.map(([x, y, z]) => posHash(z, y, z)),
    )

    const getType = ({ c: [x, y, z] }: Food) => {
        const idx = posHash(x, y, z)
        if (golden.has(idx)) return 'golden'
        if (sus.has(idx)) return 'suspicious'
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

    const partitionedWalls = new Map<string, Point[]>()

    state.fences.forEach((point) => {
        const [x, y, z] = point
        const key = `${Math.floor(x / 30)}_${Math.floor(y / 30)}_${Math.floor(z / 30)}`
        if (!partitionedWalls.has(key)) {
            partitionedWalls.set(key, [])
        }
        partitionedWalls.get(key)!.push(point)
    })

    return {
        ...state,
        parsedFood: food,
        parsedWalls: partitionedWalls,
    }
}

export type GameStateImproved = GameState & ReturnType<typeof parseWorld>

export const BETTER_WORLD_ZERO: GameStateImproved = {
    ...WORLD_ZERO,
    parsedFood: [],
    parsedWalls: new Map(),
}
