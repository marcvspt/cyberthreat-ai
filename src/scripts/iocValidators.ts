import { z } from 'zod'
import type { HashAlgorithm, IoCType } from '@/scripts/types.ts'

const IOC_IP_SCHEMA = z.union([z.ipv4(), z.ipv6()])
const IOC_DOMAIN_SCHEMA = z.hostname().regex(/\.[a-z]{2,}$/i)
const IOC_HASH_SCHEMA = z.union([z.hash('md5'), z.hash('sha1'), z.hash('sha256')])

const HASH_SCHEMAS: Array<[HashAlgorithm, z.ZodType<string>]> = [
    ['md5', z.hash('md5')],
    ['sha1', z.hash('sha1')],
    ['sha256', z.hash('sha256')]
]

export function detectHashType(rawHash: string): HashAlgorithm | null {
    const hash = rawHash.trim().toLowerCase()

    for (const [algorithm, schema] of HASH_SCHEMAS) {
        if (schema.safeParse(hash).success) {
            return algorithm
        }
    }

    return null
}

export function detectIocType(rawIoc: string): IoCType | null {
    const ioc = rawIoc.trim()

    if (IOC_IP_SCHEMA.safeParse(ioc).success) {
        return 'ip'
    }

    if (IOC_DOMAIN_SCHEMA.safeParse(ioc).success) {
        return 'domain'
    }

    if (IOC_HASH_SCHEMA.safeParse(ioc).success) {
        return 'hash'
    }

    return null
}
