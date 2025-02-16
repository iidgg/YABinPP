<script lang="ts">
    import Modal from '$lib/components/modal.svelte';

    interface T {
        success: true;
        data: {
            secret: string;
            uri: string;
        };
    }

    export let enabled: boolean;
    let fetching: boolean = false;
    let data: T | undefined;
    let password: string;
    let modal: Modal;

    const act = async () => {
        if (fetching) return;
        const init: RequestInit = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        };

        password = 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 1 2';

        fetching = true;
        const action = enabled ? 'disable' : 'enable';
        const res = await fetch(`/api/@me/2fa/totp/${action}`, init);
        const json = await res.json();
        fetching = false;

        password = '';

        if (res.ok) {
            modal.close();
            data = json;
            enabled = action === 'enable';
        } else {
            alert(
                'Action failed, please check your password and try again in a moment',
            );
            window.location.reload();
        }
    };
</script>

{#if enabled}
    <p class="text-green-400">enabled</p>

    {#if data}
        <p class="whitespace-nowrap">{data.data.uri}</p>
    {/if}

    <button
        class="bg-red-500 text-black text-lg px-2 py-1"
        on:click={modal.open}
    >
        disable
    </button>
{:else}
    <p class="text-red-400">disabled</p>

    <button
        class="bg-green-500 text-black text-lg px-4 py-1"
        on:click={modal.open}
    >
        enable
    </button>
{/if}

<Modal bind:this={modal} escapable={true}>
    <div slot="content" class="w-full">
        <label for="password" class="block mb-1">Password:</label>
        <input
            id="password"
            class="w-full bg-gray-800 py-1 px-2"
            type="password"
            name="password"
            bind:value={password}
        />
    </div>
    <div slot="buttons">
        <button
            class="bg-gray-800 text-gray-300 text-lg px-3 py-1 disabled:animate-pulse"
            disabled={fetching}
            on:click={modal.close}
        >
            Cancel
        </button>
        <button
            class="bg-green-500 text-black text-lg px-4 py-1 disabled:animate-pulse"
            disabled={fetching}
            on:click={act}
        >
            Submit
        </button>
    </div>
</Modal>
