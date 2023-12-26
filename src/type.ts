/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type ObjectLiteral = Record<string, any>;
export type ObjectEmptyLiteral = Record<string, never>;

type PrevIndex = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export type NestedKeys<T extends ObjectLiteral, Depth extends number = 4> =
    T extends ObjectLiteral ?
        (
            [Depth] extends [0] ? never :
                {[Key in keyof T & (string | number)]: T[Key] extends Record<string, any> | undefined
                    ? (T[Key] extends Date ? `${Key}` : `${Key}.${NestedKeys<T[Key], PrevIndex[Depth]>}` | `${Key}`)
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
            ? T[P] extends ObjectLiteral
                ? TypeFromNestedKeyPath<NonNullable<T[P]>, S>
                : undefined
            : never;
}[Path];

export type FlattenObject<O extends ObjectLiteral> = {
    [K in NestedKeys<O>]: TypeFromNestedKeyPath<O, K>
};

type ReadonlyDeep<T extends ObjectLiteral> = {
    readonly [K in keyof T]: T[K] extends Fn ?
        T[K] :
        T[K] extends ObjectLiteral ?
            ReadonlyDeep<T[K]> :
            T[K]
};

export type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
export type RequiredKeys<T> = Exclude<KeysOfType<T, Exclude<T[keyof T], undefined>>, undefined>;
export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

export type ResetKeys<RK, DK> = OptionalKeys<RK> | {
    [K in keyof DK]: K extends keyof RK ? K : never
}[keyof DK];

type RealValue<A, B> = [A] extends [never] ?
    B :
    [B] extends [never] ?
        A :
        A extends NonNullable<infer U> ?
            U | NonNullable<B> :
            B extends NonNullable<infer U> ?
                U | NonNullable<A> :
                A | B;

export type DeepMerge<T1, T2> = T1 extends ObjectEmptyLiteral ? T2 :
    T2 extends ObjectEmptyLiteral ?
        T1 :
        T1 extends ObjectLiteral ? (
            T2 extends ObjectLiteral ? (
                (
                    {
                        [K in (keyof T2 & keyof T1 & RequiredKeys<T1 | T2>)]: DeepMerge<T1[K], T2[K]>
                    }
                    &
                    {
                        [K in (keyof T2 & keyof T1 & OptionalKeys<T1 | T2>)]?: DeepMerge<T1[K], T2[K]>
                    }
                    & {
                        [K in Exclude<RequiredKeys<T1>, keyof T2>]: T1[K]
                    }
                    &
                    {
                        [K in Exclude<OptionalKeys<T1>, keyof T2>]?: T1[K]
                    }
                    &
                    {
                        [K in Exclude<RequiredKeys<T2>, keyof T1>]: T2[K]
                    }
                    &
                    {
                        [K in Exclude<OptionalKeys<T2>, keyof T1>]?: T2[K]
                    }
                )
            ) : RealValue<T1, T2>
        ) : (
            RealValue<T1, T2>
        );

export type Transformer<V> = (value: unknown) => V;
export type Transformers<T extends ObjectLiteral> = {
    [K in keyof T]?: Transformer<T[K]>
};

export type ValidatorResult<V> = {
    success: boolean,
    data: V
};

export type Validator<V = any> = (value: V) => unknown;
export type Validators<T extends ObjectLiteral> = {
    [K in keyof T]?: Validator<T[K]>
};

export interface GetterContext {
    has(key: string) : any;

    get(key: string) : any;

    hasGetter(key: string) : boolean;

    getGetter(key: string) : any

    hasDefault(key: string) : boolean;

    getDefault(key?: string) : any;
}

type Fn = (...args: any[]) => any;

export type Getter = (context: GetterContext) => any;

export type Getters = {
    [key: string]: Getter | Getters
};

export type Options<
    DATA extends ObjectLiteral = Record<string, never>,
    DEFAULTS extends ObjectLiteral = Record<string, never>,
    GETTERS extends Getters = Record<string, never>,

    DataDefaults extends DeepMerge<DATA, DEFAULTS> = DeepMerge<DATA, DEFAULTS>,
> = {
    data?: DATA,
    defaults?: DEFAULTS,
    getters?: GETTERS,
    transformers?: Transformers<DataDefaults>,
    validators?: Validators<DataDefaults>,

    errorOnMiss?: boolean
};

export type GettersToRecord<
    T extends ObjectLiteral,
> = {
    [K in keyof T]: T[K] extends Getters ?
        GettersToRecord<T[K]> :
        (T[K] extends (...args: any[]) => infer R
            ? R
            : never)
};

export type ContainerProxy<
    DATA extends ObjectLiteral = ObjectLiteral,
    DEFAULTS extends ObjectLiteral = DATA,
    GETTERS extends ObjectLiteral = ObjectLiteral,
    E = DeepMerge<DATA, DEFAULTS>,
> = E & ReadonlyDeep<
GettersToRecord<
Omit<GETTERS, keyof E>
>
>;
