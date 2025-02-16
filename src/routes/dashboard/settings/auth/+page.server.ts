import { getUserIdFromCookie } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '@db';

export const load: PageServerLoad = async ({ cookies }) => {
    const userId = await getUserIdFromCookie(cookies);
    if (!userId) redirect(303, '/login');

    const twoFAs = await prisma.twoFA.findMany({
        where: { userId: userId },
        select: { type: true },
    });

    return { twoFAs };
};
