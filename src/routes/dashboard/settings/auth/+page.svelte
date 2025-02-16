<script lang="ts">
    import { TwoFA } from '$lib/constants/twoFAs';
    import type { PageData } from './$types';
    import Totp from './totp.svelte';

    export let data: PageData;

    $: enabledTypes = data.twoFAs.map((i) => i.type);
    $: activeTypes = data.twoFAs
        .map((i) => (i.active ? i.type : undefined))
        .filter((e) => e);
</script>

<h4 class="text-2xl mt-6 mb-4">Password</h4>
<p class="italic opacity-75">To be implemented: Password reset.</p>

<h4 class="text-2xl mt-6 mb-4">2FA (TOTP)</h4>

<Totp
    enabled={enabledTypes.includes(TwoFA.TOTP)}
    active={activeTypes.includes(TwoFA.TOTP)}
/>
