import { getUserIdFromCookie } from '$lib/server/auth';
import prisma from '@db';
import { type Actions } from '@sveltejs/kit';

// maybe move that into an env var?
const PAGE_SIZE = 10;

export async function load({ cookies }) {
    const userId = await getUserIdFromCookie(cookies, true);
    const pastes = await prisma.paste.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
        select: {
            key: true,
            title: true,
            createdAt: true,
            expiresAt: true,
            language: true,
        },
        take: PAGE_SIZE,
    });

    return { pastes, pageSize: PAGE_SIZE };
}

export const actions: Actions = {
    fetch: async ({ cookies, request }) => {
        const userId = await getUserIdFromCookie(cookies, true);
        const data = await request.formData();
        const _before = data.get('before')?.toString();
        const _after = data.get('after')?.toString();
        const before = _before ? new Date(_before) : undefined;
        const after = _after ? new Date(_after) : undefined;

        if (!before && !after) return { pastes: [] };

        const pastes = await prisma.paste.findMany({
            where: {
                ownerId: userId,
                createdAt: { gt: after, lt: before },
            },
            select: {
                key: true,
                title: true,
                createdAt: true,
                expiresAt: true,
                language: true,
            },
            orderBy: { createdAt: 'desc' },
            take: PAGE_SIZE,
        });

        return { pastes, pageSize: PAGE_SIZE };
    },
};
