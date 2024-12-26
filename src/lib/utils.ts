import { faker } from '@faker-js/faker'
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

export function randomName(hash: string) {
    const intArray = hash.match(/.{1,2}/g)?.map((hex) => parseInt(hex, 16)) ?? [
        1,
    ]
    faker.seed(intArray)
    return faker.animal.snake()
}
