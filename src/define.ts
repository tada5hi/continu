/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Getter } from './type';

export function define<T>(input: T) : T {
    return input;
}

export function defineGetter<T extends Getter>(input: T) : T {
    return input;
}
