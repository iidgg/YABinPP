import { totp } from 'otplib';
import { randomBytes } from 'node:crypto';
import base32 from 'hi-base32';
import { TWOFA_ISSUER } from '../constants/twoFAs';

export class TOTP {
    static validate(secret: string, otp: string) {
        return totp.generate(secret) === otp;
    }

    static generateSecret() {
        // 16 byte, 128-bit, 32 hex chars
        return base32.encode(new Uint8Array(randomBytes(16)));
    }

    static secretURI(username: string, secret: string) {
        const opts = totp.allOptions();
        const algorithm = opts.algorithm.toUpperCase();

        return `otpauth://totp/${TWOFA_ISSUER}:${username}?algorithm=${algorithm}&digits=${opts.digits}&period=${opts.step}&issuer=${TWOFA_ISSUER}&secret=${secret}`;
    }
}
