import { json, type RequestHandler } from '@sveltejs/kit';
import type { TokenResetResponse } from '$lib/types';
import { getUserIdFromCookie } from '$lib/server/auth';
import { resetToken } from '$lib/server/token';

export const POST: RequestHandler = async ({ cookies, params }) => {
    const userId = await getUserIdFromCookie(cookies);

    if (!userId || !params.id) {
        return json(
            { success: false, error: 'Unauthorized access' },
            { status: 401 },
        );
    }

    const newToken = await resetToken(userId, params.id);

    if (!newToken) {
        return json(
            {
                success: false,
                error: 'An error occurred while resetting token',
            },
            { status: 500 },
        );
    }

    const response: TokenResetResponse = {
        success: true,
        data: { token: newToken },
    };

    return json(response);
};
