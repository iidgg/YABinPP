<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { INSTANCE_NAME } from '../../lib/publicEnv';
    import { detectMac } from '../../lib/utils/util';

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
        <div>
            <h1 class="text-5xl text-gray-200 mb-6">
                <b class="text-amber-500">Y</b>et
                <b class="text-amber-500">A</b>nother Paste<b
                    class="text-amber-500">bin</b
                >
            </h1>
            <p class="my-4">
                Why would I create another pastebin, when there are dozens on
                the market already? Well, cause no pastebin I could find had ALL
                of the following features:
            </p>
            <ul class="list-outside ml-4 list-disc">
                <li>
                    Modern and minimal UI (This site's design was inspired by <a
                        class="underline underline-offset-2"
                        href="https://github.com/wantguns/bin">bin</a
                    >).
                </li>
                <li>
                    <b>Optional</b> end-to-end encryption (we're using AES-256-GCM)
                    with optional password protection (using PBKDF2-SHA512). The
                    initialization vector is stored on the server, since it can be
                    public and it results in a shorter URL while having the same
                    end-to-end security.
                </li>
                <li>
                    Syntax highlighting (using <a
                        class="underline underline-offset-2"
                        href="https://prismjs.com/">Prism</a
                    >) that supports 297 languages.
                </li>
                <li>API support to create and get pastes from command line.</li>
                <li>
                    View raw pastes. Normally, encrypted pastebins do not have
                    this. With this site, you can either get the Base64-encoded
                    encrypted paste, or decrypt it on the server side (even with
                    the password) and get the raw paste.
                </li>
                <li>Keyboard shortcuts!</li>
                <li>
                    And ofcourse, being fully <a
                        class="underline underline-offset-2"
                        href="https://github.com/Yureien/YABin">open-source</a
                    > and easily self-hostable.
                </li>
                <li>
                    <a
                        class="underline underline-offset-2"
                        href="https://github.com/Yureien/YABin/tree/main/cli"
                        >CLI Client!</a
                    >
                </li>
                <li>It can even be run in serverless environments!</li>
            </ul>

            <p class="mt-4">
                The API documentation is available <a
                    class="underline underline-offset-2"
                    href="https://github.com/Yureien/YABin/blob/main/API.md"
                    >here</a
                >.
            </p>
        </div>

        <div class="mt-8">
            <h1 class="text-4xl">Support the development</h1>
            <p class="mt-2">
                If you really like this project, I'd love it if you can give me
                a <a
                    class="underline underline-offset-2"
                    href="https://github.com/Yureien/YABin"
                    aria-label="Star Yureien/YABin on GitHub">Star</a
                > on GitHub! That provides me with motivation, seeing people use
                stuff I make.
            </p>
            <p>
                If you do not mind donating, then please <a
                    href="https://ko-fi.com/A0A21C34E"
                    target="_blank"
                    ><img
                        class="border-0 inline h-8"
                        src="https://storage.ko-fi.com/cdn/kofi3.png?v=3"
                        alt="Buy Me a Coffee at ko-fi.com"
                    /></a
                >
                or
                <iframe
                    src="https://github.com/sponsors/Yureien/button"
                    title="Sponsor Yureien"
                    class="border-0 rounded h-8 inline w-28"
                /> me on GitHub. Although, a star on GitHub is more than enough!
            </p>
        </div>
    </div>
</div>
