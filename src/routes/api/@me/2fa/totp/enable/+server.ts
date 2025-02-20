import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserFromCookie } from '$lib/server/auth';
import { compare as comparePassword } from '$lib/utils/hash';
import { TwoFA } from '$lib/constants/twoFAs';
import { TOTP } from '$lib/server/2fa';
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

    const secret = TOTP.generateSecret();
    const uri = TOTP.secretURI(user.username, secret);
    const twoFA = await prisma.mfa.create({
        data: {
            userId: user.id,
            type: TwoFA.TOTP,
            uri,
            secret,
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
