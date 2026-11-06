import { Container } from 'continu';
import type { NestedKeys, TypeFromNestedKeyPath } from 'continu';

type Data = {
    nested?: { key?: string; required: number };
    present: { key: string };
};

declare const container: Container<Data>;
container.set('nested.key', 'hello');
container.set('nested.required', 123);
// @ts-expect-error nested.key accepts strings, not numbers
container.set('nested.key', 123);
const optional: string | undefined = container.get('nested.key');
const absentParent: number | undefined = container.get('nested.required');
const required: string = container.get('present.key');
// @ts-expect-error an absent parent makes the read possibly undefined
const unsafe: number = container.get('nested.required');
const direct: TypeFromNestedKeyPath<Data, 'nested.key'> = 'hello';
void [optional, absentParent, required, unsafe, direct];

// @ts-expect-error nested paths must name a declared property
const invalidPath: NestedKeys<Data> = 'nested.unknown';
void invalidPath;
