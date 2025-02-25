import { getUserFromCookie } from '$lib/server/auth';
import type { UserSettings } from '$lib/types';

export async function load({ cookies }) {
    const user = await getUserFromCookie(cookies, { redirectIfNone: false });

    return {
        loggedIn: !!user,
        settings: user ? (user.settings as UserSettings) : undefined,
    };
}
