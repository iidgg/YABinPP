/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Dict } from '../types';

/** Returns true if secure, false otherwise */
export const detectSecureConnection = (location: Location) =>
    location.protocol.startsWith('https') || location.hostname === 'localhost';

/** Returns true if mac, false otherwise */
export const detectMac = (navigator: Navigator) =>
    (navigator as any).userAgentData?.platform?.toLowerCase() === 'macos' ||
    navigator.platform?.toLowerCase().startsWith('mac');

/** deletes undefined values */
export function deleteUV<T extends Dict<any>>(data: T): T {
    for (const k of Object.keys(data)) {
        if (data[k] === undefined) {
            delete data[k];
        }
    }

    return data;
}
