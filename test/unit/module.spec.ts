/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Opticon, ValidatorResult} from "../../src";
import {OptionMissError} from "../../src/error";

type Options = {
    foo: string,
    baz: number,
}

describe('src/module.ts', () => {
    it('should set & get options', () => {
        const config = new Opticon<Options>();

        expect(config.has('foo')).toBeFalsy();
        expect(config.get('foo')).toBeUndefined();

        expect(config.has('baz')).toBeFalsy();
        expect(config.get('baz')).toBeUndefined();

        config.set('foo', 'bar');

        expect(config.get('foo')).toEqual('bar');
        expect(config.has('foo')).toBeTruthy();

        config.set({
            baz: 0
        })

        expect(config.get('baz')).toEqual(0);
        expect(config.has('baz')).toBeTruthy();
    });

    it('should validate options', () => {
        const config = new Opticon<Options>({
            validators: {
                foo: (value) => typeof value === 'string' && value.length > 2,
                baz: (value) => {
                    const output : ValidatorResult<number> = {
                        data: undefined,
                        success: false
                    };

                    if(typeof value === 'number') {
                        if(value > 5 && value < 10) {
                            output.success = true;
                            output.data = value;
                        }
                    }

                    return output;
                }
            }
        });

        config.set('foo', '');
        expect(config.has('foo')).toBeFalsy();

        config.set('foo', 'bar');
        expect(config.has('foo')).toBeTruthy();
        expect(config.get('foo')).toEqual('bar');

        config.set('baz', 4);
        expect(config.has('baz')).toBeFalsy();

        config.set('baz', 6);
        expect(config.has('baz')).toBeTruthy();

        expect(config.get()).toEqual({
            baz: 6,
            foo: 'bar'
        })

        config.reset(['baz']);
        expect(config.has('baz')).toBeFalsy();
        expect(config.has('foo')).toBeTruthy();
    })

    it('should transform options', () => {
        const config = new Opticon<Options>({
            validators: {
                foo: (value) => typeof value === 'string' && value.length > 2,
                baz: (value) => typeof value === 'number'
            },
            transformers: {
                foo: (value) => {
                    if(typeof value === 'number') {
                        return `${value}`;
                    }

                    if(typeof value === 'string') {
                        return value;
                    }

                    throw new Error('Option could not be transformed.')
                }
            }
        });

        expect(config.has('foo')).toBeFalsy();

        config.setRaw('foo', 123);

        expect(config.has('foo')).toBeTruthy();
        expect(config.get('foo')).toEqual('123');

        config.reset();

        expect(config.has('foo')).toBeFalsy();

        config.setRaw({
            foo: '321',
            baz: 'something'
        })

        expect(config.has('foo')).toBeTruthy();
        expect(config.has('baz')).toBeFalsy();

        config.setRaw('baz', 0);

        expect(config.has('baz')).toBeTruthy();
    });

    it('should work with defaults', () => {
        const config = new Opticon<Options>({
            defaults: {
                foo: 'bar'
            }
        });

        expect(config.has('foo')).toBeFalsy();
        expect(config.hasDefault('foo')).toBeTruthy();

        expect(config.get('foo')).toEqual('bar');

        expect(config.has('baz')).toBeFalsy();
        expect(config.hasDefault('baz')).toBeFalsy();

        config.setDefault('baz', 5);
        expect(config.has('baz')).toBeFalsy();
        expect(config.hasDefault('baz')).toBeTruthy();

        config.resetDefault('baz');
        expect(config.hasDefault('baz')).toBeFalsy();

        expect(config.getDefault()).toEqual({
            foo: 'bar'
        })

        config.resetDefault(['foo']);
        expect(config.hasDefault('foo')).toBeFalsy();

        config.setDefault({
            foo: 'foo'
        });

        expect(config.hasDefault('foo')).toBeTruthy();
        expect(config.getDefault('foo')).toEqual('foo');

        config.resetDefault();

        expect(config.hasDefault('foo')).toBeFalsy();
        expect(config.getDefault('foo')).toBeFalsy();
    })

    it('should throw error on miss', () => {
        const config = new Opticon<Options>({
            errorOnMiss: true
        });

        expect(config.has('foo')).toBeFalsy();

        try {
            expect(config.get('foo')).toThrow(OptionMissError);
            expect(true).toBe(false);
        } catch (e) {
            expect(e).toBeDefined();
        }
    })
})
