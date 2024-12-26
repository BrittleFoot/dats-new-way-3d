import { Snake } from '@/lib/type'
import { cn, randomName } from '@/lib/utils'
import { useEffect } from 'react'
import { useConfig } from './config'
import { Button } from './ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './ui/card'
import { useWorld } from './ui/world'

function SnakeWidget({ snake }: { snake: Snake }) {
    const { config, insertConfig } = useConfig()
    const cc = config.cameraControls
    const selected = config.selectedSnakeId === snake.id
    const snakeName = randomName(snake.id)
    const alive = snake.status === 'alive'

    const onClick = () => {
        insertConfig({ selectedSnakeId: snake.id })
    }

    useEffect(() => {
        if (!alive && selected) {
            insertConfig({ selectedSnakeId: undefined })
            return
        }

        if (!cc) return

        if (selected) {
            cc.setTarget(...snake.geometry[0], true)
        }
    }, [selected])

    return (
        <Card
            className={cn('backdrop-blur bg-card/60 shadow-none', {
                'bg-destructive/60 border-destructive': !alive,
                'bg-success/60 border-success': selected,
            })}
        >
            <CardHeader>
                <CardTitle>{snakeName}</CardTitle>
                <CardDescription className="truncate">
                    {snake.id}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-2">
                    <p>Alive</p>
                    <p>{snake.status}</p>
                    {alive && (
                        <>
                            <p>Length</p>
                            <p>{snake.geometry.length}</p>
                        </>
                    )}
                    {!alive && (
                        <>
                            <p>Deaths</p> <p>{snake.deathCount}</p>
                            <p>Revive in</p>
                            <p>{snake.reviveRemainMs}ms</p>
                        </>
                    )}
                </div>

                {!selected && (
                    <Button onClick={onClick} className="mt-2">
                        Select
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export function Sidebar() {
    const { rawWorld } = useWorld()

    return (
        <div className="flex flex-col gap-2">
            {rawWorld.snakes.map((snake) => (
                <SnakeWidget key={snake.id} snake={snake} />
            ))}
        </div>
    )
}
