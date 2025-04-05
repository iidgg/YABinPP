import { getUserIdFromCookie } from '$lib/server/auth.js';
import { getPaste } from '$lib/server/services.js';

export async function load({ cookies, params }) {
    const userId = await getUserIdFromCookie(cookies, false);
    const paste = await getPaste(params.key);

    const data = {
        content: paste.content,
        hidden: paste.hidden,
        encrypted: paste.encrypted,
        language: paste.language,
        passwordProtected: paste.passwordProtected,
        initVector: paste.initVector,
        isOwner: userId === paste.ownerId,
    };

    if (data.isOwner) {
        return data;
    }

    return { isOwner: false };
}
