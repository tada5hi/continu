/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { GetterContext } from '../types';
import { getObjectPathProperty, hasObjectPathProperty, isObject } from '../utils';

type Output = {
    success: true,
    data: any,
    exists: boolean,
} | { success: false };
export function evaluatePathForDynamicGetters(
    data: Record<string, any>,
    key: string,
    context: GetterContext,
) : Output {
    const dotIndex = key.indexOf('.');
    const currentKey = dotIndex === -1 ?
        key :
        key.substring(0, dotIndex);

    if (typeof data[currentKey] === 'function') {
        const value = data[currentKey](context);

        if (dotIndex === -1) {
            return {
                success: true,
                data: value,
                exists: true,
            };
        }

        return {
            success: true,
            data: value === null || typeof value === 'undefined' ? undefined : getObjectPathProperty(value, key.substring(currentKey.length + 1)),
            exists: hasObjectPathProperty(value, key.substring(currentKey.length + 1)),
        };
    }

    if (isObject(data[currentKey])) {
        const nextKey = key.substring(currentKey.length + 1);

        if (nextKey.length > 0) {
            return evaluatePathForDynamicGetters(data[currentKey], nextKey, context);
        }
    }

    return { success: false };
}
