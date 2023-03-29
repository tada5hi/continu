/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from './has-property';
import { isObject } from './object';
import type { ValidatorResult } from '../type';

export function isValidatorResult<V>(value: unknown) : value is ValidatorResult<V> {
    return isObject(value) &&
        hasOwnProperty(value, 'success') &&
        typeof value.success === 'boolean' &&
        (
            hasOwnProperty(value, 'data') ||
            hasOwnProperty(value, 'error')
        );
}
