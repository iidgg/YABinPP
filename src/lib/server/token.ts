import prisma from '@db';
import type { ApiToken } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import { deleteUV } from '../utils/util';
import { userExists } from './auth';
import { arrayToBits, isBitSet } from '../utils/bitmask';
import { API_TOKEN_SCOPES_MAP, type TokenScopes } from '../constants/scopes';
import type { Dict } from '../types';
import { TOKENS_LENGTH } from './env';

/** The algorithm used to hash the tokens */
const alg = 'sha256';
/** The encoding format for hashed tokens and generated tokens */
const enc = 'base64url';
const newToken = (userId: string) => {
    const token = randomBytes(TOKENS_LENGTH).toString(enc);
    const hash = createHash(alg).update(token).digest(enc);
    return { hash, token: `${userId}.${token}` };
};

const parseToken = (token: string) => {
    const [userId, t] = token.split('.');
    const hash = createHash(alg).update(t).digest(enc);
    return { userId, hash };
};

const API_TOKEN_EMPTY_SCOPES = arrayToBits([], API_TOKEN_SCOPES_MAP);

/** Checks if given scope is enabled in given bitmask */
export function isScopeEnabled(bitmask: string, scope: TokenScopes): boolean {
    return isBitSet(bitmask, API_TOKEN_SCOPES_MAP[scope]);
}

/** Returns info about the given token id, returns null if expired  */
export async function getToken(tokenId: string) {
    return await prisma.apiToken.findUnique({
        where: {
            id: tokenId,
            OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
        },
        select: { name: true, scopes: true, expiresAt: true },
    });
}

/** Returns info about the given token, returns null if expired  */
export async function getTokenInfo(token: string) {
    const parsed = parseToken(token);
    return await prisma.apiToken.findUnique({
        where: {
            userId: parsed.userId,
            token: parsed.hash,
            OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
        },
        select: { userId: true, scopes: true },
    });
}

/** Returns a list of existing active api tokens */
export async function getTokens(userId: string) {
    return await prisma.apiToken.findMany({
        where: {
            userId,
            OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
        },
        select: { id: true, name: true, expiresAt: true },
        orderBy: { createdAt: 'asc' },
    });
}

/** Counts existing active api tokens */
export async function countTokens(userId: string) {
    return await prisma.apiToken.count({
        where: {
            userId,
            OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
        },
    });
}

/** Generates a new api token for the given userId */
export async function generateToken(data: {
    userId: string;
    name?: string;
    scopes?: Array<TokenScopes>;
    expiresAt?: Date;
}): Promise<ApiToken | null> {
    if (!(await userExists(data.userId))) return null;
    const { hash, token } = newToken(data.userId);
    const scopes = data.scopes
        ? arrayToBits(data.scopes, API_TOKEN_SCOPES_MAP)
        : API_TOKEN_EMPTY_SCOPES;

    return await prisma.apiToken
        .create({
            data: {
                name: data.name ?? ' ',
                token: hash,
                scopes,
                createdAt: new Date(),
                expiresAt: data.expiresAt,
                user: { connect: { id: data.userId } },
            },
        })
        .then((d) => {
            d.token = token;
            return d;
        });
}

/** Resets existing token secret */
export async function resetToken(
    userId: string,
    tokenId: string,
): Promise<string | null> {
    if (!(await userExists(userId))) return null;
    const { hash, token } = newToken(userId);

    return await prisma.apiToken
        .update({
            where: { id: tokenId, userId: userId },
            data: { token: hash },
        })
        .then(() => token);
}

/** Updates an existing api token info */
export async function setToken(data: {
    userId: string;
    tokenId: string;
    name?: string;
    scopes?: Array<TokenScopes>;
    expiresAt?: Date;
}): Promise<ApiToken | null> {
    if (!(await userExists(data.userId))) return null;

    const changes: Dict<unknown> = deleteUV({
        ...data,
        scopes: data.scopes
            ? arrayToBits(data.scopes, API_TOKEN_SCOPES_MAP)
            : undefined,
    });

    delete changes.tokenId;
    delete changes.userId;

    return await prisma.apiToken.update({
        where: { id: data.tokenId, userId: data.userId },
        data: changes,
    });
}

/** Deletes an existing api token */
export async function deleteToken(userId: string, tokenId: string) {
    if (!(await userExists(userId))) return false;
    return await prisma.apiToken.delete({
        where: { id: tokenId, userId },
    });
}
