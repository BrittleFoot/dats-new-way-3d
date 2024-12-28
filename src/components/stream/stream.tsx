'use client'

import useWebSocket from 'react-use-websocket'

const WEBSOCKET_URL = 'ws://localhost:8765/replay'

export function StreamWorld() {
    const {} = useWebSocket(WEBSOCKET_URL, {
        share: true,
        queryParams: {
            name: 'snake3d-final-5-buft',
            turn: 0,
        },
    })
    return (
        <div>
            <h1>Stream</h1>
        </div>
    )
}
