import { compare as compareSecret, hash as hashSecret } from '$lib/utils/hash';
import prisma from '@db';
import type { User } from '@prisma/client';
import { redirect, type Cookies } from '@sveltejs/kit';
import { nanoid } from 'nanoid';

export const userExists = async (userId: string) =>
    await prisma.user
        .findUnique({
            where: { id: userId },
            select: { id: true },
        })
        .then((d) => d?.id ?? null);

interface getUserOptions<R, I> {
    redirectIfNone?: R;
    includeUser?: I;
}

export async function getUserIdFromCookie<
    R extends boolean = false,
    T = User['id'] | (R extends true ? never : null),
>(cookies: Cookies, redirectIfNone: R): Promise<T> {
    return getUserFromCookie(cookies, { redirectIfNone });
}

export async function getUserFromCookie<
    R extends boolean = false,
    I extends boolean = false,
    T = (I extends true ? User : User['id']) | (R extends true ? never : null),
>(cookies: Cookies, opts?: getUserOptions<R, I>): Promise<T> {
    const token = cookies.get('token');

    if (token && token.length > 0 && token.length <= 64) {
        const query = await prisma.authToken.findUnique({
            where: { token, expiresAt: { gt: new Date() } },
            include: {
                user: opts?.includeUser ? true : { select: { verified: true } },
            },
        });

        if (query?.user.verified)
            return (query.user.username ? query.user : query.user.id) as T;
    }

    if (opts?.redirectIfNone) {
        return redirect(303, '/login');
    }

    return null as T;
}

export const generateVerificationHash = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    return hashSecret(verificationSecret(user)).join();
};

export const validateVerificationHash = async (
    userId: string,
    hash: string,
) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const matches = compareSecret(hash, verificationSecret(user));

    if (matches) {
        await prisma.user.update({
            where: { id: userId },
            data: { verified: true },
        });
    }

    return matches;
};

export const generatePasswordResetToken = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const resetToken = await prisma.resetToken.upsert({
        where: {
            userId: user.id,
        },
        update: {
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
            token: nanoid(32),
        },
        create: {
            user: {
                connect: {
                    id: user.id,
                },
            },
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
            token: nanoid(32),
        },
    });

    return resetToken.token;
};

const verificationSecret = (user: User) =>
    `${user.email}${user.id}${user.password}${user.verified}`;
