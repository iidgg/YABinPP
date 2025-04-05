import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserFromCookie } from '$lib/server/auth';
import { TwoFA } from '$lib/constants/twoFAs';
import prisma from '@db';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { password } = await request.json();
    const user = await getUserFromCookie(cookies, {
        redirectIfNone: false,
        password,
    });

    if (!user) {
        return json(
            { success: false, error: 'Unauthorized access' },
            { status: 401 },
        );
    }

    await prisma.mfa.delete({
        where: { userId_type: { userId: user.id, type: TwoFA.TOTP } },
    });

    const response = {
        success: true,
    };

    return json(response);
};
