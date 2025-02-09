<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { INSTANCE_NAME } from '../../lib/publicEnv';
    import { detectMac, detectSecureConnection } from '../../lib/utils/util';
    import UnsecureConnection from '../../lib/components/warnings/UnsecureConnection.svelte';
    import Sidebar from './Sidebar.svelte';

    let cmdKey = 'Ctrl',
        acknowledgeHttp = true,
        isSecureConnection = true;

    onMount(() => {
        const isMac = detectMac(navigator);
        cmdKey = isMac ? '⌘' : 'Ctrl';
        isSecureConnection = detectSecureConnection(location);
        acknowledgeHttp = localStorage.getItem('acknowledge_http') === 'true';
        document.addEventListener('keydown', (e) => {
            if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                goto('/');
            }

            if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                goto('/info');
            }
        });
    });
</script>

<div class="p-2 min-h-screen w-screen flex flex-col text-primary">
    <div class="pb-4">
        <div class="flex flex-row items-center gap-4">
            <h1 class="mr-auto text-2xl"><a href="/">{INSTANCE_NAME}</a></h1>

            <a class="underline underline-offset-4 px-2 py-1" href="/dashboard"
                >Dashboard
            </a>

            <button
                class="underline underline-offset-4 px-2 py-1"
                title="{cmdKey}+I"
                on:click={() => goto('/info')}
            >
                Info
            </button>

            <button
                class="bg-amber-500 text-black text-lg px-4 py-1"
                title="{cmdKey}+N"
                on:click={() => goto('/')}
            >
                Home/New
            </button>
        </div>
    </div>

    <div class="flex flex-col md:flex-row px-4">
        <div>
            <Sidebar />
        </div>

        <div class="py-4 md:px-24">
            {#if !isSecureConnection && !acknowledgeHttp}
                <UnsecureConnection
                    on:click={() => {
                        acknowledgeHttp = true;
                        localStorage.setItem('acknowledge_http', 'true');
                    }}
                />
            {/if}

            <slot />
        </div>
    </div>
</div>
