import { env } from '$env/dynamic/private';

/** Returns the given number if valid; otherwise, returns default number. */
const numOrDefault = (def: number, num?: number | string): number =>
    num && !isNaN(Number(num)) ? Number(num) : def;

/** Returns the given string if valid; otherwise, returns default string or the result of a callback. */
const strOrDefault = (def: string | (() => string), str?: string): string =>
    str && str.length > 0 ? str : typeof def === 'function' ? def() : def;

export const HASH_ITERATION = numOrDefault(10_000, env.HASH_ITERATION);
export const HASH_KEYLEN = numOrDefault(64, env.HASH_KEYLEN);
export const HASH_SALT_LENGTH = numOrDefault(16, env.HASH_SALT_LENGTH); // byte length

export const COOKIE_SECURE = strOrDefault('no', env.COOKIE_SECURE) === 'true';
