/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { OptionMissError } from './error';
import { evaluatePathForDynamicGetters } from './getter';
import type {
    DeepMerge,
    FlattenObject,
    GetterContext,
    Getters,
    GettersToRecord,
    ObjectLiteral,
    OptionalKeys,
    Options,
    ResetKeys,
    Transformers,
    Validators,
} from './types';
import {
    getObjectPathProperty,
    hasObjectPathProperty,
    hasOwnProperty,
    isObject,
    isValidatorResult,
    removeObjectPathProperty,
    setObjectPathProperty,
} from './utils';

export class Container<
    DATA extends ObjectLiteral = Record<string, never>,
    DEFAULTS extends ObjectLiteral = Record<string, never>,
    GETTERS extends Getters = Record<string, never>,

    DataDefaults extends DeepMerge<DATA, DEFAULTS> = DeepMerge<DATA, DEFAULTS>,
    DefaultGetters extends DeepMerge<DEFAULTS, GETTERS> = DeepMerge<DEFAULTS, GETTERS>,
    DataDefaultsGetters extends DeepMerge<DataDefaults, GettersToRecord<GETTERS>> = DeepMerge<DataDefaults, GettersToRecord<GETTERS>>,
> {
    protected data : DATA;

    protected defaults: DEFAULTS;

    protected getters : GETTERS;

    protected transformers: Transformers<DataDefaults>;

    protected validators : Validators<DataDefaults>;

    protected errorOnMiss: boolean;

    // -------------------------------------------------

    constructor(options: Options<DATA, DEFAULTS, GETTERS, DataDefaults> = {}) {
        this.data = options.data || {} as DATA;
        this.defaults = options.defaults || {} as DEFAULTS;
        this.getters = options.getters || {} as GETTERS;
        this.transformers = options.transformers || {} as Transformers<DataDefaults>;
        this.validators = options.validators || {} as Validators<DataDefaults>;

        this.errorOnMiss = options.errorOnMiss ?? false;
    }

    // -------------------------------------------------

    setRaw<K extends keyof FlattenObject<DataDefaults>>(key: K, value: unknown) : this {
        const transformer = this.transformers[key];

        if (!transformer) {
            return this;
        }

        return this.set(key, transformer(value));
    }

    // -------------------------------------------------

    set(value: Partial<DataDefaults>) : this;

    set<K extends keyof FlattenObject<DataDefaults>>(key: K, value: FlattenObject<DataDefaults>[K]) : this;

    set(key: string | Partial<ObjectLiteral>, value?: any) : this {
        if (isObject(key)) {
            const keys = Object.keys(key);

            for (const key_ of keys) {
                this.set(key_ as keyof FlattenObject<DataDefaults>, key[key_]);
            }

            return this;
        }

        const validator = this.validators[key];

        if (validator) {
            try {
                const output = validator(value);

                if (isValidatorResult(output)) {
                    if (output.success) {
                        setObjectPathProperty(this.data, key, output.data);
                    }
                }

                if (typeof output === 'boolean' && output) {
                    setObjectPathProperty(this.data, key, value);
                }
            } catch {
                // do nothing
            }

            return this;
        }

        setObjectPathProperty(this.data, key, value);

        return this;
    }

    has(
        key: keyof FlattenObject<DataDefaultsGetters>,
        evaluateGetter?: boolean,
    ) : boolean {
        if (
            hasObjectPathProperty(this.data, key as any) ||
            hasObjectPathProperty(this.defaults, key as any) ||
            hasOwnProperty(this.getters, key as any)
        ) {
            return true;
        }

        if (evaluateGetter) {
            const getter = evaluatePathForDynamicGetters(this.getters, key, this as any as GetterContext);

            return getter.success && getter.exists;
        }

        return false;
    }

    hasGetter(key: string) : boolean {
        return hasObjectPathProperty(this.getters, key) &&
            typeof getObjectPathProperty(this.getters, key) === 'function';
    }

    getGetter(key: string) : any {
        const getter = evaluatePathForDynamicGetters(this.getters, key, this as any as GetterContext);

        return getter.success ? getter.data : undefined;
    }

    // ----------------------------------------------

    reset(key: ResetKeys<DATA, DefaultGetters>) : this;

    reset(keys: ResetKeys<DATA, DefaultGetters>[]) : this;

    reset(key: ResetKeys<DATA, DefaultGetters> | ResetKeys<DATA, DefaultGetters>[]) : this {
        if (Array.isArray(key)) {
            for (const element of key) {
                this.reset(element);
            }

            return this;
        }

        removeObjectPathProperty(this.data, key as any);

        return this;
    }

    // ----------------------------------------------

    get() : DataDefaultsGetters;

    get<K extends keyof FlattenObject<DataDefaultsGetters>>(key: K) : FlattenObject<DataDefaultsGetters>[K];

    get(key?: string) : any {
        if (typeof key === 'undefined') {
            const keys = [
                ...new Set([
                    ...Object.keys(this.defaults),
                    ...Object.keys(this.data),
                    ...Object.keys(this.getters),
                ]),
            ];

            const options : Record<string, any> = {};

            for (const key_ of keys) {
                options[key_] = this.get(key_ as keyof FlattenObject<DataDefaultsGetters>);
            }

            return options;
        }

        if (hasObjectPathProperty(this.data, key)) {
            return getObjectPathProperty(this.data, key);
        }

        const dynamicGetter = evaluatePathForDynamicGetters(this.getters, key, this as any as GetterContext);

        if (dynamicGetter.success) {
            return dynamicGetter.data;
        }

        if (hasObjectPathProperty(this.defaults, key)) {
            return getObjectPathProperty(this.defaults, key);
        }

        if (this.errorOnMiss) {
            throw new OptionMissError(key as string);
        }

        return undefined;
    }

    // ----------------------------------------------

    setDefault(value: Partial<DEFAULTS>) : this;

    setDefault<K extends keyof DEFAULTS>(key: K, value: DEFAULTS[K]) : this;

    setDefault(key: string | Partial<ObjectLiteral>, value?: any) : this {
        if (typeof key === 'object') {
            const keys = Object.keys(key);

            for (const key_ of keys) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this.setDefault(key_, key[key_]);
            }

            return this;
        }

        setObjectPathProperty(this.defaults, key as any, value);

        return this;
    }

    hasDefault(key: keyof DEFAULTS) : boolean {
        return hasObjectPathProperty(this.defaults, key as any);
    }

    resetDefault(key: OptionalKeys<DEFAULTS>) : this;

    resetDefault(keys: OptionalKeys<DEFAULTS>[]) : this;

    resetDefault(key: OptionalKeys<DEFAULTS> | OptionalKeys<DEFAULTS>[]) : this {
        if (Array.isArray(key)) {
            for (const element of key) {
                this.resetDefault(element as OptionalKeys<DEFAULTS>);
            }

            return this;
        }

        removeObjectPathProperty(this.defaults, key as any);

        return this;
    }

    getDefault() : DEFAULTS;

    getDefault<K extends keyof DEFAULTS>(key?: K) : DEFAULTS[K];

    getDefault<K extends keyof DEFAULTS>(key?: K) : any {
        if (typeof key === 'undefined') {
            return this.defaults;
        }

        return getObjectPathProperty(this.defaults, key as any);
    }
}
