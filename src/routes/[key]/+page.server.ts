import { getUserIdFromCookie } from '$lib/server/auth';
import { getPaste } from '$lib/server/services.js';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
import sanitize from 'sanitize-html';

export async function load({ cookies, params }) {
    const { key } = params;

    const userId = await getUserIdFromCookie(cookies, false);
    const paste = await getPaste(key);
    const { title, content, language, encrypted } = paste;

    if (paste.hidden && paste.ownerId !== userId) {
        return {
            contentHtml: 'Unauthorized: Private paste.',
            isOwner: false,
        };
    }

    let contentHtml: string;

    try {
        if (!encrypted && language !== 'plaintext') {
            loadLanguages(language);
            contentHtml = Prism.highlight(
                content,
                Prism.languages[language],
                language,
            );
        } else {
            contentHtml = sanitize(content, { disallowedTagsMode: 'escape' });
        }
    } catch (e) {
        console.error(e);
        contentHtml = sanitize(content, { disallowedTagsMode: 'escape' });
    }

    return {
        title,
        content,
        contentHtml,
        encrypted,
        language,
        passwordProtected: paste.passwordProtected,
        initVector: paste.initVector,
        isOwner: userId === paste.ownerId,
    };
}
