import { getUserIdFromCookie } from '$lib/server/auth.js';
import { getPaste } from '$lib/server/services.js';

export async function load({ cookies, params }) {
    const userId = await getUserIdFromCookie(cookies);
    const data = await getPaste(params.key);

    return {
        content: data.content,
        encrypted: data.encrypted,
        language: data.language,
        passwordProtected: data.passwordProtected,
        initVector: data.initVector,
        isOwner: userId === data.ownerId,
    };
}
