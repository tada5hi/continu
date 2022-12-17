# Optin 🐦

[![npm version](https://badge.fury.io/js/optin.svg)](https://badge.fury.io/js/optin)
[![main](https://github.com/tada5hi/optin/actions/workflows/main.yml/badge.svg)](https://github.com/tada5hi/optin/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/tada5hi/optin/branch/master/graph/badge.svg?token=L65RSE7BT1)](https://codecov.io/gh/tada5hi/optin)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/optin/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Tada5hi/optin?targetFile=package.json)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

**Optin** is a zero dependency container library.
It supports transformation & validation before setting any value.

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
  - [Basic](#basic)
  - [Transformation](#transformation)
  - [Validation](#validation)
  - [Nesting](#nesting)
- [License](#license)

## Installation

```bash
npm install optin --save
```

## Usage

### Basic

On the basic level, this library can be used to `set` or `get` any value by key.
The `has` method can be used, to verify if a value is set.

```typescript
import { Optin } from 'optin';

type Options = {
    foo: string
}

const config = new Optin<Options>();

console.log(config.has('foo'));
// false
console.log(config.get('foo'));
// undefined

config.set('foo', 'bar');

console.log(config.has('foo'));
// true
console.log(config.get('foo'));
// bar

config.reset('foo');

console.log(config.has('foo'));
// false
```

### Transformation

Transformers can be used to accept multiple input formats.
The data can than be converted to the appropriate format before setting.
Therefore, the `setRaw` method must be used.

```typescript
import { Optin } from 'optin';

type Options = {
    foo: string
}

const config = new Optin<Options>({
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

config.set('foo', '123');

console.log(config.get('foo'));
// '123'

config.set('foo', 456);

console.log(config.get('foo'));
// '456'

config.set('foo', {bar: 'baz'});
// this statement will throw an error!
```

### Validation

Validators can be useful for defining constraints and prevent values from being set,
if they don't match specific criteria.

```typescript
import { Optin } from 'optin';

type Options = {
    foo: string
}

const config = new Optin<Options>({
    validators: {
        foo: (value) => typeof value === 'string' && value.length > 3,
    }
});

config.set('foo', 'bar');

console.log(config.get('foo'));
// undefined

config.set('foo', 'bar-baz');

console.log(config.get('foo'));
// 'bar-baz'

```

### Nesting

When using nested object types, it is also possible to use key paths (separated by `.`) to
access properties in depth.

```typescript
import { Optin } from 'optin';

type Options = {
    nested: {
        foo: string
    }
}

const config = new Optin<Options>();

console.log(config.has('nested.foo'));
// false
console.log(config.get('nested.foo'));
// undefined

config.set('nested.foo', 'bar');

console.log(config.has('nested.foo'));
// true
console.log(config.get('nested.foo'));
// 'bar'

console.log(config.has('nested'));
// true;
console.log(config.get('nested'));
// { foo: 'bar' }
```

## License

Made with 💚

Published under [MIT License](./LICENSE).
