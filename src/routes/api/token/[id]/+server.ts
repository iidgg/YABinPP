import { json, type RequestHandler } from '@sveltejs/kit';
import type {
    TokenUpdate,
    SuccessResponse,
    TokenUpdateResponse,
} from '$lib/types';
import { getUserIdFromCookie } from '$lib/server/auth';
import { deleteToken, setToken } from '$lib/server/token';

/** Edit token name or permissions */
export const POST: RequestHandler = async ({ request, cookies, params }) => {
    const { name, scopes, expiresAt }: TokenUpdate = await request.json();
    const userId = await getUserIdFromCookie(cookies);

    if (!userId || !params.id) {
        return json(
            { success: false, error: 'Unauthorized access' },
            { status: 401 },
        );
    }

    const token = await setToken({
        tokenId: params.id,
        userId,
        name,
        scopes,
        expiresAt,
    });

    if (!token) {
        return json(
            {
                success: false,
                error: 'An error occurred while setting token info',
            },
            { status: 500 },
        );
    }

    const response: TokenUpdateResponse = {
        success: true,
        data: { id: token.id, name: token.name },
    };

    return json(response);
};

export const DELETE: RequestHandler = async ({ cookies, params }) => {
    const userId = await getUserIdFromCookie(cookies);

    if (!userId || !params.id) {
        return json(
            { success: false, error: 'Unauthorized access' },
            { status: 401 },
        );
    }

    const deleted = await deleteToken(userId, params.id);

    if (!deleted) {
        return json(
            {
                success: false,
                error: 'An error occurred while deleting token',
            },
            { status: 500 },
        );
    }

    const response: SuccessResponse = {
        success: true,
    };

    return json(response);
};
