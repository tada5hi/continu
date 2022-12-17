/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;

type PrevIndex = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export type NestedKeys<T extends ObjectLiteral, Depth extends number = 4> =
    T extends ObjectLiteral ?
        (
            [Depth] extends [0] ? never :
                {[Key in keyof T & (string | number)]: Flatten<T[Key]> extends Record<string, any>
                    ? (Flatten<T[Key]> extends Date ? `${Key}` : `${Key}.${NestedKeys<Flatten<T[Key]>, PrevIndex[Depth]>}` | `${Key}`)
                    : `${Key}`
                }[keyof T & (string | number)]
        ) : string;

export type TypeFromNestedKeyPath<
    T extends ObjectLiteral,
    Path extends string,
> = {
    [K in Path]: K extends keyof T
        ? T[K]
        : K extends `${infer P}.${infer S}`
            ? Flatten<T[P]> extends ObjectLiteral
                ? TypeFromNestedKeyPath<Flatten<T[P]>, S>
                : never
            : never;
}[Path];

export type FlattenObject<O extends ObjectLiteral> = {
    [K in NestedKeys<O>]: TypeFromNestedKeyPath<O, K>
};

export type ObjectLiteral = Record<string, any>;

export type Transformer<V> = (value: unknown) => V;

export type Transformers<T extends ObjectLiteral> = {
    [K in keyof FlattenObject<T>]?: Transformer<FlattenObject<T>[K]>
};

export type ValidatorResult<V> = {
    success: boolean,
    data: V
};

export type Validator<V> = (value: unknown) => unknown;

export type Validators<T extends ObjectLiteral> = {
    [K in keyof FlattenObject<T>]?: Validator<FlattenObject<T>[K]>
};

export type Context<T extends ObjectLiteral> = {
    defaults?: Partial<T>,
    options?: Partial<T>,
    transformers?: Transformers<T>,
    validators?: Validators<T>,

    errorOnMiss?: boolean
};
