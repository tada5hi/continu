/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type ObjectLiteral = Record<string, any>;
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

type ROL<T1, T2> = T2 extends NonNullable<infer U> ? U | NonNullable<T1> : T1 | T2;

export type DeepMerge<T1, T2> = (
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
        ) : ROL<T1, T2>
    ) : (
        ROL<T1, T2>
    )
    );

export type Transformer<V> = (value: unknown) => V;
export type Transformers<T extends ObjectLiteral> = {
    [K in keyof T]?: Transformer<T[K]>
};

export type ValidatorResult<V> = {
    success: boolean,
    data: V
};

export type Validator = (value: unknown) => unknown;
export type Validators<T extends ObjectLiteral> = {
    [K in keyof T]?: Validator
};

export interface IContainer<
    DATA extends ObjectLiteral = ObjectLiteral,
    DEFAULTS extends ObjectLiteral = DATA,

    F1 extends FlattenObject<DATA> = FlattenObject<DATA>,
    F2 extends FlattenObject<DEFAULTS> = FlattenObject<DEFAULTS>,
> {
    hasGetter(key: string) : boolean;

    getGetter(key: string) : any;

    hasRaw(key: keyof F1) : boolean;

    getRaw<K extends keyof F1>(key: K) : F1[K];

    hasDefault(key: keyof F2) : boolean;

    getDefault<K extends keyof F2>(key?: K) : F2[K];
}

type Fn = (...args: any[]) => any;

export type Getter = (context: IContainer) => any;

export type Getters<
    T extends ObjectLiteral,
> = {
    [K in keyof T]?: T[K] extends Getter ?
        Getter :
        T[K] extends ObjectLiteral ?
            Getters<T[K]> :
            never;
};

export type Options<
    DATA extends ObjectLiteral = ObjectLiteral,
    DEFAULTS extends ObjectLiteral = DATA,
    GETTERS extends Getters<ObjectLiteral> = Getters<ObjectLiteral>,
> = {
    data?: DATA,
    defaults?: DEFAULTS,
    getters?: GETTERS,
    transformers?: Transformers<DeepMerge<DATA, DEFAULTS>>,
    validators?: Validators<DeepMerge<DATA, DEFAULTS>>,

    errorOnMiss?: boolean
};

type GettersToRecord<
    T,
> = T extends Getters<any> ?
    {
        [K in keyof T]: T[K] extends Getters<any> ?
            GettersToRecord<T[K]> :
            T[K] extends Getter ? ReturnType<T[K]> : never
    } :
    never;

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
