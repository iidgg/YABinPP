import { error } from '@sveltejs/kit';
import prisma from '@db';

export async function getPaste(key: string) {
    const data = await prisma.paste.update({
        where: { key },
        data: { readCount: { increment: 1 } },
    });

    if (!data) error(404, 'Not found');

    const { expiresCount, readCount } = data;
    if (expiresCount !== null && expiresCount < readCount) {
        await prisma.paste.delete({ where: { key } });
        error(404, 'Not found');
    }

    const {
        title,
        content,
        hidden,
        encrypted,
        passwordProtected,
        initVector,
        language,
        ownerId,
    } = data;

    return {
        key,
        title,
        content,
        hidden,
        encrypted,
        passwordProtected,
        initVector,
        language,
        ownerId,
    };
}

export async function deleteExpiredPastes() {
    await prisma.paste.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });
}

export async function deleteExpiredTokens() {
    await prisma.apiToken.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });
}
