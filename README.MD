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
