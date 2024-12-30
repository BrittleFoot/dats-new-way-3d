'use client'

import { GameStateImproved, parseWorld } from '@/lib/type'
import { memo, useCallback, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'

const WEBSOCKET_URL = 'ws://localhost:8765/replay'

type ReplaySnapshot = {
    id: string
    turn: number
    data: GameStateImproved
}

type SnapshotMessage = {
    type: 'replay'
    data: ReplaySnapshot[]
}

type ReplayLength = {
    name: string
    turns: number
}

type SummaryMessage = {
    type: 'summary'
    replays: ReplayLength[]
}

type StreamMessage = SnapshotMessage | SummaryMessage

const SnapshotIndicator = memo(
    ({
        turn,
        snapshot,
        onClickOnEmpty,
    }: {
        turn: number
        snapshot: ReplaySnapshot
        onClickOnEmpty: (id: number) => void
    }) => {
        if (!snapshot) {
            return (
                <Button
                    variant="ghost"
                    className="w-10 text-muted-foreground"
                    onClick={() => onClickOnEmpty(turn)}
                >
                    {turn}
                </Button>
            )
        }

        // console.log('rerender', snapshot.turn)

        return (
            <Button onClick={() => console.log(snapshot)} className="w-10">
                {snapshot.turn}
            </Button>
        )
    },
)
SnapshotIndicator.displayName = 'SnapshotIndicator'

export type ReplayStreamOptions = {
    rate?: number
    turn?: number
}

export function useReplayStream(name: string, options?: ReplayStreamOptions) {
    const { lastJsonMessage, sendJsonMessage } = useWebSocket<StreamMessage>(
        WEBSOCKET_URL,
        {
            share: true,
            queryParams: {
                name,
                ...options,
            },
        },
    )

    const [snapshots, setSnapshots] = useState<ReplaySnapshot[]>([])
    const [summary, setSummary] = useState<ReplayLength[]>([])
    const [latestProcessed, setLatestProcessed] =
        useState<StreamMessage | null>(null)

    // early render abort if already processed
    const alreadyProcessed = latestProcessed === lastJsonMessage

    if (!alreadyProcessed && lastJsonMessage?.type === 'summary') {
        const summary = lastJsonMessage
        setSummary(summary.replays)
        const thisReplaySize =
            summary.replays.find((replay) => replay.name === name)?.turns ?? 0

        if (thisReplaySize) {
            setSnapshots((prev) => {
                const newSnapshots = [...prev]
                newSnapshots.length = thisReplaySize
                return newSnapshots
            })
        }
        setLatestProcessed(lastJsonMessage)
    }

    if (!alreadyProcessed && lastJsonMessage?.type === 'replay') {
        const snapshot = lastJsonMessage

        setSnapshots((prev) => {
            const newSnapshots = [...prev]
            snapshot.data.forEach((snap) => {
                const old = prev[snap.turn]
                const sameTurn = old?.turn === snap.turn

                // Update only if there's a change
                if (!sameTurn || (sameTurn && old.id < snap.id)) {
                    newSnapshots[snap.turn] = {
                        id: snap.id,
                        turn: snap.turn,
                        data: parseWorld(snap.data),
                    }
                }
            })
            return newSnapshots
        })
        setLatestProcessed(lastJsonMessage)
    }

    const seek = useCallback(
        (turn: number) => {
            console.log('👀 seek', turn)
            sendJsonMessage({ type: 'seek', turn })
        },
        [sendJsonMessage],
    )

    return { snapshots, summary, seek }
}

export function StreamWorld({ name }: { name: string }) {
    const { snapshots, summary, seek } = useReplayStream(name)

    return (
        <div className="h-full grid grid-rows-[auto,1fr] gap-4 p-4">
            <div className="flex gap-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2 flex-col">
                        {summary.map((replay) => (
                            <Button key={replay.name}>
                                {replay.name} - {replay.turns}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Navigate</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2 flex-col">
                        <div className="flex justify-between gap-2">
                            <Input placeholder="Goto" />
                            <Button>Go</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="py-4">
                <CardContent className="flex flex-wrap gap-2 items-start justify-start align-top">
                    {snapshots.map((snapshot, index) => (
                        <SnapshotIndicator
                            key={snapshot?.turn ?? index}
                            turn={snapshot?.turn ?? index}
                            snapshot={snapshot}
                            onClickOnEmpty={seek}
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
