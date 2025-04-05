import { getUserIdFromCookie } from '$lib/server/auth';

export async function load({ cookies }) {
    await getUserIdFromCookie(cookies, true);
}
