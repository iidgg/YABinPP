<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { INSTANCE_NAME } from '../../lib/publicEnv';
    import { detectMac } from '../../lib/utils/util';

    let cmdKey = 'Ctrl',
        isHttps = true,
        isLocalhost = true,
        acknowledgeHttp = true;

    onMount(() => {
        const isMac = detectMac(navigator);
        cmdKey = isMac ? '⌘' : 'Ctrl';
        isHttps = location.protocol === 'https:';
        isLocalhost = location.hostname === 'localhost';
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

            <a
                class="underline underline-offset-4 px-2 py-1"
                href="/dashboard/settings"
                >Settings
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

    <div class="px-2 py-4 md:px-24">
        {#if !isHttps && !isLocalhost && !acknowledgeHttp}
            <div
                class="p-4 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded"
                role="alert"
            >
                <span class="font-bold">Warning: Unsecure Connection!</span>
                <p>
                    You are accessing this dashboard over an unsecure connection
                    (HTTP). This may expose your personal information to
                    potential attackers. If you did not intend to access this
                    page in this manner, please exit immediately and consider
                    resetting your password. Note that some features, such as
                    copy buttons, may not function correctly in this
                    environment.
                </p>
                <button
                    class="font-semibold mt-2 hover:underline"
                    on:click={() => {
                        acknowledgeHttp = true;
                        localStorage.setItem('acknowledge_http', 'true');
                    }}>&gt; never show this again</button
                >
            </div>
        {/if}

        <slot />
    </div>
</div>
