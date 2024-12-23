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
