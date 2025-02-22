<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import { INSTANCE_NAME } from '../../lib/publicEnv';
    import { detectMac } from '../../lib/utils/util';
    import sanitize from 'sanitize-html';

    export let data: PageData;
    let {
        title,
        isOwner,
        content,
        contentHtml,
        language,
        encrypted,
        passwordProtected,
        initVector,
    } = data;
    let password = '';
    let isDecrypted = false;
    let codeRef: HTMLElement;
    let pwInputRef: HTMLInputElement;
    let error: string;

    $: if (isDecrypted && codeRef && language && language !== 'plaintext') {
        (async () => {
            const Prism = (await import('prismjs')).default;
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${language}.min.js`;
            script.onload = () => Prism.highlightAll();
            document.body.appendChild(script);
        })();
    }

    let cmdKey = 'Ctrl';
    onMount(() => {
        const isMac = detectMac(navigator);
        cmdKey = isMac ? '⌘' : 'Ctrl';

        pwInputRef?.focus();

        document.addEventListener('keydown', (e) => {
            if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                goto('/');
            }

            if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                goto('/info');
            }

            if (e.key === 'e' && (e.ctrlKey || e.metaKey) && isOwner) {
                e.preventDefault();
                editPaste();
            }

            if (e.key === 'c' && e.altKey && e.shiftKey) {
                e.preventDefault();
                copyContent();
            }

            if (
                encrypted &&
                passwordProtected &&
                !isDecrypted &&
                e.key === 'Enter'
            ) {
                e.preventDefault();
                decryptPassword();
            }
        });

        if (encrypted && !passwordProtected) {
            contentHtml = 'Decrypting...';
            (async () => {
                try {
                    const keyStr = $page.url.hash.slice(1);
                    if (!initVector || !keyStr) throw new Error('Missing key');
                    if (!content) throw new Error('Missing content');

                    const { decrypt } = await import('$lib/crypto');
                    content = await decrypt(
                        content,
                        initVector,
                        decodeURIComponent(keyStr),
                    );
                } catch (e) {
                    error = 'Failed to decrypt';
                } finally {
                    isDecrypted = true;
                }
            })();
        }
    });

    async function decryptPassword() {
        try {
            if (!initVector) throw new Error('Missing key');
            if (!content) throw new Error('Missing content');

            const { decryptWithPassword } = await import('$lib/crypto');
            content = await decryptWithPassword(content, initVector, password);
        } catch (e) {
            error = 'Failed to decrypt';
        } finally {
            isDecrypted = true;
        }
    }

    function copyContent() {
        if (content) {
            navigator.clipboard.writeText(content);
        }
    }

    function editPaste() {
        const key = $page.params.key;
        const keyStr = $page.url.hash.slice(1);
        goto(`/${key}/edit#${keyStr}`);
    }

    function openRaw() {
        const url = new URL($page.url.toString());
        url.searchParams.set('r', '');
        const confirmMsg =
            "WARNING: Getting the raw will decrypt the content on the server. It's not recommended to get the raw if the content is encrypted. Continue?";

        if (encrypted && !passwordProtected) {
            if (!confirm(confirmMsg)) return;
            url.searchParams.set('k', decodeURIComponent(url.hash.slice(1)));
            url.hash = '';
        }
        if (passwordProtected) url.searchParams.set('p', password);
        window.open(url.toString(), '_self');
    }
</script>

<div class="p-2 min-h-screen w-screen flex flex-col text-primary">
    <div class="pb-4">
        <div class="flex flex-row items-center gap-4">
            <h1 class="mr-auto text-2xl"><a href="/">{INSTANCE_NAME}</a></h1>

            <button
                class="underline underline-offset-4 px-2 py-1"
                title="{cmdKey}+I"
                on:click={() => goto('/info')}
            >
                Info
            </button>

            <button
                class="underline underline-offset-4 px-2 py-1"
                title="{cmdKey}+N"
                on:click={() => goto('/')}
            >
                New
            </button>

            <button
                class="underline underline-offset-4 px-2 py-1"
                title={encrypted
                    ? 'Warning: If you get the raw, it will decrypt on the server'
                    : ''}
                on:click={openRaw}
            >
                Raw
            </button>

            {#if isOwner}
                <button
                    class="bg-pink-500 text-black text-lg px-4 py-1"
                    title="{cmdKey}+E"
                    on:click={editPaste}>Edit</button
                >
            {/if}

            <button
                class="bg-amber-500 text-black text-lg px-4 py-1"
                title="{cmdKey}+C"
                on:click={copyContent}
            >
                Copy
            </button>
        </div>
    </div>

    {#if title}
        <p
            id="title"
            title="Titled: {title}"
            class="bg-dark py-2 italic text-gray-200 text-lg text-center"
        >
            {title}
        </p>
    {/if}

    {#if !encrypted}
        <div class="grow whitespace-pre bg-dark p-4 overflow-x-scroll">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html sanitize(contentHtml, { disallowedTagsMode: 'escape' })}
        </div>
    {:else if error}
        <div class="md:mt-10 text-center text-lg">
            {error}
        </div>
    {:else if passwordProtected && !isDecrypted}
        <div class="flex flex-col items-center gap-4 md:mt-10">
            <input
                class="md:w-1/3 text-lg px-4 py-1 bg-dark text-white"
                type="text"
                placeholder="Enter password..."
                bind:this={pwInputRef}
                bind:value={password}
            />
            <button
                class="md:w-fit bg-amber-500 text-black text-lg px-4 py-1"
                on:click={decryptPassword}
            >
                Decrypt
            </button>
        </div>
    {:else}
        <div class="grow whitespace-pre bg-dark p-4 overflow-x-scroll">
            <pre><code bind:this={codeRef} class="language-{language}"
                    >{content}</code
                ></pre>
        </div>
    {/if}
</div>

<svelte:head>
    <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"
        integrity="sha512-vswe+cgvic/XBoF1OcM/TeJ2FW0OofqAVdCZiEYkd6dwGXthvkSFWOoGGJgS2CW70VK5dQM5Oh+7ne47s74VTg=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
    />
</svelte:head>

<style>
    pre {
        background-color: var(--color-dark) !important;
        padding: 0 !important;
        margin: 0 !important;
    }

    #title {
        opacity: 0.8;
        border-bottom: 10px;
        border-color: rgb(11, 48, 71);
        background-size: 10px 10px;
        background-image: repeating-linear-gradient(
            45deg,
            rgb(11, 48, 71) 0,
            rgb(11, 48, 71) 1px,
            var(--color-dark) 0,
            var(--color-dark) 50%
        );
    }
</style>
