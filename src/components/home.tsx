'use client'

import { ConfigProvider } from './config'
import { Scene } from './scene'
import { Sidebar } from './sidebar'
import { WorldProvider } from './ui/world'

export function Home() {
    return (
        <WorldProvider>
            <ConfigProvider>
                <div className="grid h-full grid-cols-[20em,1fr] gap-2">
                    <Sidebar />
                    <Scene />
                </div>
            </ConfigProvider>
        </WorldProvider>
    )
}
