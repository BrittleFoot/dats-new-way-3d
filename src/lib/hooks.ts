'use client'

import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

export function useCameraControls() {
    return useThree((state) => state.controls) as CameraControls | null
}
