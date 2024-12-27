'use client'

import { CameraControls } from '@react-three/drei'
import React, {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from 'react'

type Config = Partial<{
    selectedSnakeId: string
    cameraControls: CameraControls
    followSnake: boolean
    playback: 'play' | 'pause'
}>

const defaultConfig: Config = {
    playback: 'pause',
}

type ConfigContextProps = {
    config: Config
    setConfig: (config: Config) => void
    insertConfig: (config: Config) => void
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined)

export const ConfigProvider: React.FC<{
    children: ReactNode
}> = ({ children }) => {
    const [config, setConfig] = useState<Config>(defaultConfig)

    const configObject = useMemo(() => {
        const _setConfig = (config: Config) => {
            setConfig(config)
        }

        return {
            config,
            setConfig: _setConfig,
            insertConfig: (config: Config) => {
                setConfig((prev) => {
                    const newConfig = { ...prev, ...config }
                    return newConfig
                })
            },
        }
    }, [config, setConfig])

    return (
        <ConfigContext.Provider value={configObject}>
            {children}
        </ConfigContext.Provider>
    )
}

export const useConfig = (): ConfigContextProps => {
    const context = useContext(ConfigContext)
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider')
    }
    return context
}
