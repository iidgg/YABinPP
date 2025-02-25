<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { INSTANCE_NAME } from '$lib/publicEnv';
    import { detectMac } from '$lib/utils/util';

    let cmdKey = 'Ctrl';
    onMount(() => {
        const isMac = detectMac(navigator);
        cmdKey = isMac ? '⌘' : 'Ctrl';

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

    <div class="p-1 md:px-4 md:py-2">
        <div class="flex w-full justify-around">
            <h1 class="text-5xl text-gray-200 mb-6">
                <span class="whitespace-nowrap">
                    <b class="text-amber-500">Y</b>et
                </span>
                <span class="whitespace-nowrap">
                    <b class="text-amber-500">A</b>nother
                </span>
                <span class="whitespace-nowrap">
                    Paste<b class="text-amber-500">bin++</b>
                </span>
            </h1>
        </div>

        <p>
            <!-- can write some description here -->
        </p>

        <br />

        <h3 class="font-bold text-3xl">Features</h3>

        <br />

        <ul class="list-outside ml-8 list-disc">
            <li>
                Syntax highlighting (using <a
                    class="underline underline-offset-2"
                    href="https://prismjs.com/">Prism</a
                >) that supports 297 languages.
            </li>
            <li>
                Optional end-to-end encryption with a randomly generated key or
                a key derived from a password.
            </li>
            <li>Optional Server-Side encryption/decryption</li>
        </ul>

        <br />

        <h6 class="font-bold text-lg">
            - API (<a
                class="text-blue-300 underline underline-offset-2 hover:text-blue-400"
                href="https://github.com/Yureien/YABin/blob/main/API.md">docs</a
            >)
        </h6>
        <ul class="list-outside ml-8 list-disc">
            <li>Scoped tokens for API authentication</li>
            <li>Optional Server-Side encryption/decryption</li>
        </ul>

        <br />
    </div>

    <div class="flex w-full justify-around">
        <div
            class="flex flex-col lg:flex-row justify-between items-center mx-2 w-full xl:w-3/4 text-gray-300"
        >
            <p class="whitespace-nowrap">
                Site's source
                <a
                    class="text-blue-300 underline underline-offset-2 hover:text-blue-400"
                    href="https://github.com/iidgg/YABinPP"
                    >iidgg/YABinPP
                </a>
            </p>

            <p class="whitespace-nowrap">
                Source forked from
                <a
                    class="text-blue-300 underline underline-offset-2 hover:text-blue-400"
                    href="https://github.com/Yureien/YABin"
                    >Yureien/YABin
                </a>
            </p>

            <p class="whitespace-nowrap">
                Design inspired by
                <a
                    class="text-blue-300 underline underline-offset-2 hover:text-blue-400"
                    href="https://github.com/wantguns/bin"
                    >wantguns/bin
                </a>
            </p>
        </div>
    </div>
</div>
