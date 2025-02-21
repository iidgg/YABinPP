import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import prisma from '@db';
import { Password } from '$lib/server/hash';
import { validatePassword } from '$lib/server/validate';

export const load: PageServerLoad = async ({ url }) => {
    const userId = url.searchParams.get('userId');
    const token = url.searchParams.get('token');

    if (!userId || !token) {
        error(404, 'Not found');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const resetToken = await prisma.resetToken.findUnique({
        where: { token: token },
    });

    if (!user || !resetToken) {
        error(404, 'Not found');
    }

    if (resetToken.expiresAt <= new Date()) {
        error(404, 'Expired link');
    }
};

export const actions: Actions = {
    default: async ({ url, request }) => {
        const userId = url.searchParams.get('userId');
        if (!userId) error(404, 'Not found');

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) error(404, 'Not found');

        const data = await request.formData();
        const newPassword = data.get('new-password');
        const cnfPassword = data.get('confirm-password');
        const errors: string[] = [];

        if (!newPassword || !cnfPassword) {
            errors.push('All fields are required');
        }

        if (newPassword !== cnfPassword) {
            errors.push('Passwords need to match');
        }

        try {
            if (newPassword) validatePassword(newPassword);
        } catch (e: unknown) {
            errors.push((e as Error).message);
        }

        if (newPassword) {
            if (Password.compare(user.password, newPassword.toString())) {
                errors.push('Cannot use existing password');
            }
        }

        if (errors.length > 0) {
            return fail(400, { success: false, errors });
        }

        if (newPassword && cnfPassword) {
            const newPasswordHash = Password.hash(
                newPassword.toString(),
            ).join();
            await prisma.user.update({
                where: { id: userId },
                data: { password: newPasswordHash },
            });
            await prisma.resetToken.delete({ where: { userId: userId } });
            redirect(303, '/login');
        }

        return { success: false, errors: ['Unknown error'] };
    },
};
