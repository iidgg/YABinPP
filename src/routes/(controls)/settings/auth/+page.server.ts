import { getUserIdFromCookie } from '$lib/server/auth';
import type { PageServerLoad } from './$types';
import prisma from '@db';

export const load: PageServerLoad = async ({ cookies }) => {
    const userId = await getUserIdFromCookie(cookies, true);
    const twoFAs = await prisma.twoFA.findMany({
        where: { userId: userId },
        select: { type: true, active: true },
    });

    return { twoFAs };
};
