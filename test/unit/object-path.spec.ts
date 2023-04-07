import { hasObjectPathProperty, setObjectPathProperty } from '../../src';

describe('src/utils/object-path', () => {
    it('should set object path property', () => {
        let data : Record<string, any> = {};
        setObjectPathProperty(data, 'foo', 'bar');
        expect(data).toEqual({ foo: 'bar' });

        data = {};
        setObjectPathProperty(data, 'foo.bar', 'baz');
        expect(data).toEqual({ foo: { bar: 'baz' } });
    });

    it('should check object path property', () => {
        const data = {
            foo: {
                bar: {
                    baz: 'boz',
                },
            },
        };

        expect(hasObjectPathProperty(data, 'foo.bar')).toBeTruthy();
        expect(hasObjectPathProperty(data, 'foo.bar.baz')).toBeTruthy();
        expect(hasObjectPathProperty(data, 'foo.boz')).toBeFalsy();
    });
});
