'use client'

import React, { createContext, ReactNode, useContext, useState } from 'react'

interface Config {
    scale?: number
}

interface ConfigContextProps {
    config: Config
    setConfig: (config: Config) => void
}

const defaultConfig: Config = {
    scale: 1,
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined)

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [config, setConfig] = useState<Config>(defaultConfig)

    return (
        <ConfigContext.Provider value={{ config, setConfig }}>
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
