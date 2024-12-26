'use client'

import { useCameraControls } from '@/lib/hooks'
import { KeyboardControls, useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
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
    const controls = useCameraControls()
    const [, get] = useKeyboardControls()

    const SPEED = 75

    useFrame((_, delta) => {
        if (!controls) return

        const { forward, backward, left, right, jump, crouch } = get()

        if (forward) controls.forward(SPEED * delta)
        if (backward) controls.forward(-SPEED * delta)
        if (jump) controls.elevate(SPEED * delta)
        if (crouch) controls.elevate(-SPEED * delta)

        if (left) {
        }
        if (right) {
        }

        // if (left) controls.moveRight(-SPEED)
        // if (right) controls.moveRight(SPEED)
    })

    return <></>
}
