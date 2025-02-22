<script lang="ts">
    import { enhance } from '$app/forms';
    import { env } from '$env/dynamic/public';
    import Modal from '$lib/components/modal.svelte';
    import type { ActionData } from './$types';

    export let form: ActionData;

    let modal: Modal;

    $: if (form?.success && form.mfa?.ticket) modal.open();
</script>

<div class="flex flex-col justify-center items-center">
    <h1 class="text-4xl">User Login</h1>
    <div class="mt-6">
        {#if form?.errors}
            <ul class="text-red-500 text-center">
                {#each form.errors as error}
                    <li>{error}</li>
                {/each}
            </ul>
        {/if}
        {#if form?.success}
            <div class="text-green-500 text-center">
                Success, redirecting...
            </div>
        {/if}

        <form
            action="?/login"
            method="post"
            class="mt-2 flex flex-col gap-4"
            use:enhance
        >
            <div>
                <label for="username" class="px-2 py-2"
                    >Username or E-mail</label
                >
                <input
                    class="bg-dark px-2 py-1 w-full"
                    type="text"
                    name="username-email"
                    placeholder="Username or E-mail"
                />
            </div>
            <div>
                <label for="username" class="px-2 py-2">Password</label>
                <input
                    class="bg-dark px-2 py-1 w-full"
                    type="password"
                    name="password"
                    placeholder="Password"
                />
            </div>

            <div class="flex flex-row items-center justify-center gap-4 mt-2">
                {#if env.PUBLIC_REGISTRATION_ENABLED == 'true'}
                    <span class="px-2 py-1">
                        Don't have an account? <a
                            class="underline underline-offset-4"
                            href="/register">Register</a
                        >.
                    </span>
                {/if}

                <button class="bg-amber-500 text-black text-lg px-4 py-1"
                    >Login</button
                >
            </div>

            <div class="text-center">
                Forgot password?
                <a class="underline underline-offset-4" href="/forgot-password"
                    >Click here</a
                >.
            </div>
        </form>
    </div>
</div>

<Modal bind:this={modal} escapable={false}>
    <form
        id="mfa-form"
        action="?/mfa"
        method="post"
        slot="content"
        class="w-full mt-2 flex flex-col items-center gap-4"
        use:enhance={(input) => {
            if (form?.mfa) {
                input.formData.set('type', String(form.mfa.type));
                input.formData.set('ticket', String(form.mfa.ticket));
            }
        }}
    >
        <h4>Mutli factor authentication</h4>
        <input
            class="w-2/4 text-lg bg-gray-800 py-1 px-2"
            type="text"
            name="code"
            placeholder="code"
        />
    </form>
    <div slot="buttons">
        <button
            form="mfa-form"
            class="bg-green-500 text-black text-lg px-3 py-1 disabled:animate-pulse"
            >Submit</button
        >
    </div>
</Modal>
