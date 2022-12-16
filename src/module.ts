/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { OptionMissError } from './error';
import { hasOwnProperty, isValidatorResult } from './utils';
import {
    Context,
    ObjectLiteral,
    Transformer,
    Transformers,
    Validators,
} from './type';

export class Opticon<
    O extends ObjectLiteral,
    I extends { [K in keyof O]?: any } = { [K in keyof O]?: any },
> {
    protected options : Partial<O>;

    protected defaults: Partial<O>;

    protected transformers: Transformers<O>;

    protected validators : Validators<O>;

    protected errorOnMiss: boolean;

    // -------------------------------------------------

    constructor(context?: Context<O>) {
        context = context || {};

        this.options = context.options || {};
        this.defaults = context.defaults || {};
        this.transformers = context.transformers || {};
        this.validators = context.validators || {};

        this.errorOnMiss = context.errorOnMiss ?? false;
    }

    // -------------------------------------------------

    set(value: Partial<O>) : this;

    set<K extends keyof O>(key: K, value: O[K]) : this;

    set<K extends keyof O>(key: (keyof O) | Partial<O>, value?: O[K]) : this {
        if (typeof key === 'object') {
            const keys = Object.keys(key);
            for (let i = 0; i < keys.length; i++) {
                this.set(keys[i], key[keys[i]]);
            }

            return this;
        }

        const validator = this.validators[key];
        if (validator) {
            try {
                const output = validator(value);

                if (isValidatorResult<O[K]>(output)) {
                    if (output.success) {
                        this.options[key] = output.data;
                    }
                }

                if (typeof output === 'boolean' && output) {
                    this.options[key] = value;
                }
            } catch (e) {
                // do nothing
            }

            return this;
        }

        this.options[key] = value;

        return this;
    }

    setRaw(value: I) : this;

    setRaw<K extends keyof O>(key: K, value: I[K]) : this;

    setRaw<K extends keyof O>(key: K | I, value?: I[K]) : this {
        if (typeof key === 'object') {
            const keys = Object.keys(key);
            for (let i = 0; i < keys.length; i++) {
                this.setRaw(keys[i], key[keys[i]]);
            }

            return this;
        }

        if (hasOwnProperty(this.transformers, key)) {
            this.set(key, (this.transformers[key] as Transformer<O[K]>)(value));

            return this;
        }

        if (hasOwnProperty(this.validators, key)) {
            this.set(key, value as unknown as O[K]);
        }

        return this;
    }

    has(key: keyof O) : boolean {
        return hasOwnProperty(this.options, key);
    }

    // ----------------------------------------------

    reset() : this;

    reset(key: keyof O) : this;

    reset(keys: (keyof O)[]) : this;

    reset(key?: (keyof O) | (keyof O)[]) : this {
        if (typeof key === 'undefined') {
            this.options = {};
            return this;
        }

        if (Array.isArray(key)) {
            for (let i = 0; i < key.length; i++) {
                this.reset(key[i]);
            }

            return this;
        }

        if (hasOwnProperty(this.options, key)) {
            delete this.options[key];
        }

        return this;
    }

    // ----------------------------------------------

    get() : O;

    get<K extends keyof O>(key: K) : O[K];

    get<K extends keyof O>(key?: K) : any {
        if (typeof key === 'undefined') {
            const keys = [
                ...new Set([
                    ...Object.keys(this.defaults),
                    ...Object.keys(this.options),
                ]),
            ];

            const options : Record<string, any> = {};

            for (let i = 0; i < keys.length; i++) {
                options[keys[i]] = this.get(keys[i]);
            }

            return options as O;
        }
        if (hasOwnProperty(this.options, key)) {
            return this.options[key] as O[K];
        }

        if (hasOwnProperty(this.defaults, key)) {
            return this.defaults[key] as O[K];
        }

        if (this.errorOnMiss) {
            throw new OptionMissError(key as string);
        }

        return undefined;
    }

    // ----------------------------------------------

    setDefault(value: Partial<O>) : this;

    setDefault<K extends keyof O>(key: K, value: O[K]) : this;

    setDefault<K extends keyof O>(key: (keyof O) | Partial<O>, value?: O[K]) : this {
        if (typeof key === 'object') {
            const keys = Object.keys(key);
            for (let i = 0; i < keys.length; i++) {
                this.setDefault(keys[i], key[keys[i]]);
            }

            return this;
        }

        this.defaults[key] = value;

        return this;
    }

    hasDefault(key: keyof O) : boolean {
        return hasOwnProperty(this.defaults, key);
    }

    resetDefault() : this;

    resetDefault(key: keyof O) : this;

    resetDefault(keys: (keyof O)[]) : this;

    resetDefault(key?: (keyof O) | (keyof O)[]) : this {
        if (typeof key === 'undefined') {
            this.defaults = {};
            return this;
        }

        if (Array.isArray(key)) {
            for (let i = 0; i < key.length; i++) {
                this.resetDefault(key[i]);
            }

            return this;
        }

        if (hasOwnProperty(this.defaults, key)) {
            delete this.defaults[key];
        }

        return this;
    }

    getDefault() : O;

    getDefault<K extends keyof O>(key?: K) : O[K];

    getDefault<K extends keyof O>(key?: K) : any {
        if (typeof key === 'undefined') {
            return this.defaults;
        }

        if (hasOwnProperty(this.defaults, key)) {
            return this.defaults[key] as O[K];
        }

        return undefined;
    }
}
