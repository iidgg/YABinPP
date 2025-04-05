import { getUserFromCookie, getUserIdFromCookie } from '$lib/server/auth';
import { type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '@db';
import type { UserSettings } from '$lib/types';

export const load: PageServerLoad = async ({ cookies }) => {
    const user = await getUserFromCookie(cookies, { redirectIfNone: true });

    return { settings: user?.settings as UserSettings };
};

export const actions: Actions = {
    defaults: async ({ cookies, request }) => {
        const userId = await getUserIdFromCookie(cookies, true);
        const formData = await request.formData();
        const expiresAfterSeconds = parseInt(
            formData.get('expires-after-seconds')?.toString() ?? '0',
        );
        const data = {
            hidden: formData.get('hidden') === 'on',
            encrypted: formData.get('encrypted') === 'on',
            burnAfterRead: formData.get('burn-after-read') === 'on',
            expiresAfterSeconds: Math.max(
                0,
                Math.min(365 * 24 * 3600, expiresAfterSeconds),
            ),
        };

        const user = await prisma.user.update({
            where: { id: userId },
            data: { settings: { defaults: data } },
            select: { settings: true },
        });

        return {
            defaultsForm: {
                success: true,
                settings: user.settings as UserSettings,
            },
        };
    },
};
