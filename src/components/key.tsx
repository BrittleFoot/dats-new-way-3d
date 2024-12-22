'use client'

import {
    CameraControls,
    KeyboardControls,
    useKeyboardControls,
} from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { ReactNode } from 'react'

export function KeyControlsProvider({ children }: { children: ReactNode }) {
    return (
        <KeyboardControls
            map={[
                { name: 'forward', keys: ['ArrowUp', 'w', 'W', 'ц', 'Ц'] },
                { name: 'backward', keys: ['ArrowDown', 's', 'S', 'ы', 'Ы'] },
                { name: 'left', keys: ['ArrowLeft', 'a', 'A', 'ф', 'Ф'] },
                { name: 'right', keys: ['ArrowRight', 'd', 'D', 'в', 'В'] },
                { name: 'jump', keys: ['Space'] },
                { name: 'crouch', keys: ['ShiftLeft', 'ShiftRight'] },
            ]}
        >
            {children}
        </KeyboardControls>
    )
}

export function KeyControlsHandler() {
    const controls = useThree((state) => state.controls) as CameraControls
    const [, get] = useKeyboardControls()

    const SPEED = 0.1

    useFrame((_, delta) => {
        const { forward, backward, left, right, jump, crouch } = get()

        if (forward) controls.forward(SPEED)
        if (backward) controls.forward(-SPEED)
        if (jump) controls.elevate(SPEED)
        if (crouch) controls.elevate(-SPEED)

        // if (left) controls.moveRight(-SPEED)
        // if (right) controls.moveRight(SPEED)
    })

    return <></>
}
