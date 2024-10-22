import type { Dict } from '../types';

/**
 * Checks if a specific bit in the bitmask is set (on).
 * @param bitmask - The bitmask as a string, e.g. "1010110".
 * @param bitPosition - The position of the bit to check (0-indexed).
 * @returns True if the bit is set to 1, false if it's 0.
 */
export function isBitSet(bitmask: string, bitPosition: number): boolean {
    if (bitPosition < 0 || bitPosition >= bitmask.length) {
        throw new Error('Invalid bit position');
    }

    return bitmask[bitPosition] === '1';
}

/**
 * Converts an array of strings into a bitmask string based on a provided map object.
 *
 * @example
 * arrayToBits(["item1", "item3"], {item1: 0, item2: 1, item3: 2, item4: 3}, 4); // "1010"
 */
export function arrayToBits(
    arr: string[],
    map: Dict<number>,
    length?: number,
): string {
    if (!length) {
        // Determine bitmask length based on max index
        length = Math.max(...Object.values(map)) + 1;
    }

    const bitmask = Array(length).fill('0');

    for (const item of arr) {
        bitmask[map[item]] = '1';
    }

    return bitmask.join('');
}

/**
 * Converts a bitmask string into an array of strings based on a provided map.
 *
 * @example
 * bitmaskToArray("1010", {item1: 0, item2: 1, item3: 2, item4: 3}); // ["item1", "item3"]
 */

export function bitsToArray(bitmask: string, map: Dict<number>): string[] {
    return Object.keys(map).filter((item) => bitmask[map[item]] === '1');
}
