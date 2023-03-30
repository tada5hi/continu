/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ValidatorResult } from '../../src';
import { Continu, OptionMissError } from '../../src';

type Options = {
    foo: string,
    bar: string,
    baz: number,

    nested: {
        key: string
    }
};

describe('src/module.ts', () => {
    it('should set & get options', () => {
        const continu = new Continu<Options>();

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
        const continu = new Continu<Options>({
            validators: {
                foo: (value) => typeof value === 'string' && value.length > 2,
                baz: (value) => {
                    const output : ValidatorResult<number> = {
                        data: undefined,
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
        const continu = new Continu<Options>({
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

        continu.setRaw('foo', 123);

        expect(continu.has('foo')).toBeTruthy();
        expect(continu.get('foo')).toEqual('123');

        continu.reset();

        expect(continu.has('foo')).toBeFalsy();

        continu.setRaw({
            foo: '321',
            baz: 'something',
        });

        expect(continu.has('foo')).toBeTruthy();
        expect(continu.has('baz')).toBeFalsy();

        continu.setRaw('baz', 0);

        expect(continu.has('baz')).toBeTruthy();
    });

    it('should work with defaults', () => {
        const continu = new Continu<Options>({
            defaults: {
                foo: 'bar',
            },
        });

        expect(continu.has('foo')).toBeFalsy();
        expect(continu.hasDefault('foo')).toBeTruthy();

        expect(continu.get('foo')).toEqual('bar');

        expect(continu.has('baz')).toBeFalsy();
        expect(continu.hasDefault('baz')).toBeFalsy();

        continu.setDefault('baz', 5);
        expect(continu.has('baz')).toBeFalsy();
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

        continu.resetDefault();

        expect(continu.hasDefault('foo')).toBeFalsy();
        expect(continu.getDefault('foo')).toBeFalsy();
    });

    it('should throw error on miss', () => {
        const continu = new Continu<Options>({
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
        const continu = new Continu<Options>();

        expect(continu.has('nested.key')).toBeFalsy();
        expect(continu.get('nested.key')).toBeFalsy();
        expect(continu.get('nested')).toBeFalsy();

        continu.set('nested.key', 'test');

        expect(continu.has('nested.key')).toBeTruthy();
        expect(continu.get('nested.key')).toEqual('test');
        expect(continu.get('nested')).toEqual({ key: 'test' });
    });

    it('should use dynamic getters', () => {
        const continu = new Continu<Options>({
            defaults: {
                foo: 'bar',
            },
            getters: {
                bar: (context) => `${context.get('foo')}:baz`,
            },
        });

        expect(continu.has('foo')).toBeFalsy();
        expect(continu.has('bar')).toBeFalsy();

        expect(continu.get('foo')).toEqual('bar');
        expect(continu.get('bar')).toEqual('bar:baz');
    });
});
