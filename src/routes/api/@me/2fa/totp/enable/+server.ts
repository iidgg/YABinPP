import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserIdFromCookie } from '$lib/server/auth';
import { compare as comparePassword } from '$lib/utils/hash';
import { TwoFA } from '$lib/constants/twoFAs';
import { TOTP } from '$lib/server/2fa';
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

    const secret = TOTP.generateSecret();
    const uri = TOTP.secretURI(user.username, secret);
    const twoFA = await prisma.twoFA.create({
        data: {
            type: TwoFA.TOTP,
            uri,
            secret,
            userId,
        },
    });

    const response = {
        success: true,
        data: {
            secret,
            uri: twoFA.uri,
        },
    };

    return json(response);
};
