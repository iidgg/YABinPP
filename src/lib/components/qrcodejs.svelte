<script>
    // @ts-nocheck
    import { onMount } from 'svelte';

    export let value;
    export let size;

    let qrcode;
    let parent;
    let loadedScript = false,
        loadedQR = false;

    $: {
        if (parent && loadedScript) newQrcode();
    }

    const newQrcode = () => {
        if (!loadedScript || !value) return;
        qrcode = new QRCode('qrcode', {
            text: value,
            width: size,
            height: size,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H,
        });
        if (!loadedQR) loadedQR = true;
    };

    onMount(() => {
        if (loadedScript) return;
        let script = document.createElement('script');
        script.src =
            'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        document.head.append(script);

        script.onload = function () {
            newQrcode();
            loadedScript = true;
        };
    });
</script>

{#key value}
    <div bind:this={parent} id="qrcode" />
{/key}
