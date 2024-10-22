<script lang="ts">
    import type { Dict, TokenResetResponse } from '$lib/types';
    import type { PageData } from './$types';

    export let data: PageData;

    interface T {
        token?: string;
        error?: string;
        copied?: boolean;
        loading: boolean;
    }

    let state: Dict<T> = {};
    for (const token of data.tokens) {
        state[token.id] = {
            token: undefined,
            error: undefined,
            loading: false,
        };
    }

    async function handleReset(id: string) {
        // if there is a token, copy it
        if (state[id].token) {
            try {
                await navigator.clipboard.writeText(state[id].token);
                state[id].copied = true;
                setTimeout(() => (state[id].copied = false), 1500);
            } catch (err) {
                alert(`Failed to copy text: ${err}`);
            }
            return;
        }

        // if there is no token, reset it
        state[id].loading = true;
        const res = await fetch(`/api/token/${id}/reset`, {
            method: 'POST',
        });

        const json: TokenResetResponse = await res.json();
        state[id].loading = false;
        if (json.success) {
            state[id].token = json.data!.token;
            delete state[id].error;
        } else {
            delete state[id].token;
            state[id].error =
                json.error || 'An error occurred while fetching token';
        }
        return;
    }
</script>

<span class="flex flex-row gap-4">
    <p>
        - Tokens {`(${data.tokens.length}/${data.tokens_limit ?? 'X'})`}
    </p>
    {#if data.tokens.length >= data.tokens_limit}
        <p class="italic text-sm text-gray-400">
            / Reached the maximum token limit
        </p>
    {:else}
        <a
            href="/dashboard/settings/tokens/new"
            class="italic text-cyan-400 hover:underline">/ Generate new token</a
        >
    {/if}
</span>

<ul>
    {#if data.tokens.length > 0}
        {#each data.tokens as token, index (index)}
            <li class="mt-2 flex flex-col">
                <div class="grid grid-cols-12 gap-x-1">
                    <span
                        class="bg-gray-800 text-center col-span-4 h-full flex items-center justify-center md:col-span-3"
                        class:text-red-500={state[token.id].error}
                    >
                        <a
                            class="text-blue-400 hover:underline"
                            class:text-blue-300={token.name.trim().length === 0}
                            class:italic={token.name.trim().length === 0}
                            href={`/dashboard/settings/tokens/${token.id}`}
                        >
                            {token.name.trim().length === 0
                                ? `Unnamed ${index + 1}`
                                : token.name}
                        </a>
                    </span>

                    <p
                        class="bg-dark text-center col-span-5 h-full flex items-center justify-center whitespace-nowrap overflow-hidden md:col-span-7"
                        class:text-red-500={state[token.id].error}
                    >
                        {state[token.id].copied
                            ? 'Copied!'
                            : state[token.id].error ||
                              state[token.id].token ||
                              '...'}
                    </p>

                    <button
                        class="text-black col-span-3 text-lg px-4 py-1 md:col-span-2 disabled:animate-pulse"
                        class:bg-blue-400={!state[token.id].token}
                        class:bg-amber-400={state[token.id].token}
                        disabled={state[token.id].loading}
                        on:click={() => handleReset(token.id)}
                    >
                        {state[token.id].token ? 'Copy' : 'Reset'}
                    </button>
                </div>
            </li>
        {/each}
    {:else}
        <li class="my-2">
            <p class="text-center h-full flex items-center justify-center py-4">
                You have no API tokens.
            </p>
        </li>
    {/if}
</ul>

<p class="text-xs text-gray-500 mt-1">
    For security purposes, tokens can only be viewed once, when created. If you
    forgot or lost access to your token, please regenerate a new one.
</p>
