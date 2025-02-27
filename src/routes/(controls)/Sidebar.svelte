<!-- svelte-ignore a11y-missing-attribute -->
<script lang="ts">
    import { page } from '$app/stores';
    import { items } from './SidebarItems';
</script>

<div class="flex flex-col px-2 items-stretch w-full md:w-48 lg:w-56">
    {#each items as itemList, ii (ii)}
        <ul>
            {#if itemList.title}
                <p class="item-list-title text-xs text-gray-400">
                    {itemList.title}
                </p>
            {/if}

            {#each itemList.items as item, i (i)}
                {@const route = $page.route.id?.replace('/(controls)', '')}
                <li
                    class="item hover:!bg-gray-800"
                    class:active={route === item.href}
                >
                    <a class="flex items-center" href={item.href}>
                        <svelte:component
                            this={item.icon}
                            class="text-gray-400"
                            size="16"
                        />
                        <span class="text-sm ml-2">{item.name}</span>
                    </a>
                </li>
            {/each}
        </ul>

        {#if ii !== items.length - 1}
            <div class="divider"></div>
        {/if}
    {/each}
</div>

<style>
    .divider {
        height: 1px;
        background: #444;
        margin: 0.5rem -0.25rem;
    }

    .item {
        position: relative;
        border-radius: 0.375rem;
    }

    .item.active {
        background-color: var(--color-background-muted);
    }

    .item.active::after {
        content: '';
        position: absolute;
        height: 72.5%;
        width: 0.25rem;
        top: 50%;
        transform: translateY(-50%);
        right: calc(100% + 0.25rem);
        border-radius: 0.375rem;
        background-color: #2b7fff;
    }

    .item a {
        padding: 0.4rem;
    }

    .item-list-title {
        padding: 0rem 0.4rem;
        margin: 0.3rem 0rem;
    }
</style>
