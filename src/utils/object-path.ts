/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../type';
import { hasOwnProperty } from './has-property';
import { isObject } from './object';

export function setObjectPathProperty(
    record: ObjectLiteral,
    key: string,
    value: unknown,
) {
    const index = key.indexOf('.');
    const currentKey = index === -1 ?
        key :
        key.substring(0, index);

    if (index === -1) {
        record[currentKey] = value;
        return;
    }

    if (!Object.prototype.hasOwnProperty.call(record, currentKey)) {
        record[currentKey] = {};
    }

    const nextKey = key.substring(currentKey.length + 1);
    setObjectPathProperty(record[currentKey], nextKey, value);
}

export function hasObjectPathProperty(data: ObjectLiteral, key: string) : boolean {
    const index = key.indexOf('.');
    const currentKey = index === -1 ?
        key :
        key.substring(0, index);

    if (index === -1) {
        return !!hasOwnProperty(data, currentKey);
    }

    if (!isObject(data[currentKey])) {
        return false;
    }

    const nextKey = key.substring(currentKey.length + 1);
    return hasObjectPathProperty(data[currentKey], nextKey);
}

export function removeObjectPathProperty(
    data: Record<string, any>,
    key: string,
) {
    const index = key.indexOf('.');
    const currentKey = index === -1 ?
        key :
        key.substring(0, index);

    if (index === -1) {
        if (hasOwnProperty(data, currentKey)) {
            delete data[currentKey];
        }

        return;
    }

    if (!isObject(data[currentKey])) {
        return;
    }

    const nextKey = key.substring(currentKey.length + 1);
    getObjectPathProperty(data[currentKey], nextKey);
}

export function getObjectPathProperty(data: Record<string, any>, key: string) : any {
    const index = key.indexOf('.');
    const currentKey = index === -1 ?
        key :
        key.substring(0, index);

    if (index === -1) {
        return data[currentKey];
    }

    if (!isObject(data[currentKey])) {
        return undefined;
    }

    const nextKey = key.substring(currentKey.length + 1);
    return getObjectPathProperty(data[currentKey], nextKey);
}
