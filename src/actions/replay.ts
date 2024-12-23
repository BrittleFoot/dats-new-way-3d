'use server'

import { GameState } from '@/lib/type'
import { open } from 'fs/promises'
import path from 'path'

// Cache the file data in memory
const cachedLines: GameState[] = []

const MAX_FRAMES = 10

const filePath = path.join(
    process.cwd(),
    'public',
    'snake3d-final-1-buft.ljson',
)

const loadFileAsync = async () => {
    if (cachedLines.length !== 0) {
        return
    }
    console.time('⏰ Full file loaded')
    const fileContent = await open(filePath)

    let lineNumber = 0
    for await (const line of fileContent.readLines({ encoding: 'utf-8' })) {
        if (MAX_FRAMES > 0 && lineNumber++ > MAX_FRAMES) {
            break
        }
        cachedLines.push(JSON.parse(line) as GameState)
    }

    console.timeEnd('⏰ Full file loaded')
}

const lazyLoad = async () => {
    if (cachedLines.length > 0) {
        return cachedLines
    }

    loadFileAsync()

    console.time('⏰ First line loaded')

    while (cachedLines.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1))
    }

    console.timeEnd('⏰ First line loaded')
    return cachedLines
}

export type ReplayResponse = {
    frame: number
    framesCount: number
    state: GameState
}

export async function replay(n: number) {
    const state = await lazyLoad()
    const maxFrames = state.length - 1
    const frame = Math.min(maxFrames, Math.max(0, n))
    return {
        frame,
        framesCount: maxFrames,
        state: state[frame],
    } as ReplayResponse
}
