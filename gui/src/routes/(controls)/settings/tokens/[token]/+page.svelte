<script lang="ts">
    import { goto } from '$app/navigation';
    import type { StrictDict, TokenPostResponse } from '$lib/types';
    import { DHMToSeconds, secondsToDHM } from '$lib/utils/time';
    import type { PageData } from './$types';
    import { page } from '$app/stores';
    import {
        API_TOKEN_SCOPES_DESCRIPTION,
        API_TOKEN_SCOPES_MAP,
        type TokenScopes,
    } from '$lib/constants/scopes';

    export let data: PageData;

    let loading = false,
        saved = false,
        name = data.token?.name.trim(),
        expiresAfterSeconds: number = 0,
        expiresAt: Date,
        expiresAfter: {
            days?: number;
            hours?: number;
            minutes?: number;
        } = {},
        currentToken = {
            name: '',
            scopes: {} as StrictDict<TokenScopes, boolean | undefined>,
        },
        newToken: string | undefined;

    if (data.token) {
        data.token.scopes.forEach(
            (scope) => (currentToken.scopes[scope] = true),
        );
    }

    $: {
        expiresAfterSeconds = DHMToSeconds(expiresAfter);
        // Don't allow pastes to be saved for more than a year
        expiresAfterSeconds = Math.min(expiresAfterSeconds, 365 * 24 * 60 * 60);
        // Don't allow pastes to be saved for less than 5 minutes
        if (expiresAfterSeconds > 0) {
            expiresAfterSeconds = Math.max(expiresAfterSeconds, 5 * 60);
            expiresAfter = secondsToDHM(expiresAfterSeconds);
        } else {
            expiresAfter = {};
        }

        expiresAt = new Date(Date.now() + expiresAfterSeconds * 1000);
    }

    const formattedScopes = (function format() {
        const result: {
            name: string;
            scopes: TokenScopes[];
        }[] = [];
        const grouped: { [key: string]: string[] } = {};

        for (const key in API_TOKEN_SCOPES_MAP) {
            const [name, scope] = key.split('.');
            if (!grouped[name]) grouped[name] = [];
            if (scope) grouped[name].push(key);
            // else result.push({ name }); // ignore, for now
        }

        for (const name in grouped) {
            result.push({
                name,
                scopes: grouped[name] as TokenScopes[],
            });
        }

        return result;
    })();

    async function handleSubmission() {
        const body = JSON.stringify({
            name,
            scopes: Object.entries(currentToken.scopes)
                .map(([scope, enabled]) => (enabled ? scope : undefined))
                .filter((k) => k),
            expiresAt: expiresAfterSeconds > 1 ? expiresAt : undefined,
        });

        loading = true;
        const res = await fetch(
            $page.params.token === 'new'
                ? '/api/token'
                : `/api/token/${$page.params.token}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            },
        );

        loading = false;
        const json: TokenPostResponse = await res.json();
        if (json.success && json.data) {
            saved = true;
            setTimeout(() => (saved = false), 2000);
            newToken = json.data.token;
        }
    }

    async function handleDeletion() {
        if (!currentToken) return;

        loading = true;

        await fetch(`/api/token/${$page.params.token}`, {
            method: 'DELETE',
        });

        loading = false;
        goto('/settings/tokens');
    }

    const markAll = (scopes: TokenScopes[]) =>
        scopes.forEach((scope) => (currentToken.scopes[scope] = true));
</script>

<span class="flex flex-col md:flex-row gap-1 md:gap-4">
    <h2 class="text-xl md:text-3xl">Generate new token</h2>
    {#if data.max}
        <p class="italic text-sm text-gray-400">
            / Reached the maximum token limit
        </p>
    {:else if currentToken}
        <button
            on:click={handleDeletion}
            class="italic text-red-400 disabled:animate-pulse hover:underline"
            disabled={loading}
            >/ Delete ({currentToken.name ||
                `id: ${$page.params.token.slice(0, 6)}..`})</button
        >
    {/if}
</span>

{#if newToken}
    <div
        class="p-4 bg-green-100 border-l-4 border-teal-500 text-teal-700 rounded"
        role="alert"
    >
        <p class="font-bold">Generated Successfully!</p>
        <p>
            Please be sure to copy the token, as it will not be displayed again
            unless it is reset
        </p>
        <span class="flex flex-row">
            <button class="bg-amber-400 text-black text-base px-4 py-2 rounded"
                >Copy</button
            >
            <code
                class="flex items-center max-w-full overflow-x-auto px-4 ml-1 bg-slate-800 text-white rounded"
                ><p>{newToken}</p></code
            >
        </span>
    </div>

    <div class="w-screen flex max-w-full justify-center mt-4 gap-4">
        <a class="text-cyan-400" href="/settings/tokens">&lt; Back</a>
    </div>
{:else}
    <div class="flex flex-col gap-4 px-4 mt-16 md:mt-4">
        <div>
            <label for="name" class="py-2">Name</label>
            <input
                id="name"
                type="text"
                class="bg-dark py-1 text-center"
                placeholder="E.g. CLI Token"
                bind:value={name}
            />
        </div>

        <div class="flex flex-row gap-4">
            <div>
                <span>Expires in:</span>
                <div class="grid grid-cols-3 gap-2 justify-center items-center">
                    <input
                        type="number"
                        class="bg-dark py-1 text-center"
                        placeholder="Days"
                        bind:value={expiresAfter.days}
                    />
                    <input
                        type="number"
                        class="bg-dark py-1 text-center"
                        placeholder="Hours"
                        bind:value={expiresAfter.hours}
                    />
                    <input
                        type="number"
                        class="bg-dark py-1 text-center"
                        placeholder="Minutes"
                        bind:value={expiresAfter.minutes}
                    />
                </div>
                <p>
                    {expiresAfterSeconds > 1
                        ? expiresAt
                        : data.token?.expiresAt
                          ? data.token.expiresAt
                          : 'Never Expires!'}
                </p>
            </div>

            <div></div>
        </div>

        <div class="border rounded-md border-gray-700 text-gray-300">
            <ul class="p-4">
                {#each formattedScopes as scopes, index (scopes.name)}
                    <li
                        class="border-t-gray-800 px-2"
                        class:border-t={index !== 0}
                        class:mt-4={index !== 0}
                    >
                        {#if scopes.scopes}
                            <ul class="space-y-2 md:space-x-4">
                                <li class="mt-2">
                                    <span>
                                        {`${scopes.name.charAt(0).toUpperCase()}${scopes.name.slice(1)}`}s
                                    </span>
                                    <button
                                        on:click={() => markAll(scopes.scopes)}
                                        class="italic text-xs text-gray-400"
                                        >- mark all</button
                                    >
                                </li>

                                {#each scopes.scopes as scope (scope)}
                                    <li>
                                        <label class="flex items-center">
                                            <input
                                                type="checkbox"
                                                class="w-4 h-4 bg-gray-800 border border-gray-600 rounded appearance-none disabled:opacity-75 checked:bg-sky-700 checked:border-sky-700 checked:before:content-['*'] checked:before:text-white checked:before:text-xs checked:before:flex checked:before:justify-center checked:before:items-center"
                                                bind:checked={currentToken
                                                    .scopes[scope]}
                                            />

                                            <span class="ml-2 w-32 md:w-56"
                                                >{scope}</span
                                            >
                                            <span
                                                class="flex-grow text-gray-500"
                                            >
                                                {API_TOKEN_SCOPES_DESCRIPTION[
                                                    scope
                                                ]}
                                            </span>
                                        </label>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </li>
                {/each}
            </ul>
        </div>

        <div class="mt-2">
            {#if saved}
                <p class="text-green-500">Saved</p>
            {/if}

            {#if data.max}
                <p class="text-red-400">
                    You’ve reached the maximum token limit. To create new
                    tokens, please delete any you no longer need.
                </p>
            {:else}
                <button
                    class="text-black text-lg px-4 py-1 disabled:animate-pulse"
                    class:bg-green-500={$page.params.token === 'new'}
                    class:bg-amber-500={$page.params.token !== 'new'}
                    disabled={loading}
                    on:click={handleSubmission}
                >
                    {$page.params.token === 'new' ? 'Generate' : 'Save'}
                </button>
            {/if}

            <a class="text-cyan-400" href="/settings/tokens">Cancel</a>
        </div>
    </div>
{/if}
