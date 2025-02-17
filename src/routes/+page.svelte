<script lang="ts">
    import { goto } from '$app/navigation';
    import { languageKeysByName } from '$lib/data';
    import { INSTANCE_NAME } from '$lib/publicEnv';
    import type {
        Paste,
        PasteConfig,
        PasteCreateResponse,
        UserSettings,
    } from '$lib/types';
    import { onMount } from 'svelte';
    import Select from 'svelte-select';
    import { encrypt, encryptWithPassword } from '$lib/crypto';
    import Hamburger from '$lib/components/icons/Hamburger.svelte';
    import { env } from '$env/dynamic/public';
    import type { PageData } from './$types';
    import { DHMToSeconds, secondsToDHM } from '$lib/utils/time';
    import { detectMac } from '../lib/utils/util';

    export let data: PageData;

    const initialConfig: PasteConfig = {
        language: 'plaintext',
        encrypted: true,
        expiresAfter: 5,
        burnAfterRead: false,
    };

    let expiresAfter: {
        days?: number;
        hours?: number;
        minutes?: number;
    } = {};

    $: {
        let expiresAfterSeconds = DHMToSeconds(expiresAfter);
        // Don't allow pastes to be saved for more than a year
        expiresAfterSeconds = Math.min(expiresAfterSeconds, 365 * 24 * 60 * 60);
        // Don't allow pastes to be saved for less than 5 minutes
        if (expiresAfterSeconds > 0) {
            expiresAfterSeconds = Math.max(expiresAfterSeconds, 5 * 60);
            expiresAfter = secondsToDHM(expiresAfterSeconds);
        } else {
            expiresAfter = {};
        }

        config.expiresAfter = expiresAfterSeconds;
    }

    let inputRef: HTMLTextAreaElement;
    let placeholderRef: HTMLDivElement;
    let cmdKey = 'Ctrl';
    let title: string = '';
    let content: string = '';
    let password: string = '';
    let config: PasteConfig = { ...initialConfig };
    let sidebarOpen = false;

    const updateInitialConfig = (defaults: UserSettings['defaults']) => {
        if (!defaults) return;
        if (defaults?.hidden !== undefined) config.hidden = defaults.hidden;
        if (defaults?.encrypted !== undefined)
            config.encrypted = defaults.encrypted;
        if (defaults?.burnAfterRead !== undefined)
            config.burnAfterRead = defaults.burnAfterRead;
        if (defaults?.expiresAfterSeconds) {
            expiresAfter = secondsToDHM(defaults.expiresAfterSeconds);
            config.expiresAfter = defaults.expiresAfterSeconds;
        }
    };
    $: updateInitialConfig(data?.settings?.defaults);

    let _sessionStorage: Storage | undefined;

    $: if (_sessionStorage) {
        const pasteData: { content: string; config: PasteConfig } = {
            content,
            config,
        };
        _sessionStorage.setItem('contentBackup', JSON.stringify(pasteData));
    }

    onMount(() => {
        _sessionStorage = sessionStorage;
        const contentBackup = _sessionStorage.getItem('contentBackup');
        if (contentBackup) {
            const data: { content: string; config: PasteConfig } =
                JSON.parse(contentBackup);
            content = data.content;
            config = {
                ...config,
                language: data.config.language ?? config.language,
            };
        }

        inputRef.focus();
        const isMac = detectMac(navigator);
        cmdKey = isMac ? '⌘' : 'Ctrl';

        document.addEventListener('keydown', (e) => {
            if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                save();
            }

            if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
                newPaste(e);
            }

            if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                goto('/info');
            }
        });
    });

    const newPaste = (e: MouseEvent | KeyboardEvent) => {
        e?.preventDefault();
        content = '';
        password = '';
        config = { ...initialConfig };
        sessionStorage.removeItem('contentBackup');
    };

    const save = async () => {
        if (!content) return;

        let finalContent = content;
        let urlParams = '';
        let passwordProtected = false;
        let initVector: string | undefined;

        if (config.encrypted) {
            if (password) {
                passwordProtected = true;
                const { ciphertext, iv } = await encryptWithPassword(
                    content,
                    password,
                );
                finalContent = ciphertext;
                initVector = iv;
            } else {
                const { ciphertext, iv, key } = await encrypt(content);
                finalContent = ciphertext;
                initVector = iv;
                urlParams = `#${encodeURIComponent(key)}`;
            }
        }

        const data: Paste = {
            title,
            content: finalContent,
            passwordProtected,
            initVector,
            config,
        };

        try {
            const response = await fetch('/api/paste', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const json: PasteCreateResponse = await response.json();
            if (json.success) {
                _sessionStorage?.removeItem('contentBackup');
                await goto(`/${json.data?.key}${urlParams}`);
            } else {
                alert(json.error);
                console.log(json);
            }
        } catch (e) {
            console.log(e);
        }
    };

    $: config.customPath = config.customPath
        ? config.customPath.substring(0, 16)
        : undefined;
</script>

<div class="sm:hidden flex flex-row gap-2 items-center px-4 py-2">
    <h1 class="text-4xl mr-auto"><a href="/">{INSTANCE_NAME}</a></h1>

    <button class="bg-amber-500 text-black text-lg px-4 py-1" on:click={save}
        >Save</button
    >

    <Hamburger bind:open={sidebarOpen} />
</div>

<div class="h-screen grid grid-cols-12 text-primary">
    <div
        class="p-2 col-span-12 sm:col-span-8 lg:col-span-10 flex flex-col relative"
    >
        <div class="flex items-center car mx-4 my-1">
            <label for="title" class="px-2 text-gray-400">Title:</label>
            <input
                class="flex-grow italic text-gray-200 border-none outline-none bg-transparent resize-none border-b-2"
                spellcheck="false"
                id="title"
                bind:value={title}
            />
        </div>
        <textarea
            class="px-2 grow border-none outline-none bg-transparent resize-none"
            spellcheck="false"
            bind:value={content}
            bind:this={inputRef}
            disabled={env.PUBLIC_ANONYMOUS_PASTES_ENABLED === 'false' &&
                !data.loggedIn}
        />
        <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-lg -z-10 opacity-40 hidden"
            class:hidden={content}
            bind:this={placeholderRef}
        >
            {#if env.PUBLIC_ANONYMOUS_PASTES_ENABLED === 'false' && !data.loggedIn}
                Anonymous pastes are disabled on this server. <br />
                You need to login to save pastes.
            {:else}
                Type or paste anything here, and then {cmdKey}+S to save.
                <br /> <br />
                Optionally, set a title for you to see later. Saved title will not
                be encrypted.
            {/if}
            <br /><br />
            Visit Info page to get the APIs and more.
        </div>
    </div>
    <div
        class="sm:col-span-4 lg:col-span-2 max-sm:fixed max-sm:bg-black max-sm:bg-opacity-50 max-sm:backdrop-blur max-sm:h-full max-sm:w-full max-h-screen overflow-x-hidden overflow-y-auto"
        class:expanded={sidebarOpen}
        id="sidebar"
    >
        <div
            class="xl:py-4 px-2 md:mt-4 flex flex-col items-center gap-2 2xl:gap-4"
        >
            <h1 class="text-4xl mb-5 max-sm:hidden">
                <a href="/">{INSTANCE_NAME}</a>
            </h1>

            {#if env.PUBLIC_ANONYMOUS_PASTES_ENABLED === 'false' && !data.loggedIn}
                <button
                    class="bg-amber-500 text-black text-lg px-4 py-1 my-1 w-full max-sm:hidden"
                    title="{cmdKey}+S"
                    on:click={() => goto('/login')}
                >
                    Login
                </button>
            {:else}
                <button
                    class="bg-amber-500 text-black text-lg px-4 py-1 my-1 w-full max-sm:hidden"
                    title="{cmdKey}+S"
                    on:click={save}
                >
                    Save
                </button>
            {/if}

            <div class="flex flex-row gap-4 justify-center">
                <button
                    class="underline underline-offset-4 py-1"
                    title="{cmdKey}+N"
                    on:click={newPaste}
                >
                    New
                </button>
                <button
                    class="underline underline-offset-4 px-2 py-1"
                    title="{cmdKey}+N"
                    on:click={() => goto('/info')}
                >
                    Info
                </button>
            </div>

            {#if env.PUBLIC_ANONYMOUS_PASTES_ENABLED !== 'false' || data.loggedIn}
                <div class="flex flex-row gap-4 mb-4 justify-center">
                    {#if data.loggedIn}
                        <a
                            href="/dashboard"
                            class="underline underline-offset-4 py-1"
                            >Dashboard</a
                        >
                        <form action="/logout" method="post">
                            <button class="underline underline-offset-4 py-1"
                                >Logout</button
                            >
                        </form>
                    {:else}
                        <a
                            class="underline underline-offset-4 py-1"
                            href="/login">Login</a
                        >
                        {#if env.PUBLIC_REGISTRATION_ENABLED == 'true'}
                            <a
                                class="underline underline-offset-4 py-1"
                                href="/register">Register</a
                            >
                        {/if}
                    {/if}
                </div>
            {/if}

            <Select
                class="px-1 py-1"
                items={Array.from(languageKeysByName, ([label, value]) => ({
                    label,
                    value,
                }))}
                value={config.language}
                bind:justValue={config.language}
                showChevron
                clearable={false}
                --background="var(--color-dark)"
                --list-background="#000"
                --item-hover-bg="rgb(245, 158, 11)"
                --item-hover-color="#000"
                --border="0"
            />

            {#if env.PUBLIC_CUSTOM_PATHS_ENABLED === 'true' || data.loggedIn}
                <input
                    type="text"
                    class="bg-dark px-2 py-1 w-full"
                    placeholder="Custom Path"
                    bind:value={config.customPath}
                />
            {/if}

            <div>
                <label for="encrypted" class="py-1">Encrypted?</label>
                <input
                    id="encrypted"
                    type="checkbox"
                    bind:checked={config.encrypted}
                />
            </div>

            <input
                type="text"
                class="bg-dark px-2 py-1 w-full"
                placeholder="Password"
                autocomplete="new-password"
                disabled={!config.encrypted}
                bind:value={password}
            />
            <small
                class="text-center text-xs hidden"
                class:hidden={config.encrypted}
            >
                Need to enable encryption to use a password
            </small>

            <div>
                <label for="burn" class="py-1">Burn after read?</label>
                <input
                    id="burn"
                    type="checkbox"
                    bind:checked={config.burnAfterRead}
                />
            </div>

            <div>
                <label for="hidden" class="py-1">Private?</label>
                <input
                    id="hidden"
                    type="checkbox"
                    bind:checked={config.hidden}
                />
            </div>

            <div class="w-full">
                <span>Expires in:</span>
                <div class="grid grid-cols-3 gap-2 justify-center items-center">
                    <input
                        type="number"
                        class="bg-dark py-1 text-center"
                        placeholder="DD"
                        bind:value={expiresAfter.days}
                    />
                    <input
                        type="number"
                        class="bg-dark py-1 text-center"
                        placeholder="HH"
                        bind:value={expiresAfter.hours}
                    />
                    <input
                        type="number"
                        class="bg-dark py-1 text-center"
                        placeholder="MM"
                        bind:value={expiresAfter.minutes}
                    />
                </div>
            </div>

            <a
                class="underline underline-offset-4 px-2 py-1"
                href="https://github.com/iidgg/YABinPP"
            >
                Source Code
            </a>

            <a
                class="underline underline-offset-4 px-2 py-1"
                href="https://github.com/iidgg/YABinPP/tree/main/cli"
            >
                CLI Client
            </a>

            <div class="flex flex-row gap-4 justify-center">
                <a
                    class="github-button"
                    href="https://github.com/iidgg/YABinPP"
                    data-color-scheme="no-preference: dark; light: light; dark: dark;"
                    data-icon="octicon-star"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Star iidgg/YABinPP on GitHub">Star</a
                >

                <a
                    class="github-button"
                    href="https://github.com/iidgg/YABinPP/issues"
                    data-color-scheme="no-preference: dark; light: light; dark: dark;"
                    data-icon="octicon-issue-opened"
                    data-size="large"
                    aria-label="Issue iidgg/YABinPP on GitHub">Issue</a
                >
            </div>
        </div>
    </div>
</div>

<style lang="postcss">
    #sidebar {
        right: -100%;
        transition: right 0.3s ease-out;

        &.expanded {
            right: 0;
        }
    }
</style>
