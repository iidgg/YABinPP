import prisma from '@db';
import type { Prisma, Session, User } from '@prisma/client';
import { redirect, type Cookies } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { COOKIE_SECURE, SESSION_INFO } from './env';
import { IP, Password, Verification } from './hash';

export const userExists = async (userId: string) =>
    await prisma.user
        .findUnique({
            where: { id: userId },
            select: { id: true },
        })
        .then((d) => d?.id ?? null);

export async function getUserIdFromCookie<
    R extends boolean = false,
    T = User['id'] | (R extends true ? never : null),
>(cookies: Cookies, redirectIfNone: R): Promise<T> {
    return (await getSession(cookies, { redirectIfNone }))?.userId as T;
}

type getUserOptions<R> = Omit<getSessionOptions<R, true>, 'includeUser'>;

export async function getUserFromCookie<
    R extends boolean = false,
    T = User | (R extends true ? never : null),
>(cookies: Cookies, opts?: getUserOptions<R>): Promise<T> {
    return (
        await getSession(cookies, {
            includeUser: true,
            redirectIfNone: opts?.redirectIfNone,
            password: opts?.password,
        })
    )?.user as T;
}

interface getSessionOptions<R, I> {
    redirectIfNone?: R;
    includeUser?: I;
    password?: string;
}

export async function getSession<
    R extends boolean = false,
    I extends boolean = false,
    T =
        | (I extends true ? Session & { user: User } : Session)
        | (R extends true ? never : null),
>(cookies: Cookies, opts?: getSessionOptions<R, I>): Promise<T> {
    const token = cookies.get('token');

    notfound: if (token && token.length > 0 && token.length <= 64) {
        const pswd = typeof opts?.password === 'string';
        const query = await prisma.session.findUnique({
            where: { token, expiresAt: { gt: new Date() } },
            include: opts?.includeUser
                ? { user: true }
                : {
                      user: {
                          select: {
                              id: true,
                              verified: true,
                              password: pswd,
                          },
                      },
                  },
        });

        if (!query || !query.user.verified) break notfound;

        prisma.session.update({
            where: { id: query.id },
            data: { lastActive: new Date() },
        });

        if (!pswd || Password.compare(query.user.password, opts.password!)) {
            return query as T;
        }
    }

    if (opts?.redirectIfNone) {
        return redirect(303, '/login');
    }

    return null as T;
}

export const generateVerificationHash = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    return Verification.hash(verificationSecret(user)).join();
};

export const validateVerificationHash = async (
    userId: string,
    hash: string,
) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const matches = Verification.compare(hash, verificationSecret(user));

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

interface SessionInfo {
    ip: string;
}

export async function createSession(
    cookies: Cookies,
    userId: string,
    info?: SessionInfo,
) {
    const data: Prisma.SessionCreateInput = {
        user: { connect: { id: userId } },
        token: nanoid(32),
        createdAt: new Date(),
        lastActive: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    };

    if (SESSION_INFO && info) {
        data.ip = IP.hash(info.ip).join();
    }

    const session = await prisma.session.create({ data });

    cookies.set('token', session.token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        secure: COOKIE_SECURE,
        httpOnly: true,
        sameSite: 'strict',
    });

    return session;
}
