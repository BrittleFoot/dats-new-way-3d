'use client'

import { GameState } from '@/lib/type'
import { memo, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'

const WEBSOCKET_URL = 'ws://localhost:8765/replay'

type ReplaySnapshot = {
    id: string
    turn: number
    data: GameState
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

const SnapshotIndicator = memo(({ snapshot }: { snapshot: ReplaySnapshot }) => {
    if (!snapshot) {
        return (
            <Button variant="ghost" className="w-20">
                Empty
            </Button>
        )
    }

    console.log('rerender', snapshot.turn)

    return (
        <Button onClick={() => console.log(snapshot)} className="w-20">
            {snapshot.turn}
        </Button>
    )
})
SnapshotIndicator.displayName = 'SnapshotIndicator'

export function StreamWorld({ name }: { name: string }) {
    const { lastJsonMessage } = useWebSocket<StreamMessage>(WEBSOCKET_URL, {
        share: true,
        queryParams: {
            name,
        },
    })

    const [snapshots, setSnapshots] = useState<ReplaySnapshot[]>([])
    const [summary, setSummary] = useState<ReplayLength[]>([])
    const [latestProcessed, setLatestProcessed] =
        useState<StreamMessage | null>(null)

    const alreadyProcessed = latestProcessed === lastJsonMessage

    if (!alreadyProcessed && lastJsonMessage?.type === 'replay') {
        const snapshot = lastJsonMessage

        setSnapshots((prev) => {
            const newSnapshots = [...prev]
            snapshot.data.forEach((snap) => {
                if (prev[snap.turn]?.id !== snap.id) {
                    newSnapshots[snap.turn] = snap // Update only if there's a change
                }
            })
            return newSnapshots
        })
        setLatestProcessed(lastJsonMessage)
    }

    if (!alreadyProcessed && lastJsonMessage?.type === 'summary') {
        setSummary(lastJsonMessage.replays)
        setLatestProcessed(lastJsonMessage)
    }

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
                            key={snapshot?.turn ?? -index}
                            snapshot={snapshot}
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
