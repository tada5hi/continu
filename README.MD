<p align="center"><img src=".github/assets/logo.svg" width="144" height="144" alt="Continu logo" /></p>
<h1 align="center">Continu</h1>
<p align="center"><strong>Zero dependency container/config library.</strong></p>
<p align="center">Keep configuration data, fallback values and computed settings behind one typed container.</p>
<p align="center">
  <a href="https://www.npmjs.com/package/continu"><img src="https://img.shields.io/npm/v/continu" alt="npm version" /></a>
  <a href="https://github.com/tada5hi/continu/actions"><img src="https://img.shields.io/github/actions/workflow/status/tada5hi/continu/main.yml" alt="CI status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/continu" alt="License" /></a>
</p>
<p align="center"><a href="#installation">Installation</a> · <a href="#usage">Usage</a> · <a href="#api">API</a> · <a href="#notes">Notes</a></p>

---

## Why Continu?

Keep configuration data, fallback values and computed settings behind one typed container.

| Concern | Without it | With it |
|---|---|---|
| Fallbacks | Repeat conditional reads | Resolve data, then getters, then defaults |
| Input conversion | Parse values at every entry point | Apply configured transformers with setRaw |
| Validation | Guard every assignment manually | Validate set calls before storing values |

Container.get first checks stored data, then evaluates a matching getter, then reads defaults; a missing key returns undefined or throws when errorOnMiss is enabled.

<img src=".github/assets/mechanism.svg" width="960" alt="Container.get first checks stored data, then evaluates a matching getter, then reads defaults; a missing key returns undefined or throws when errorOnMiss is enabled." />

**Table of Contents**

