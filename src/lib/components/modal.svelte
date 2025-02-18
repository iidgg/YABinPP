<script lang="ts">
    import { onMount } from 'svelte';

    /** if the modal closes on outside click or Esc key press */
    export let escapable = true;
    export let isOpen = false;

    export const open = () => (isOpen = true);
    export const close = () => (isOpen = false);
    const handleKeydown = (event: KeyboardEvent) =>
        event.key === 'Escape' && escapable ? close() : null;

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
    });
</script>

{#if isOpen}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity"
        on:click={() => (escapable ? close() : null)}
    />

    <div class="fixed z-10 inset-0 overflow-y-auto pointer-events-none">
        <div
            class="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0"
        >
            <div
                class="relative bg rounded-lg text-left overflow-hidden shadow-xl transform transition-all pointer-events-auto sm:my-8 sm:max-w-lg sm:w-full"
            >
                <div class="bg px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <slot name="content" />
                    </div>
                </div>
                <div class="bg px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <slot name="buttons" />
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .bg {
        background-color: var(--color-background);
    }
</style>
