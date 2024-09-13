import { compare as compareSecret, hash as hashSecret } from '$lib/utils/hash';
import prisma from '@db';
import type { User } from '@prisma/client';
import type { Cookies } from '@sveltejs/kit';
import { nanoid } from 'nanoid';

export const getUserIdFromCookie = async (cookies: Cookies) => {
    const token = cookies.get('token');
    if (!token) return null;

    const authToken = await prisma.authToken.findFirst({
        where: { token, expiresAt: { gt: new Date() } },
        include: { user: { select: { id: true, verified: true } } },
    });
    if (!authToken) return null;
    if (!authToken.user.verified) return null;

    return authToken.user.id;
};

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
