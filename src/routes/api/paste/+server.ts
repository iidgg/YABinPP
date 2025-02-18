import { json, type HttpError, type RequestHandler } from '@sveltejs/kit';
import type {
    Paste,
    PasteCreateResponse,
    PastePatch,
    PastePatchResponse,
} from '$lib/types';
import prisma from '@db';
import { getPaste } from '$lib/server/services.js';
import { getUserIdFromCookie } from '$lib/server/auth';
import { env } from '$env/dynamic/public';
import { getTokenInfo, isScopeEnabled } from '../../../lib/server/token';

export const GET: RequestHandler = async ({ cookies, request, url }) => {
    const key = url.searchParams.get('key');
    if (!key) {
        return json(
            { success: false, error: 'No key provided' },
            { status: 400 },
        );
    }

    let paste;
    try {
        paste = await getPaste(key);
    } catch (e) {
        if (e?.constructor?.name === 'HttpError') {
            const httpError = e as HttpError;
            return json(
                { success: false, error: httpError.body.message },
                { status: httpError.status },
            );
        }
        return json(
            { success: false, error: 'An error occurred' },
            { status: 500 },
        );
    }

    if (!paste) {
        return json(
            { success: false, error: 'Paste not found' },
            { status: 404 },
        );
    }

    const response: PasteCreateResponse = {
        success: true,
        data: paste,
    };

    if (!paste.hidden) {
        return json(response);
    }

    // Paste is hidden, verify auth
    const token = request.headers.get('Authorization');
    let userId: string | null;

    if (token) {
        const info = await getTokenInfo(token);
        if (!info || !isScopeEnabled(info.scopes, 'paste.read')) {
            return json({ success: false }, { status: 401 });
        }

        userId = info.userId;
    } else {
        userId = await getUserIdFromCookie(cookies, false);
    }

    // User provided auth & user owns it.
    if (userId && userId === paste.ownerId) {
        return json(response);
    }

    return json({ success: false }, { status: 401 });
};

export const POST: RequestHandler = async ({ cookies, request }) => {
    const token = request.headers.get('Authorization');
    const { title, content, passwordProtected, initVector, config }: Paste =
        await request.json();

    let userId: string | null;

    if (token) {
        const info = await getTokenInfo(token);
        if (!info || !isScopeEnabled(info.scopes, 'paste.write')) {
            return json({ success: false }, { status: 401 });
        }

        userId = info.userId;
    } else {
        userId = await getUserIdFromCookie(cookies, false);
    }

    if (env.PUBLIC_ANONYMOUS_PASTES_ENABLED === 'false' && !userId) {
        return json(
            {
                success: false,
                error: 'Anonymous pastes are disabled',
            } as PasteCreateResponse,
            {
                status: 403,
            },
        );
    }

    let key: string | undefined = undefined;
    if (
        config?.customPath &&
        (env.PUBLIC_CUSTOM_PATHS_ENABLED === 'true' || userId)
    ) {
        key = config.customPath.substring(0, 16);

        if (await prisma.paste.findUnique({ where: { key } })) {
            return json(
                {
                    success: false,
                    error: 'Custom path already exists',
                } as PasteCreateResponse,
                {
                    status: 400,
                },
            );
        }
    }

    if (!key) {
        let attempts = 0;
        let keyLength = 5;
        key = randomString(keyLength);
        while (await prisma.paste.findUnique({ where: { key } })) {
            key = randomString(keyLength);
            attempts++;
            if (attempts > 1) {
                keyLength++;
                attempts = 0;
            }
        }
    }

    await prisma.paste.create({
        data: {
            key,
            title,
            content,
            language: config?.language ?? 'plaintext',
            hidden: config?.hidden ?? userId ? true : false,
            encrypted: config?.encrypted ?? false,
            passwordProtected,
            expiresCount: config?.burnAfterRead ? 2 : null,
            initVector,
            expiresAt: config?.expiresAfter
                ? new Date(Date.now() + config.expiresAfter * 1000)
                : null,
            ownerId: userId,
        },
    });

    const response: PasteCreateResponse = {
        success: true,
        data: { key },
    };

    return json(response);
};

export const PATCH: RequestHandler = async ({ cookies, request }) => {
    const token = request.headers.get('Authorization');
    const { key, content, encrypted, initVector }: PastePatch =
        await request.json();

    let userId: string | null;

    if (token) {
        const info = await getTokenInfo(token);
        if (!info || !isScopeEnabled(info.scopes, 'paste.edit')) {
            return json({ success: false }, { status: 401 });
        }

        userId = info.userId;
    } else {
        userId = await getUserIdFromCookie(cookies, false);
    }

    if (!key && !content) {
        return json(
            { success: false, error: 'No key provided' } as PastePatchResponse,
            {
                status: 400,
            },
        );
    }

    if (encrypted && !initVector) {
        return json(
            {
                success: false,
                error: 'No initVector provided',
            } as PastePatchResponse,
            {
                status: 400,
            },
        );
    }

    const paste = await prisma.paste.findUnique({ where: { key } });
    if (!paste) {
        return json(
            { success: false, error: 'Paste not found' } as PastePatchResponse,
            {
                status: 404,
            },
        );
    }

    if (paste.ownerId !== userId) {
        return json(
            { success: false, error: 'Unauthorized' } as PastePatchResponse,
            {
                status: 401,
            },
        );
    }

    await prisma.paste.update({
        where: { key },
        data: {
            content,
            initVector,
        },
    });

    return json({
        success: true,
        data: { key },
    });
};

function randomString(length: number) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = length; i > 0; --i)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
