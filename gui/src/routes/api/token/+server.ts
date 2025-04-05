import type { TokenCreate, TokenPostResponse } from '$lib/types';
import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserIdFromCookie } from '$lib/server/auth';
import { countTokens, generateToken } from '$lib/server/token';
import { TOKENS_PER_USER } from '$lib/server/env';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { name, scopes, expiresAt }: TokenCreate = await request.json();
    const userId = await getUserIdFromCookie(cookies, false);

    if (!userId) {
        return json(
            { success: false, error: 'Unauthorized access' },
            { status: 401 },
        );
    }

    const currentTokenCount = await countTokens(userId);

    if (currentTokenCount >= TOKENS_PER_USER) {
        return json(
            {
                success: false,
                error: 'User reached max allowed tokens per user.',
            },
            { status: 400 },
        );
    }

    const token = await generateToken({ userId, name, scopes, expiresAt });

    if (!token) {
        return json(
            {
                success: false,
                error: 'An error occurred while generating new token',
            },
            { status: 500 },
        );
    }

    const response: TokenPostResponse = {
        success: true,
        data: {
            id: token.id,
            name: token.name,
            token: token.token,
        },
    };

    return json(response);
};
