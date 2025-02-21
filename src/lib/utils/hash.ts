import {
    pbkdf2Sync,
    randomBytes,
    timingSafeEqual,
    type BinaryLike,
} from 'node:crypto';

interface HashReturn {
    /** The resulting hash as a string */
    hash: Buffer<ArrayBufferLike>;
    /** The salt used for hashing */
    salt: string;
    /** Returns a string representation of the hash */
    toString: () => string;
    /** Combines the hash and salt into a single string */
    join: () => string;
}

export default class Hash {
    constructor(
        /** PBKDF2 key length in bytes */
        public keylen: number,
        /** Salt length in bytes */
        public salt: number,
        /** PBKDF2 iterations */
        public iterations: number,
        public algorithm = 'sha512',
        public encoding: BufferEncoding = 'hex',
    ) {}

    generateSalt() {
        return randomBytes(this.salt).toString(this.encoding);
    }

    /**
     * Generates a hash.
     * @param data - The data to be hashed.
     * @param salt - Optionally provide your own salt, otherwise it'll generate its own.
     * @returns HashReturn
     */
    hash<D extends BinaryLike>(
        data: D,
        salt = this.generateSalt(),
    ): HashReturn {
        const enc = this.encoding;
        const hash = pbkdf2Sync(
            data,
            salt,
            this.iterations,
            this.keylen,
            this.algorithm,
        );

        return {
            salt,
            hash,
            toString: function () {
                return this.hash.toString(enc);
            },
            join: function (): string {
                return this.hash.toString(enc) + '.' + this.salt;
            },
        };
    }

    /**
     * Compares a hash with a provided string.
     * @param hashed hash and salt, formatted as `{hash}.{salt}`, encoded in {this.encoding}
     * @param data un-hashed data to compare
     * @returns True if the hash matches the data, false otherwise.
     */
    compare(hashed: string, data: BinaryLike): boolean {
        const [hash, salt] = hashed.split('.');
        if (!hash || !salt) {
            throw new Error('Missing Hash or salt in the given string.');
        }

        return timingSafeEqual(
            new Uint8Array(Buffer.from(hash, this.encoding)),
            new Uint8Array(this.hash(data, salt).hash),
        );
    }
}
