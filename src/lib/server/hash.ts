import Hash from '../utils/hash';
import {
    IP_ITERATION,
    IP_KEYLEN,
    IP_SALT,
    PASSWORD_ITERATION,
    PASSWORD_KEYLEN,
    PASSWORD_SALT,
} from './env';

export const Password = new Hash(
    PASSWORD_KEYLEN,
    PASSWORD_SALT,
    PASSWORD_ITERATION,
);

export const Verification = new Hash(
    PASSWORD_KEYLEN,
    PASSWORD_SALT,
    PASSWORD_ITERATION,
);

export const IP = new Hash(IP_KEYLEN, IP_SALT, IP_ITERATION);
