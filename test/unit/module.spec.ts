/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ValidatorResult } from '../../src';
import {
    Container, OptionMissError, createContainer, defineGetter,
} from '../../src';

type Data = {
    foo?: string,
    bar?: string,
    baz?: number,

    nested?: {
        key?: string
    }
};

describe('src/module.ts', () => {
    it('should set & get options', () => {
        const continu = createContainer<Data>();

        expect(continu.has('foo')).toBeFalsy();
        expect(continu.get('foo')).toBeUndefined();

        expect(continu.has('baz')).toBeFalsy();
        expect(continu.get('baz')).toBeUndefined();

        continu.set('foo', 'bar');

        expect(continu.get('foo')).toEqual('bar');
        expect(continu.has('foo')).toBeTruthy();

        continu.set({
            baz: 0,
        });

        expect(continu.get('baz')).toEqual(0);
        expect(continu.has('baz')).toBeTruthy();
    });

    it('should validate options', () => {
        const continu = createContainer<Data>({
            validators: {
                foo: (value) => typeof value === 'string' && value.length > 2,
                baz: (value) => {
                    const output : ValidatorResult<number> = {
                        data: 1,
                        success: false,
                    };

                    if (typeof value === 'number') {
                        if (value > 5 && value < 10) {
                            output.success = true;
                            output.data = value;
                        }
                    }

                    return output;
                },
            },
        });

        continu.set('foo', '');
        expect(continu.has('foo')).toBeFalsy();

        continu.set('foo', 'bar');
        expect(continu.has('foo')).toBeTruthy();
        expect(continu.get('foo')).toEqual('bar');

        continu.set('baz', 4);
        expect(continu.has('baz')).toBeFalsy();

        continu.set('baz', 6);
        expect(continu.has('baz')).toBeTruthy();

        expect(continu.get()).toEqual({
            baz: 6,
            foo: 'bar',
        });

        continu.reset(['baz']);
        expect(continu.has('baz')).toBeFalsy();
        expect(continu.has('foo')).toBeTruthy();
    });

    it('should transform options', () => {
        const continu = new Container<Data>({
            validators: {
                foo: (value) => typeof value === 'string' && value.length > 2,
                baz: (value) => typeof value === 'number',
            },
            transformers: {
                foo: (value) => {
                    if (typeof value === 'number') {
                        return `${value}`;
                    }

                    if (typeof value === 'string') {
                        return value;
                    }

                    throw new Error('Option could not be transformed.');
                },
            },
        });

        expect(continu.has('foo')).toBeFalsy();

        continu.set('foo', '123');

        expect(continu.has('foo')).toBeTruthy();
        expect(continu.get('foo')).toEqual('123');

        continu.reset('foo');

        expect(continu.has('foo')).toBeFalsy();

        continu.setRaw('foo', '321');
        continu.setRaw('baz', 'something');

        expect(continu.has('foo')).toBeTruthy();
        expect(continu.has('baz')).toBeFalsy();

        continu.set('baz', 1);

        expect(continu.has('baz')).toBeTruthy();
    });

    it('should work with defaults', () => {
        const continu = new Container({
            data: {} as Data,
            defaults: {
                foo: 'bar',
            } as Data,
        });

        expect(continu.has('foo')).toBeTruthy();
        expect(continu.hasDefault('foo')).toBeTruthy();

        expect(continu.get('foo')).toEqual('bar');

        expect(continu.has('baz')).toBeFalsy();
        expect(continu.hasDefault('baz')).toBeFalsy();

        continu.setDefault('baz', 5);
        expect(continu.has('baz')).toBeTruthy();
        expect(continu.hasDefault('baz')).toBeTruthy();

        continu.resetDefault('baz');
        expect(continu.hasDefault('baz')).toBeFalsy();

        expect(continu.getDefault()).toEqual({
            foo: 'bar',
        });

        continu.resetDefault(['foo']);
        expect(continu.hasDefault('foo')).toBeFalsy();

        continu.setDefault({
            foo: 'foo',
        });

        expect(continu.hasDefault('foo')).toBeTruthy();
        expect(continu.getDefault('foo')).toEqual('foo');
    });

    it('should throw error on miss', () => {
        const continu = new Container<Data>({
            errorOnMiss: true,
        });

        expect(continu.has('foo')).toBeFalsy();

        try {
            expect(continu.get('foo')).toThrow(OptionMissError);
            expect(true).toBe(false);
        } catch (e) {
            expect(e).toBeDefined();
        }
    });

    it('should set & get nested option', () => {
        const continu = new Container({
            data: {
                nested: {
                    key: 'bar',
                },
            } as Data,
        });

        expect(continu.has('nested.key')).toBeTruthy();
        expect(continu.get('nested.key')).toEqual('bar');
        expect(continu.get('nested')).toEqual({ key: 'bar' });

        continu.set('nested', {
            key: 'test',
        });

        expect(continu.has('nested.key')).toBeTruthy();
        expect(continu.get('nested.key')).toEqual('test');
        expect(continu.get('nested')).toEqual({ key: 'test' });
    });

    it('should use dynamic getters', () => {
        const continu = new Container({
            defaults: {
                foo: 'bar',
            },
            getters: {
                bar: defineGetter((context) => `${context.get('foo')}:baz`),
            },
        });

        expect(continu.has('foo')).toBeTruthy();
        expect(continu.has('bar')).toBeTruthy();

        expect(continu.get('foo')).toEqual('bar');
        expect(continu.get('bar')).toEqual('bar:baz');
    });

    it('should access property of dynamic getter', () => {
        const continu = new Container({
            defaults: {
                foo: 'bar',
            },
            getters: {
                nested: () => ({
                    key: 'bar',
                }),
            },
        });

        expect(continu.has('nested')).toBeTruthy();
        expect(continu.has('nested.key')).toBeFalsy();
        expect(continu.has('nested.key', true)).toBeTruthy();

        expect(continu.get('nested')).toEqual({ key: 'bar' });
        expect(continu.get('nested.key')).toEqual('bar');
    });
});
