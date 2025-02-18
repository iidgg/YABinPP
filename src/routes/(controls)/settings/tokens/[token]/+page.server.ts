import { getUserIdFromCookie } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { countTokens, getToken } from '$lib/server/token';
import { bitsToArray } from '$lib/utils/bitmask';
import { API_TOKEN_SCOPES_MAP, type TokenScopes } from '$lib/constants/scopes';
import { TOKENS_PER_USER } from '$lib/server/env';

export const load: PageServerLoad = async ({ cookies, params }) => {
    const userId = await getUserIdFromCookie(cookies);
    if (!userId) redirect(303, '/login');

    const { token: tokenId } = params;
    if (tokenId === 'new') {
        return { max: (await countTokens(userId)) >= TOKENS_PER_USER };
    }

    const token = await getToken(tokenId);
    if (!token || token.userId !== userId) redirect(303, '/settings/tokens');

    return {
        token: {
            ...token,
            scopes: bitsToArray(
                token.scopes,
                API_TOKEN_SCOPES_MAP,
            ) as TokenScopes[],
        },
    };
};
