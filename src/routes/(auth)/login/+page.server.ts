import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import prisma from '@db';
import { Password } from '$lib/server/hash';
import { nanoid } from 'nanoid';
import { getUserIdFromCookie } from '$lib/server/auth';
import { TwoFA, TwoFANames } from '$lib/constants/twoFAs';
import { TOTP } from '$lib/server/2fa';
import { createSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies }) => {
    const userId = await getUserIdFromCookie(cookies, false);
    if (userId) redirect(303, '/');
};
export const actions: Actions = {
    login: async ({ cookies, request }) => {
        const data = await request.formData();

        const usernameOrEmail = data.get('username-email');
        const password = data.get('password');

        if (!usernameOrEmail || !password) {
            return fail(400, {
                success: false,
                errors: ['All fields are required'],
            });
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: usernameOrEmail.toString() },
                    { email: usernameOrEmail.toString() },
                ],
            },
        });

        if (!user || !Password.compare(user.password, password.toString())) {
            return fail(400, {
                success: false,
                errors: ['Invalid username or password'],
            });
        }

        if (!user.verified) {
            return fail(401, {
                success: false,
                errors: ['Account not verified'],
            });
        }

        prisma.session.deleteMany({
            where: { expiresAt: { lte: new Date() } },
        });

        const mfa = await prisma.mfa.findUnique({
            select: { id: true, type: true },
            where: {
                userId_type: { userId: user.id, type: TwoFA.TOTP },
            },
        });

        if (mfa) {
            const ticket = await prisma.authTicket.create({
                data: {
                    mfa: { connect: { id: mfa.id } },
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 1000 * 60 * 2), // 2 minutes
                    token: nanoid(64),
                    type: mfa.type,
                },
            });

            return {
                success: true,
                mfa: {
                    type: ticket.type,
                    ticket: ticket.token,
                },
            };
        }

        await createSession(cookies, user.id);

        redirect(303, '/');
    },

    mfa: async ({ cookies, request }) => {
        const data = await request.formData();

        const type = Number(data.get('type')?.toString());
        const token = data.get('ticket')?.toString();
        const code = data.get('code')?.toString();

        if (isNaN(type) || !token || !code || !(type in TwoFANames))
            return fail(400, { success: false, errors: ['Invalid data'] });

        const ticket = await prisma.authTicket.findUnique({
            select: { mfa: { select: { userId: true, secret: true } } },
            where: {
                type,
                token,
            },
        });

        if (!ticket)
            return fail(400, { success: false, errors: ['Invalid data'] });
        const { secret, userId } = ticket.mfa;

        const valid = TOTP.validate(secret, code);

        if (valid) {
            await createSession(cookies, userId);
            return redirect(303, '/');
        }

        return fail(401, {
            success: false,
            errors: ['Invalid Multi-factor code'],
        });
    },
};
