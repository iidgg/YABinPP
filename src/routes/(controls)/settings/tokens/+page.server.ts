import { redirect } from '@sveltejs/kit';
import { getUserIdFromCookie } from '$lib/server/auth';
import { TOKENS_PER_USER } from '$lib/server/env';
import type { PageServerLoad } from './$types';
import { getTokens } from '$lib/server/token';

export const load: PageServerLoad = async ({ cookies }) => {
    const userId = await getUserIdFromCookie(cookies);
    if (!userId) redirect(303, '/login');

    return { tokens: await getTokens(userId), tokens_limit: TOKENS_PER_USER };
};
