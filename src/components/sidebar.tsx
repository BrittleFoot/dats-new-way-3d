import { Snake } from '@/lib/type'
import { cn, randomName } from '@/lib/utils'
import {
    CameraIcon,
    Loader2Icon,
    MapPinIcon,
    PauseIcon,
    PlayIcon,
    StepBackIcon,
    StepForwardIcon,
} from 'lucide-react'
import { useEffect } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { useConfig } from './config'
import { Button, buttonVariants } from './ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './ui/card'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
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
            <CardContent className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                    <p>Status</p>
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

                <div className="flex gap-2 items-center">
                    {!selected && <Button onClick={onClick}>Select</Button>}
                    {selected && (
                        <Label
                            className={buttonVariants({ variant: 'outline' })}
                        >
                            <Checkbox
                                checked={config.followSnake}
                                onCheckedChange={(c) =>
                                    insertConfig({ followSnake: c === true })
                                }
                            />
                            Follow
                        </Label>
                    )}
                    {alive && (
                        <>
                            <Button
                                onClick={() => {
                                    if (!selected) {
                                        insertConfig({ followSnake: false })
                                    }
                                    cc?.setTarget(...snake.geometry[0], true)
                                }}
                            >
                                <MapPinIcon /> Locate
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function WorldController() {
    const w = useWorld()
    const { config, insertConfig } = useConfig()

    const debouncedSeek = useDebounceCallback(w.seek, 5)

    return (
        <Card className="backdrop-blur bg-card/80 shadow-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    World
                    <Loader2Icon
                        className={cn('w-4 animate-spin opacity-0', {
                            'opacity-100':
                                w.query.isLoading ||
                                w.cache[w.cursor] === undefined,
                        })}
                    />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 items-center py-2">
                    <Button
                        disabled={!config.cameraControls}
                        onClick={() => {
                            if (!config.cameraControls) {
                                return
                            }

                            const [x, y, z] = w.world.rawWorld.mapSize.map(
                                (x) => x / 2,
                            )

                            config.cameraControls.setPosition(x, y, z * 3)
                        }}
                    >
                        <CameraIcon />
                    </Button>
                </div>

                <div className="flex justify-between">
                    <div className="text-muted-foreground">0</div>
                    <div className="font-bold">{w.cursor}</div>
                    <div className="text-muted-foreground">{w.maxCursor}</div>
                </div>

                <Slider
                    value={[w.cursor]}
                    min={0}
                    max={w.maxCursor - 1}
                    onValueChange={(v) => {
                        // w.seek(v[0])
                        if (debouncedSeek) {
                            debouncedSeek(
                                Math.max(0, Math.min(v[0], w.maxCursor - 1)),
                            )
                        }
                    }}
                    className="p-2 pb-4"
                />
                <div className="flex w-full justify-between">
                    <Button onClick={() => w.prev()}>
                        <StepBackIcon />
                    </Button>
                    {config.playback === 'play' && (
                        <Button
                            onClick={() => insertConfig({ playback: 'pause' })}
                        >
                            <PauseIcon />
                        </Button>
                    )}
                    {config.playback === 'pause' && (
                        <Button
                            onClick={() => insertConfig({ playback: 'play' })}
                        >
                            <PlayIcon />
                        </Button>
                    )}
                    <Button onClick={() => w.next()}>
                        <StepForwardIcon />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export function Sidebar() {
    const { world } = useWorld()

    return (
        <div className="flex flex-col gap-2 flex-wrap">
            <WorldController />
            {world.rawWorld.snakes.map((snake) => (
                <SnakeWidget key={snake.id} snake={snake} />
            ))}
        </div>
    )
}
