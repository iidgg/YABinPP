<script lang="ts">
    import { enhance } from '$app/forms';
    import Modal from '$lib/components/modal.svelte';
    import type { ActionData, PageData } from './$types';

    const MAX_TITLE_LENGTH = 32;

    export let data: PageData;
    export let form: ActionData;
    let modal: Modal;
    let test = {
        ip: '',
        hash: '',
    };

    function formatDate(date: Date | null): string {
        return date
            ? date.toLocaleString('en', {
                  dateStyle: 'medium',
              })
            : '';
    }

    function formatTitle(title: string) {
        return title.length > MAX_TITLE_LENGTH
            ? title.slice(0, MAX_TITLE_LENGTH - 3) + '...'
            : title;
    }

    function testIP(hash: string | null) {
        if (!hash) return;
        test.hash = hash;
        modal.open();
    }
</script>

<div class="overflow-x-auto">
    <ul>
        {#each data.sessions as session, i (i)}
            <li class="item p-3">
                <div class="inline-block">
                    <p
                        class="text-gray-400 font-bold"
                        class:italic={!session.ip}
                    >
                        <span class="italic text-gray-500">ip:</span>
                        {formatTitle(session.ip ?? 'unknown')}
                    </p>
                    <p class="text-gray-400 text-sm">
                        {session.lastActive
                            ? `Last active on ${formatDate(session.lastActive)}`
                            : `Expires on ${formatDate(session.expiresAt)}`}
                    </p>

                    {#if session.id === data.current}
                        <p class="text-blue-400 italic text-sm font-bold">
                            Current session
                        </p>
                    {/if}
                </div>

                <div class="inline-block">
                    {#if session.ip}
                        <button
                            class="italic ml-12 text-blue-400 hover:text-blue-500 hover:underline"
                            on:click={() => testIP(session.ip)}>Test ip</button
                        >
                    {/if}
                </div>
            </li>
        {/each}
    </ul>
    <p class="py-3 pl-4 text-gray-500 text-sm">
        Tip: Resetting your password will invalidate all sessions.
    </p>
</div>

<Modal bind:this={modal} escapable={true}>
    <div slot="content">
        <form
            action="?/test"
            method="post"
            id="ip-test"
            use:enhance={(inp) => {
                if (!test.ip || test.ip.length < 3) inp.cancel();
                inp.formData.set('hash', test.hash);
                inp.formData.set('ip', test.ip);
                test.ip = '';
            }}
        >
            <p>{formatTitle(test.hash)}</p>
            <input
                class="w-full text-lg bg-gray-800 py-1 px-2"
                type="text"
                name="ip"
                placeholder="ip"
                bind:value={test.ip}
            />
            {#if form?.match}
                <p class="text-green-400">match!</p>
            {:else if form?.match === false}
                <p class="text-red-400">no match</p>
            {/if}
        </form>
    </div>
    <div slot="buttons">
        <button
            class="bg-green-500 text-black text-lg px-4 py-1 disabled:opacity-30 disabled:cursor-not-allowed"
            form="ip-test"
            disabled={test.ip.length < 3}
        >
            Submit
        </button>
    </div>
</Modal>

<style>
    .item:nth-child(2n) {
        background-color: var(--color-background-muted);
    }
</style>
