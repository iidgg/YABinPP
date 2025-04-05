<script>
    import { INSTANCE_NAME } from '$lib/publicEnv';
    import '../app.css';
</script>

<svelte:head>
    <title>{INSTANCE_NAME}</title>
</svelte:head>

<slot />
