import { expect, it } from 'vitest';
import { Container, defineGetter } from '../../src';

it('getters can use every advertised context operation', () => {
    const container = new Container({
        data: { stored: 'data' },
        defaults: { fallback: 'default' },
        getters: {
            other: () => 'getter',
            result: defineGetter((context) => ({
                data: context.get('stored'),
                hasData: context.has('stored'),
                hasOther: context.hasGetter('other'),
                other: context.getGetter('other'),
                hasDefault: context.hasDefault('fallback'),
                fallback: context.getDefault('fallback'),
                defaults: context.getDefault(),
            })),
        },
    });

    expect(container.hasGetter('missing')).toBe(false);
    expect(container.getGetter('missing')).toBeUndefined();
    expect(container.get('result')).toEqual({
        data: 'data', hasData: true, hasOther: true, other: 'getter',
        hasDefault: true, fallback: 'default', defaults: { fallback: 'default' },
    });
});

it('evaluated getter presence distinguishes missing, undefined and inherited suffixes', () => {
    const inherited = Object.create({ nested: { port: 123 } });
    const container = new Container({
        getters: {
            missing: (): { port?: number } => ({}),
            present: () => ({ port: undefined }),
            inherited: () => inherited,
            primitive: () => 123,
            array: () => ['first'],
            nullable: () => null,
        },
    });

    expect(container.has('missing.port', true)).toBe(false);
    expect(container.has('present.port', true)).toBe(true);
    expect(container.has('inherited.nested.port', true)).toBe(false);
    expect(container.has('primitive.port' as never, true)).toBe(false);
    expect(container.get('missing.port')).toBeUndefined();
    expect(container.has('array.0', true)).toBe(true);
    expect(container.get('array.0')).toBe('first');
    expect(container.has('nullable.port' as never, true)).toBe(false);
});
