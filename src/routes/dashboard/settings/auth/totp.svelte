<script lang="ts">
    import Modal from '$lib/components/modal.svelte';
    import Qrcodejs from '$lib/components/qrcodejs.svelte';

    interface T {
        success: true;
        data: {
            secret: string;
            uri: string;
        };
    }

    export let enabled: boolean;
    export let active: boolean;

    let fetching: boolean = false;
    let data: T | undefined;
    let otp: string;
    let password: string;
    let modal: Modal;
    let action: 'activate' | 'disable' | 'enable' | 'roll';

    const activate = async () => {
        action = 'activate';
        if (otp.length <= 5) return;
        await act();
    };

    const disable = async () => {
        action = 'disable';
        modal.open();
    };

    const enable = async () => {
        action = 'enable';
        modal.open();
    };

    const roll = async () => {
        action = 'roll';
        modal.open();
    };

    const act = async () => {
        if (fetching) return;
        const body = action === 'activate' ? { otp } : { password };
        const init: RequestInit = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        password = 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 1 2';

        fetching = true;
        const res = await fetch(`/api/@me/2fa/totp/${action}`, init);
        const json = await res.json();
        fetching = false;

        password = '';

        if (res.ok) {
            modal.close();
            data = json;
            active = action === 'activate';
            enabled = ['enable', 'roll'].includes(action);
        } else {
            alert(
                'Action failed, please check your password and try again in a moment',
            );
            window.location.reload();
        }
    };
</script>

{#if enabled}
    <button class="bg-gray-800 text-gray-300 text-lg px-2 py-1" on:click={roll}>
        roll
    </button>

    <button class="bg-red-500 text-black text-lg px-2 py-1" on:click={disable}>
        disable
    </button>

    {#if data}
        <div class="ml-3 my-3">
            <p class="whitespace-nowrap">Scan the next QR code:</p>
            <div class="inline-block bg-white p-4">
                <Qrcodejs size="256" value={data.data.uri} />
            </div>
            <p class="whitespace-nowrap">or use the next secret:</p>
            <p class="sc p-1 whitespace-nowrap text-gray-400">
                {data.data.secret}
            </p>
        </div>
    {:else if !active}
        <div class="ml-3 my-3">
            <p class="text-red-400 font-bold">Warning: Inactive!</p>

            <p class="text-gray-300">
                This feature won't be used for multi-authentication until it is
                activated. To activate, please roll the secret and complete the
                activation process.
            </p>

            <br />

            <p class="text-gray-300">
                If you already have a OTP, you can submit it here:
            </p>
        </div>
    {/if}

    {#if !active || data}
        <input
            class="w-1/4 bg-gray-800 text-lg py-1 px-2"
            type="text"
            name="otp"
            bind:value={otp}
        /><button
            class="ml-3 bg-green-600 text-black text-lg px-4 py-1"
            on:click={activate}>activate</button
        >
    {/if}
{:else}
    <button class="bg-green-500 text-black text-lg px-4 py-1" on:click={enable}>
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
            on:click={() => act()}
        >
            Submit
        </button>
    </div>
</Modal>

<style>
    .sc {
        background-color: var(--color-background-muted);
    }
</style>
