'use client'

import { ConfigProvider } from './config'
import { Scene } from './scene'
import { Sidebar } from './sidebar'

export function Home() {
    return (
        <ConfigProvider>
            <div className="grid h-full grid-cols-[20em,1fr] gap-2">
                <Sidebar />
                <Scene />
            </div>
        </ConfigProvider>
    )
}
