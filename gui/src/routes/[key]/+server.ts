import { type HttpError, text, type RequestHandler } from '@sveltejs/kit';
import { getPaste } from '$lib/server/services';
import { decrypt, decryptWithPassword } from '$lib/crypto';
import { getUserIdFromCookie } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies, url, params }) => {
    const { key } = params;
    if (!key) {
        return text('No key provided', { status: 400 });
    }

    let paste;

    try {
        paste = await getPaste(key);
    } catch (e: unknown) {
        if (e?.constructor?.name === 'HttpError') {
            const httpError = e as HttpError;
            return text(httpError.body.message, { status: httpError.status });
        }
        console.error(e);
        return text('An error occurred', { status: 500 });
    }

    if (!paste) {
        return text('Paste not found', { status: 404 });
    }

    if (paste.hidden) {
        const userId = await getUserIdFromCookie(cookies, false);
        if (paste.ownerId !== userId)
            return text('Unauthorized', { status: 401 });
    }

    const { encrypted, passwordProtected, initVector } = paste;
    let { content } = paste;
    const searchParams = url.searchParams;
    const keyStr = searchParams.get('k');
    const password = searchParams.get('p');

    if (encrypted && initVector && keyStr && !passwordProtected) {
        try {
            content = await decrypt(
                content,
                initVector,
                decodeURIComponent(keyStr),
            );
        } catch (e) {
            return text('Failed to decrypt', { status: 403 });
        }
    }

    if (encrypted && initVector && passwordProtected && password) {
        try {
            content = await decryptWithPassword(
                content,
                initVector,
                decodeURIComponent(password),
            );
        } catch (e) {
            return text('Failed to decrypt', { status: 403 });
        }
    }

    return text(content);
};
