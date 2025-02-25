import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import prisma from '@db';
import { Password } from '$lib/server/hash';
import { createSession } from '$lib/server/auth';
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import { sendVerificationEmail } from '$lib/server/email/verify';
import {
    validateEmail,
    validatePassword,
    validateName,
    validateUsername,
} from '$lib/server/validate';

export const actions: Actions = {
    default: async ({ cookies, request, getClientAddress }) => {
        if (envPublic.PUBLIC_REGISTRATION_ENABLED !== 'true') {
            return fail(404, { success: false, errors: ['Not found'] });
        }

        const data = await request.formData();

        const name = data.get('name');
        const username = data.get('username');
        const email = data.get('email');
        const password = data.get('password');
        const cnfPassword = data.get('confirm-password');

        const errors: string[] = [];

        if (!name || !username || !email || !password || !cnfPassword) {
            errors.push('All fields are required');
        }

        try {
            if (email) validateEmail(email);
        } catch (e: unknown) {
            errors.push((e as Error).message);
        }

        try {
            if (password) validatePassword(password);
        } catch (e: unknown) {
            errors.push((e as Error).message);
        }

        try {
            if (name) validateName(name);
        } catch (e: unknown) {
            errors.push((e as Error).message);
        }

        try {
            if (username) validateUsername(username);
        } catch (e: unknown) {
            errors.push((e as Error).message);
        }

        if (password && password !== cnfPassword) {
            errors.push('Passwords do not match');
        }

        if (username && email) {
            const existingCount = await prisma.user.count({
                where: {
                    OR: [
                        { username: username.toString() },
                        { email: email.toString() },
                    ],
                },
            });
            if (existingCount > 0) {
                errors.push('Username or email already exists');
            }
        }

        if (errors.length > 0) {
            return fail(400, { success: false, errors });
        }

        if (name && username && email && password) {
            const user = await prisma.user.create({
                data: {
                    name: name.toString(),
                    username: username.toString(),
                    email: email.toString(),
                    password: Password.hash(password.toString()).join(),
                    verified: false,
                },
            });

            if (env.MAIL_ENABLED === 'true') {
                const sentVerificationEmail = await sendVerificationEmail(
                    user.id,
                );
                if (sentVerificationEmail) {
                    return {
                        success: true,
                        message:
                            'Please check your e-mail for verification link',
                    };
                }
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { verified: true },
            });

            await createSession(cookies, user.id, { ip: getClientAddress() });

            redirect(303, '/');
        }

        return { success: false, errors: ['Unknown error'] };
    },
};
