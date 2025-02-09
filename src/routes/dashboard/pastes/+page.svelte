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

<table
    class="w-full text-sm text-left rtl:text-right border-2 border-gray-700 text-gray-400"
>
    <thead class="text-xs uppercase bg-gray-900 text-gray-400">
        <tr>
            <th scope="col" class="px-6 py-3">key</th>
            <th scope="col" class="px-6 py-3 text-center">title</th>
            <th scope="col" class="px-4 py-3 text-center">language</th>
            <th scope="col" class="px-6 py-3 text-center">created at</th>
            <th scope="col" class="px-2 py-3 text-center">reads</th>
            <th></th>
            <th></th>
        </tr>
    </thead>

    <tbody>
        {#each pastes as paste, i (paste.key)}
            <tr class:bg-gray-800={i % 2 === 0} class:bg-gray-700={i % 2 === 1}>
                <th scope="row" class="py-4 px-6 font-medium text-gray-300">
                    {paste.key}
                </th>
                <td class="italic py-4 px-6 text-center">
                    {formatTitle(paste.title ?? '')}
                </td>
                <td class="py-4 px-4 text-center">{paste.language}</td>
                <td class="py-4 px-4 text-center">
                    {formatDate(paste.createdAt)}
                </td>
                <td class="py-4 text-center">{paste.readCount}</td>
                <td class="py-4 px-3 text-center">
                    <a
                        href={`/${paste.key}/edit`}
                        class="text-amber-500 hover:text-ambed-600"
                        >edit<IconArrowUpRight class="inline" size="16" />
                    </a>
                </td>
                <td class="py-4 px-3 text-center">
                    <a
                        href={`/${paste.key}`}
                        class="text-cyan-400 hover:text-cyan-600"
                        >read<IconArrowUpRight class="inline" size="16" />
                    </a>
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<form
    method="post"
    action="?/fetch"
    class="flex w-full justify-between"
    use:enhance={(input) => {
        const lastPaste = pastes[pastes.length - 1];

        if (lastPaste) {
            input.formData.set('before', lastPaste.createdAt.toString());
        }
    }}
>
    <p class="py-3 pl-4 text-gray-500 text-sm">
        Tip: Tags, attachments and more info can be found in the edit page.
    </p>
    {#if lastPacketSize >= pageSize}
        <button class="px-4 bg-green-500 text-black hover:bg-green-600">
            load more <IconArrowCapsule class="inline" size="16" />
        </button>
    {/if}
</form>
