/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type ObjectLiteral = Record<string, any>;

export type Transformer<V> = (value: unknown) => V;

export type Transformers<T extends ObjectLiteral> = {
    [K in keyof T]?: Transformer<T[K]>
};

export type ValidatorResult<V> = {
    success: boolean,
    data: V
};

export type Validator<V> = (value: unknown) => unknown;

export type Validators<T extends ObjectLiteral> = {
    [K in keyof T]?: Validator<T[K]>
};

export type Context<T extends ObjectLiteral> = {
    defaults?: Partial<T>,
    options?: Partial<T>,
    transformers?: Transformers<T>,
    validators?: Validators<T>,

    errorOnMiss?: boolean
};
