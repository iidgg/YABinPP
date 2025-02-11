<script>
    // @ts-nocheck
    import { onMount } from 'svelte';

    export let value;
    export let size;

    let qrcode;

    onMount(() => {
        let script = document.createElement('script');
        script.src =
            'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        document.head.append(script);

        script.onload = function () {
            qrcode = new QRCode('qrcode', {
                text: value,
                width: size,
                height: size,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H,
            });
        };
    });
</script>

<div id="qrcode"></div>
