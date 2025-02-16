import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserIdFromCookie } from '$lib/server/auth';
import { TwoFA } from '$lib/constants/twoFAs';
import { TOTP } from '$lib/server/2fa';
import prisma from '@db';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { otp } = await request.json();
    const userId = await getUserIdFromCookie(cookies);

    if (!userId) {
        return json(
            { success: false, error: 'Unauthorized access' },
            { status: 401 },
        );
    }

    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user || !user.verified) {
        return json(
            { success: false, error: 'Account not verified' },
            { status: 401 },
        );
    }

    const twoFA = await prisma.twoFA.findUnique({
        where: { userId_type: { userId, type: TwoFA.TOTP } },
    });

    if (!twoFA || twoFA.active) {
        return json({ success: false }, { status: 404 });
    }

    if (TOTP.validate(twoFA.secret, otp)) {
        await prisma.twoFA.update({
            where: { userId_type: { userId, type: TwoFA.TOTP } },
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
