import * as THREE from 'three'

export function Vec3(x?: number, y?: number, z?: number) {
    return new THREE.Vector3(x, y, z)
}
