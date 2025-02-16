import { TOTP as totp } from 'totp-generator';
import { randomBytes } from 'node:crypto';
import base32 from 'hi-base32';
import { TWOFA_ISSUER } from '../constants/twoFAs';

export class TOTP {
    static opts = {
        algorithm: 'SHA-1',
        digits: 6,
        period: 30,
    } as const;

    static validate(secret: string, otp: string) {
        return totp.generate(secret, this.opts).otp === otp;
    }

    static generateSecret() {
        // 20 byte, 160-bit, 40 hex chars
        return base32.encode(randomBytes(20));
    }

    static secretURI(username: string, secret: string) {
        const { algorithm, digits, period } = TOTP.opts;
        return `otpauth://totp/${TWOFA_ISSUER}:${username}?algorithm=${algorithm.replaceAll('-', '')}&digits=${digits}&period=${period}&issuer=${TWOFA_ISSUER}&secret=${secret}`;
    }
}