- [Why Continu?](#why-continu)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic](#basic)
  - [Defaults](#defaults)
  - [Transformation](#transformation)
  - [Validation](#validation)
  - [Nesting](#nesting)
  - [Getters](#getters)
  - [Missing values and errors](#missing-values-and-errors)
- [Resolution and writes](#resolution-and-writes)
- [API](#api)
- [Notes](#notes)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install continu
```

The package manifest does not declare a Node runtime minimum. ESM, CommonJS and TypeScript declarations are included. Import the documented package entrypoint rather than undeclared `dist/` paths.

## Usage

```typescript
import { createContainer } from 'continu';

const config = createContainer({
    defaults: { port: 3000 },
    transformers: { port: (value) => Number(value) },
    validators: { port: (value) => value > 0 },
});
config.setRaw('port', '8080');
console.log(config.get('port')); // 8080
config.set('port', -1);
console.log(config.get('port')); // 8080: invalid write is ignored
```

### Basic

Use `Container` for typed key-value storage, or `createContainer` to infer the types from your options. `has` checks presence, not truthiness; a property with the value `undefined` is still present.

```typescript
import { Container } from 'continu';

type Settings = { message?: string };
const settings = new Container<Settings>();
console.log(settings.has('message')); // false
console.log(settings.get('message')); // undefined
settings.set('message', 'hello');
console.log(settings.has('message')); // true
console.log(settings.get('message')); // hello
settings.reset('message');
console.log(settings.has('message')); // false
```

### Defaults

Defaults are read when there is no stored value or matching getter. They also count as present for `has`. Overriding a value does not change its default; resetting a top-level override exposes the fallback again.

```typescript
import { createContainer } from 'continu';

const settings = createContainer({ defaults: { message: 'hello' } });
console.log(settings.has('message')); // true
console.log(settings.get('message')); // hello
settings.set('message', 'welcome');
console.log(settings.get('message')); // welcome
console.log(settings.getDefault('message')); // hello
settings.reset('message');
console.log(settings.get('message')); // hello
```

### Transformation

Use `setRaw` to accept unknown input and convert it before validation and storage. `set` accepts already-typed values and does not invoke transformers. A thrown transformer error propagates to the caller; unlike validator exceptions, it is not swallowed.

```typescript
import { Container } from 'continu';

const settings = new Container<{ message?: string }>({
    transformers: {
        message: (value) => {
            if (typeof value === 'number' || typeof value === 'string') {
                return String(value);
            }
            throw new Error('Message must be a string or number.');
        },
    },
});
settings.setRaw('message', '123');
console.log(settings.get('message')); // 123
settings.setRaw('message', 456);
console.log(settings.get('message')); // 456
try {
    settings.setRaw('message', { unexpected: true });
} catch (error) {
    console.log((error as Error).message); // Message must be a string or number.
}
```

With no transformer for a key, `setRaw` leaves it unchanged.

### Validation

Validators constrain writes through `set`, including transformed writes from `setRaw`. A false result, an unrecognized result or a thrown exception ignores that write. Returning `{ success: true, data }` stores the returned data instead of the original input.

```typescript
import { Container } from 'continu';

const settings = new Container<{ message?: string }>({
    validators: {
        message: (value) => typeof value === 'string' && value.length > 3,
    },
});
settings.set('message', 'hey');
console.log(settings.get('message')); // undefined
settings.set('message', 'welcome');
console.log(settings.get('message')); // welcome
settings.set('message', 'no');
console.log(settings.get('message')); // welcome: rejected writes preserve the previous value
```

Validation does not run over constructor `data`, defaults or getter results.

### Nesting

Use dotted paths to read, check and set nested properties. Setting a missing path creates intermediate records. The container's type helpers infer nested keys up to their configured depth (four by default).

```typescript
import { Container } from 'continu';

const settings = new Container<{ nested: { message: string } }>();
console.log(settings.has('nested.message')); // false
console.log(settings.get('nested.message')); // undefined
settings.set('nested.message', 'hello');
console.log(settings.has('nested.message')); // true
console.log(settings.get('nested.message')); // hello
console.log(settings.has('nested')); // true
console.log(settings.get('nested')); // { message: 'hello' }
```

Dotted removal is not implemented by the current removal helper; see [Notes](#notes) before using nested `reset` or `resetDefault`.

### Getters

A getter can return a record whose fields you read through dotted paths. `has` recognizes an explicitly registered getter name without evaluating it. For paths below that name, pass `true` to evaluate the getter during the presence check. Getter results are recomputed, not cached.

```typescript
import { createContainer, defineGetter } from 'continu';

const settings = createContainer({
    defaults: { message: 'hello' },
    getters: {
        nested: defineGetter((context) => ({ message: context.getDefault('message') })),
    },
});
console.log(settings.has('nested')); // true
console.log(settings.has('nested.message')); // false
console.log(settings.has('nested.message', true)); // true
console.log(settings.get('nested')); // { message: 'hello' }
console.log(settings.get('nested.message')); // hello
```

The context exposes the container's `get`, `has`, `getDefault` and `hasDefault` behavior. Getter exceptions propagate to the caller. Avoid cyclic getter dependencies.

### Missing values and errors

By default a missing key returns `undefined`. Set `errorOnMiss` to throw `OptionMissError` instead. That error reports the missing key; it is separate from transformer and getter errors, which propagate unchanged.

```typescript
import { Container, OptionMissError } from 'continu';

const settings = new Container<{ missing?: string }>({ errorOnMiss: true });
try {
    settings.get('missing');
} catch (error) {
    console.log(error instanceof OptionMissError); // true
}
```

## Resolution and writes

`get(key)` checks stored data, a matching getter, then defaults. Missing keys return `undefined`, or throw `OptionMissError` with `errorOnMiss: true`. `get()` collects top-level data/default/getter keys and resolves each one; it does not recursively deep-merge nested records.

`set(record)` applies each top-level entry through `set(key, value)`. Dotted paths are supported for reading and writing nested data. Use `has(key, true)` to evaluate nested dynamic getters during an existence check.

| Option | Default | Purpose |
|---|---|---|
| `data` | `{}` | Initial stored values |
| `defaults` | `{}` | Fallback values |
| `getters` | `{}` | Functions receiving a context with `get` and `has` |
| `transformers` | `{}` | Convert unknown input used by `setRaw` |
| `validators` | `{}` | Accept, reject or replace values on `set` |
| `errorOnMiss` | `false` | Throw when no source contains a key |

`setDefault`, `getDefault`, `hasDefault` and `resetDefault` manage fallbacks separately. `define` and `defineGetter` preserve their input and help retain inferred types.

## API

All names below are exported from `continu`. Types have no runtime value.

| Export | Kind | Purpose |
|---|---|---|
| `createContainer` | function | Construct a typed Container |
| `define` | function | Return an input unchanged with its inferred type |
| `defineGetter` | function | Return a getter unchanged with its inferred type |
| `OptionMissError` | class | Error raised on a missing setting when configured |
| `Container` | class | Read/write settings with defaults, getters and validation |
| `ObjectLiteral` | type | Type contract for object literal |
| `ObjectEmptyLiteral` | type | Type contract for object empty literal |
| `NestedKeys` | type | Type contract for nested keys |
| `TypeFromNestedKeyPath` | type | Type contract for type from nested key path |
| `FlattenObject` | type | Type contract for flatten object |
| `KeysOfType` | type | Type contract for keys of type |
| `RequiredKeys` | type | Type contract for required keys |
| `OptionalKeys` | type | Type contract for optional keys |
| `ResetKeys` | type | Type contract for reset keys |
| `DeepMerge` | type | Type contract for deep merge |
| `Transformer` | type | Type contract for transformer |
| `Transformers` | type | Type contract for transformers |
| `ValidatorResult` | type | Type contract for validator result |
| `Validator` | type | Type contract for validator |
| `Validators` | type | Type contract for validators |
| `GetterContext` | interface | Type contract for getter context |
| `Getter` | type | Type contract for getter |
| `Getters` | type | Type contract for getters |
| `Options` | type | Type contract for options |
| `GettersToRecord` | type | Type contract for getters to record |
| `ContainerProxy` | type | Type contract for container proxy |
| `hasOwnProperty` | function | Check own-property membership |
| `setObjectPathProperty` | function | Assign an object property through a dotted path |
| `hasObjectPathProperty` | function | Check own-property membership along a dotted path |
| `removeObjectPathProperty` | function | Remove a top-level property; nested deletion is limited (see Notes) |
| `getObjectPathProperty` | function | Read a dotted object path |
| `isObject` | function | Check for a non-null non-array object |
| `isValidatorResult` | function | Recognize success plus data/error validator results |

## Notes

- **Validation is silent.** A validator must return `true` or `{ success: true, data }` to store a value. Other results and thrown errors leave the prior value unchanged. Validators run on `set`, not on initial data, defaults or getter results.
- **Transformation is explicit.** `setRaw` uses a transformer before `set`; with no transformer it does nothing. `set` does not transform input.
- **Reads are live.** Getters run on access and are not cached. A present data property wins even when its value is `undefined`.
- **Nested reset is limited.** Top-level `reset` removes stored data to expose a fallback. The current nested-path removal helper does not delete nested properties; do not rely on dotted `reset` or `resetDefault` to remove them.
- **Public entrypoint.** Import from `continu`. The internal `createProxy` implementation is not exported from the package root.

## Contributing

Read the [contribution guidelines](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md).

## License

Made with 💚

Published under the [MIT License](LICENSE).
