<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData, PageData } from './$types';
    import { IconArrowUpRight, IconArrowCapsule } from '@tabler/icons-svelte';

    const MAX_TITLE_LENGTH = 24;

    export let data: PageData;
    export let form: ActionData;
    let pastes = [...data.pastes];

    /** How many last pastes fetch gave us*/
    let lastPacketSize = data.pastes.length;

    $: if (form) pastes = [...pastes, ...form.pastes];
    $: pageSize = form?.pageSize ?? data.pageSize;
    $: lastPacketSize = form?.pastes.length ?? data.pastes.length;

    function formatDate(date: Date | null): string {
        return date
            ? date.toLocaleString('en-GB', {
                  dateStyle: 'short',
                  timeStyle: 'long',
              })
            : '';
    }

    function formatTitle(title: string) {
        return title.length > MAX_TITLE_LENGTH
            ? title.slice(0, MAX_TITLE_LENGTH - 3) + '...'
            : title;
    }
</script>

<div class="overflow-x-auto">
    <table class="text-sm text-left rtl:text-right text-gray-400">
        <thead class="text-xs uppercase text-gray-400 whitespace-nowrap">
            <tr>
                <th scope="col" class="px-6 py-3">key</th>
                <th scope="col" class="px-6 py-3 text-center">title</th>
                <th scope="col" class="px-6 py-3 text-center">language</th>
                <th scope="col" class="px-6 py-3 text-center">created at</th>
                <th scope="col" class="px-6 py-3 text-center">expires at</th>
                <th></th>
            </tr>
        </thead>

        <tbody>
            {#each pastes as paste, i (paste.key)}
                <tr class="item">
                    <th scope="row" class="px-6 font-medium text-gray-300">
                        {paste.key}
                    </th>
                    <td
                        class:italic={!paste.title}
                        class="px-6 text-center text-sky-200"
                    >
                        {paste.title
                            ? formatTitle(paste.title)
                            : `Untitled ${i}`}
                    </td>
                    <td class="px-4 text-center">
                        {paste.language}
                    </td>
                    <td class="py-4 px-4 text-center">
                        {formatDate(paste.createdAt)}
                    </td>
                    <td
                        class:italic={!paste.expiresAt}
                        class:text-red-300={paste.expiresAt}
                        class="py-4 px-4 text-center"
                    >
                        {paste.expiresAt
                            ? formatDate(paste.expiresAt)
                            : 'Never'}
                    </td>
                    <td
                        class="px-6 whitespace-nowrap text-amber-500 hover:text-ambed-600"
                    >
                        <a href={`/${paste.key}/edit`}>
                            edit<IconArrowUpRight class="inline" size="16" />
                        </a>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<div class="flex w-full justify-between">
    <p class="py-3 pl-4 text-gray-500 text-sm">
        Tip: Tags, attachments and more info can be found in the edit page.
    </p>

    {#if lastPacketSize >= pageSize}
        <form
            method="post"
            action="?/fetch"
            use:enhance={(input) => {
                const lastPaste = pastes[pastes.length - 1];

                if (lastPaste) {
                    input.formData.set(
                        'before',
                        lastPaste.createdAt.toString(),
                    );
                }
            }}
        >
            <button
                class="p-3 whitespace-nowrap text-black bg-green-500 hover:bg-green-600"
            >
                load more <IconArrowCapsule class="inline" size="16" />
            </button>
        </form>
    {/if}
</div>

<style>
    .item:nth-child(2n) {
        background-color: var(--color-background-muted);
    }
</style>
