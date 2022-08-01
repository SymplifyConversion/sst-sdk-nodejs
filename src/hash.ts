/**
 * http://www.cse.yorku.ca/~oz/hash.html
 * with suggested xor modification
 */

export function djb2(str: string) {
    let hash = 5381;
    let c: number;

    for (let i = 0; i < str.length; i++) {
        c = str.charCodeAt(i);
        // multiply hash by 33, XOR with next char
        // the XOR is important in JS as it keeps the number from escaping 32 bits
        hash = ((hash << 5) + hash) ^ c;
    }

    // JS trickery to convert to unsigned 32 bits (truncates)
    return hash >>> 0;
}

/**
 * Return the hash of `str` but scaled to fit in [0, `window`].
 */
export function hashInWindow(str: string, window: number): number {
    let hash = djb2(str);
    hash /= 4_294_967_295; // unsigned max
    hash *= window; // fit window

    return Math.ceil(hash);
}
