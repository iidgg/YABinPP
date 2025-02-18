import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserFromCookie } from '$lib/server/auth';
import { TwoFA } from '$lib/constants/twoFAs';
import { TOTP } from '$lib/server/2fa';
import prisma from '@db';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { otp } = await request.json();
    const user = await getUserFromCookie(cookies, {
        redirectIfNone: false,
        includeUser: true,
    });

    if (!user) {
        return json(
            { success: false, error: 'Unauthorized access' },
            { status: 401 },
        );
    }

    const twoFA = await prisma.twoFA.findUnique({
        where: { userId_type: { userId: user.id, type: TwoFA.TOTP } },
    });

    if (!twoFA || twoFA.active) {
        return json({ success: false }, { status: 404 });
    }

    if (TOTP.validate(twoFA.secret, otp)) {
        await prisma.twoFA.update({
            where: { userId_type: { userId: user.id, type: TwoFA.TOTP } },
            data: { active: true },
        });

        return json({
            success: true,
        });
    }

    return json(
        {
            success: false,
        },
        { status: 401 },
    );
};
