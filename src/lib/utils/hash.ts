import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import {
    HASH_ITERATION as ITERATIONS,
    HASH_KEYLEN as KEYLEN,
    HASH_SALT_LENGTH as SALT_LENGTH,
} from '../server/env';

const alg = 'sha512'; // digest algorithm
const enc = 'hex'; // encoding

interface HashReturn {
    /** The resulting hash as a string */
    hash: string;
    /** The salt used for hashing */
    salt: string;
    /** Combines the hash and salt into a single string */
    join: () => string;
}

/**
 * Generates a hash.
 * @param secret - The secret to be hashed.
 * @returns HashReturn
 */
export function hash(secret: string): HashReturn {
    const salt = randomBytes(SALT_LENGTH).toString(enc);
    const hash = pbkdf2Sync(secret, salt, ITERATIONS, KEYLEN, alg);
    return {
        salt,
        hash: hash.toString(enc),
        join: function () {
            return this.hash + '.' + this.salt;
        },
    };
}

/**
 * Compares a saved hash with a provided string.
 * @param saved The stored hash and salt, formatted as `{hash}.{salt}`
 * @param secret The secret to compare
 * @returns True if the hash matches the secret, false otherwise.
 */
export function compare(saved: string, secret: string): boolean {
    const [hash, salt] = saved.split('.');
    if (!hash || !salt) {
        throw new Error('Missing Hash or salt in the given string.');
    }

    const hashBuff = Buffer.from(hash, enc);
    const givenBuff = pbkdf2Sync(secret, salt, ITERATIONS, KEYLEN, alg);
    return timingSafeEqual(new Uint8Array(hashBuff), new Uint8Array(givenBuff));
}
