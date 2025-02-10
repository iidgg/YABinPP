import { getUserIdFromCookie } from '../../lib/server/auth';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
    const userId = await getUserIdFromCookie(cookies);
    if (!userId) redirect(303, '/login');
}
