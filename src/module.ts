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
    Getters,
    IContainer,
    ObjectLiteral, OptionalKeys,
    Options,
    Transformers,
    Validators,
} from './type';
import {
    getObjectPathProperty,
    hasObjectPathProperty,
    isValidatorResult,
    removeObjectPathProperty,
    setObjectPathProperty,
} from './utils';

export class Container<
    DATA extends ObjectLiteral = ObjectLiteral,
    DEFAULTS extends ObjectLiteral = DATA,
    GETTERS extends Getters<ObjectLiteral> = Getters<ObjectLiteral>,

    DataFlat extends FlattenObject<DATA> = FlattenObject<DATA>,
    DefaultsFlat extends FlattenObject<DEFAULTS> = FlattenObject<DEFAULTS>,
> {
    protected data : DATA;

    protected defaults: DEFAULTS;

    protected getters : GETTERS;

    protected transformers: Transformers<DeepMerge<DATA, DEFAULTS>>;

    protected validators : Validators<DeepMerge<DATA, DEFAULTS>>;

    protected errorOnMiss: boolean;

    // -------------------------------------------------

    constructor(options?: Options<DATA, DEFAULTS, GETTERS>) {
        options = options || {};

        this.data = options.data || {} as DATA;
        this.defaults = options.defaults || {} as DEFAULTS;
        this.getters = options.getters || {} as GETTERS;
        this.transformers = options.transformers || {};
        this.validators = options.validators || {};

        this.errorOnMiss = options.errorOnMiss ?? false;
    }

    // -------------------------------------------------

    set(value: Partial<DataFlat>) : this;

    set<K extends keyof DataFlat>(key: K, value: DataFlat[K]) : this;

    set(key: string | Partial<ObjectLiteral>, value?: any) : this {
        if (typeof key === 'object') {
            const keys = Object.keys(key);
            for (let i = 0; i < keys.length; i++) {
                this.set(keys[i] as keyof DataFlat, key[keys[i]]);
            }

            return this;
        }

        const transformer = this.transformers[key];
        if (transformer) {
            value = transformer(value);
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
            } catch (e) {
                // do nothing
            }

            return this;
        }

        setObjectPathProperty(this.data, key, value);

        return this;
    }

    has(key: keyof DataFlat) : boolean {
        return hasObjectPathProperty(this.data, key as any);
    }

    // ----------------------------------------------

    reset(key: OptionalKeys<DataFlat>) : this;

    reset(keys: OptionalKeys<DataFlat>[]) : this;

    reset(key: OptionalKeys<DataFlat> | OptionalKeys<DataFlat>[]) : this {
        if (Array.isArray(key)) {
            for (let i = 0; i < key.length; i++) {
                this.reset(key[i]);
            }

            return this;
        }

        removeObjectPathProperty(this.data, key as any);

        return this;
    }

    // ----------------------------------------------

    // todo: merge of DATA, DEFAULTS, GETTERS
    get() : DATA;

    get<K extends keyof DataFlat>(key: K) : DataFlat[K];

    get(key?: string) : any {
        if (typeof key === 'undefined') {
            const keys = [
                ...new Set([
                    ...Object.keys(this.defaults),
                    ...Object.keys(this.data),
                ]),
            ];

            const options : Record<string, any> = {};

            for (let i = 0; i < keys.length; i++) {
                options[keys[i]] = this.get(keys[i] as keyof DataFlat);
            }

            return options;
        }

        if (hasObjectPathProperty(this.data, key)) {
            return getObjectPathProperty(this.data, key);
        }

        const dynamicGetter = evaluatePathForDynamicGetters(this.getters, key, this as IContainer);
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

    setDefault<K extends keyof DefaultsFlat>(key: K, value: DefaultsFlat[K]) : this;

    setDefault(key: string | Partial<ObjectLiteral>, value?: any) : this {
        if (typeof key === 'object') {
            const keys = Object.keys(key);
            for (let i = 0; i < keys.length; i++) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this.setDefault(keys[i], key[keys[i]]);
            }

            return this;
        }

        setObjectPathProperty(this.defaults, key as any, value);

        return this;
    }

    hasDefault(key: keyof DefaultsFlat) : boolean {
        return hasObjectPathProperty(this.defaults, key as any);
    }

    resetDefault(key: OptionalKeys<DefaultsFlat>) : this;

    resetDefault(keys: OptionalKeys<DefaultsFlat>[]) : this;

    resetDefault(key: OptionalKeys<DefaultsFlat> | OptionalKeys<DefaultsFlat>[]) : this {
        if (Array.isArray(key)) {
            for (let i = 0; i < key.length; i++) {
                this.resetDefault(key[i] as OptionalKeys<DefaultsFlat>);
            }

            return this;
        }

        removeObjectPathProperty(this.defaults, key as any);

        return this;
    }

    getDefault() : DEFAULTS;

    getDefault<K extends keyof DefaultsFlat>(key?: K) : DefaultsFlat[K];

    getDefault<K extends keyof DefaultsFlat>(key?: K) : any {
        if (typeof key === 'undefined') {
            return this.defaults;
        }

        return getObjectPathProperty(this.defaults, key as any);
    }
}
