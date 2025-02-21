import { env } from '$env/dynamic/private';

const MILLION = 1_000_000;

/** Returns the given number if valid; otherwise, returns default number. */
const num = (def: number, num?: number | string): number =>
    num && !isNaN(Number(num)) ? Number(num) : def;

/** Returns the given string if valid; otherwise, returns default string or the result of a callback. */
const str = (def: string | (() => string), str?: string): string =>
    str && str.length > 0 ? str : typeof def === 'function' ? def() : def;

export const TOKENS_PER_USER = num(10, env.TOKENS_PER_USER);
export const TOKENS_LENGTH = num(32, env.TOKENS_LENGTH); // byte length

export const COOKIE_SECURE = str('no', env.COOKIE_SECURE) === 'true';

// IP Hashing options, useful for advanced users
export const IP_ITERATION = num(100_000, env.IP_ITERATION);
export const IP_KEYLEN = num(32, env.IP_KEYLEN);
export const IP_SALT = num(16, env.IP_SALT); // byte length

// Password Hashing options, useful for advanced users
export const PASSWORD_ITERATION = num(MILLION, env.PASSWORD_ITERATION);
export const PASSWORD_KEYLEN = num(64, env.PASSWORD_KEYLEN);
export const PASSWORD_SALT = num(32, env.PASSWORD_SALT); // byte length
