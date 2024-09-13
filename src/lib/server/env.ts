import { env } from '$env/dynamic/private';

const numOrDefault = (def: number, num?: number | string): number =>
    num && !isNaN(Number(num)) ? Number(num) : def;
export const HASH_ITERATION = numOrDefault(10_000, env.HASH_ITERATION);
export const HASH_KEYLEN = numOrDefault(64, env.HASH_KEYLEN);
export const HASH_SALT_LENGTH = numOrDefault(16, env.HASH_SALT_LENGTH); // byte length
