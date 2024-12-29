'use client'

import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

export function useCameraControls() {
    return useThree((state) => state.controls) as CameraControls | null
}

export function useTraceUpdate(props: Record<string, unknown>, label: string) {
    const prev = useRef(props)
    useEffect(() => {
        const changedProps = Object.entries(props).reduce(
            (ps, [k, v]) => {
                if (prev.current[k] !== v) {
                    ps[k] = [prev.current[k], v]
                }
                return ps
            },
            {} as Record<string, [unknown, unknown]>,
        )

        if (Object.keys(changedProps).length > 0) {
            console.log(label, 'changed props', changedProps)
        }
        prev.current = props
    })
}
