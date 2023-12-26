/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from './module';
import type { Getters, ObjectLiteral, Options } from './type';

export function createContainer<
    DATA extends ObjectLiteral = Record<string, never>,
    DEFAULTS extends ObjectLiteral = Record<string, never>,
    GETTERS extends Getters = Record<string, never>,
>(
    options: Options<DATA, DEFAULTS, GETTERS> = {},
) : Container<DATA, DEFAULTS, GETTERS> {
    return new Container<DATA, DEFAULTS, GETTERS>(options);
}
