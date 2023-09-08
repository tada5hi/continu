/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from './module';
import type {
    ContainerProxy, Getter,
    Getters, IContainer, ObjectLiteral,
} from './type';

type ToContainerProxy<T> = T extends Container<infer DATA, infer DEFAULT, infer GETTERS> ?
    ContainerProxy<DATA, DEFAULT, GETTERS> :
    never;

export function createProxy<
    T extends Container<any, any, any>,
>(instance: T) :ToContainerProxy<T> {
    const polyfill : Record<string | symbol, any> = {};

    return new Proxy(polyfill, {
        ownKeys(target: Record<string | symbol, any>): ArrayLike<string | symbol> {
            return Object.keys(target);
            // todo: get flatten keys from instance
        },
        set(
            _target: Record<string | symbol, any>,
            key: string | symbol,
            newValue: any,
        ): boolean {
            if (typeof key === 'string') {
                instance.set(key, newValue);

                return true;
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            _target[key] = newValue;

            return true;
        },
        get(
            _target: Record<string | symbol, any>,
            key: string | symbol,
        ): any {
            if (typeof key === 'string') {
                return instance.get(key);
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return _target[key];
        },
        has(
            _target: Record<string | symbol, any>,
            key: string | symbol,
        ): boolean {
            if (typeof key === 'string') {
                return instance.has(key) || instance.hasDefault(key);
            }

            return Object.prototype.hasOwnProperty.call(_target, key);
        },
    }) as ToContainerProxy<T>;
}

// todo: keep defaults

type Context = {
    /**
     * foo
     */
    host: string
};

const data : Context = {
    /**
     * foo
     */
    host: 'localhost',
};

const wrapper = new Container({
    data,
    getters: {
        port: (data) => {
            if (data.hasRaw('port')) {
                return data.getRaw('port') as number;
            }

            return 0;
        },
        'nested.key': (data) => ({
            foo: data.getRaw('port') as number,
            bar: () => ({
                baz: 'boz',
            }),
        }),
    },
    transformers: {
    },
});

wrapper.reset('port');

const proxy = createProxy(wrapper);

const { port } = proxy;

const nestedKey = proxy['nested.key'];
if (nestedKey) {
    const b = nestedKey.foo + 1;
}

const pass = (ctx: ContainerProxy<Context, {port: number, host: string}>) => {
    const n = 1 + ctx.port;
};
pass(proxy);
