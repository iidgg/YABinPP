import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserFromCookie } from '$lib/server/auth';
import { compare as comparePassword } from '$lib/utils/hash';
import { TwoFA } from '$lib/constants/twoFAs';
import prisma from '@db';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { password } = await request.json();
    const user = await getUserFromCookie(cookies, {
        redirectIfNone: false,
        includeUser: true,
    });

    if (!user || !comparePassword(user.password, password.toString())) {
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
