import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function timeit(name: string, fn: () => void) {
    console.time(name)
    fn()
    console.timeEnd(name)
}
