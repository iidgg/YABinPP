import { getSession } from '$lib/server/auth';
import prisma from '@db';
import type { Actions } from '@sveltejs/kit';
import { IP } from '$lib/server/hash.js';

export async function load({ cookies }) {
    const currentSession = await getSession(cookies, { redirectIfNone: true });

    const sessions = await prisma.session.findMany({
        where: { userId: currentSession.userId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            ip: true,
            expiresAt: true,
            lastActive: true,
        },
    });

    return { sessions, current: currentSession.id };
}

export const actions: Actions = {
    test: async ({ cookies, request }) => {
        await getSession(cookies, { redirectIfNone: true });
        const formData = await request.formData();
        const hash = formData.get('hash');
        const ip = formData.get('ip');

        if (hash && ip)
            return { match: IP.compare(hash.toString(), ip.toString()) };
    },
};
