import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserIdFromCookie } from '$lib/server/auth';
import { compare as comparePassword } from '$lib/utils/hash';
import { TwoFA } from '$lib/constants/twoFAs';
import prisma from '@db';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { password } = await request.json();
    const userId = await getUserIdFromCookie(cookies);

    if (!userId) {
        return json(
            { success: false, error: 'Unauthorized access' },
            { status: 401 },
        );
    }

    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user || !comparePassword(user.password, password.toString())) {
        return json(
            { success: false, error: 'Invalid username or password' },
            { status: 401 },
        );
    }

    if (!user.verified) {
        return json(
            { success: false, error: 'Account not verified' },
            { status: 401 },
        );
    }

    await prisma.twoFA.delete({
        where: { userId_type: { userId, type: TwoFA.TOTP } },
    });

    const response = {
        success: true,
    };

    return json(response);
};
