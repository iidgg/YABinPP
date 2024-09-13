/* eslint-disable @typescript-eslint/no-explicit-any */

export const detectMac = (navigator: Navigator) =>
    (navigator as any).userAgentData?.platform?.toLowerCase() === 'macos' ||
    navigator.platform?.toLowerCase().startsWith('mac');
