# Continu 🌱

[![npm version](https://badge.fury.io/js/continu.svg)](https://badge.fury.io/js/continu)
[![main](https://github.com/tada5hi/continu/actions/workflows/main.yml/badge.svg)](https://github.com/tada5hi/continu/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/tada5hi/continu/branch/master/graph/badge.svg?token=L65RSE7BT1)](https://codecov.io/gh/tada5hi/continu)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/continu/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Tada5hi/continu?targetFile=package.json)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

**Continu** is a simple & lightweight container library for key value pairs.
Besides, defining default values it is also possible to execute transformations & validations before setting any value.

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
  - [Basic](#basic)
  - [Defaults](#defaults)
  - [Transformation](#transformation)
  - [Validation](#validation)
  - [Nesting](#nesting)
- [License](#license)

## Installation

```bash
npm install continu --save
```

## Usage

### Basic

On the basic level, this library can be used as container for arbitrary data.

```typescript
import { Continu } from 'continu';

type Options = {
    foo: string
}

const continu = new Continu<Options>();

console.log(continu.has('foo'));
// false
console.log(continu.get('foo'));
// undefined

continu.set('foo', 'bar');

console.log(continu.has('foo'));
// true
console.log(continu.get('foo'));
// bar

continu.reset('foo');

console.log(continu.has('foo'));
// false
```

### Defaults
It is also possible to define default values which are returned if a given value is not set.

```typescript
import { Continu } from 'continu';

type Options = {
    foo: string
}

const continu = new Continu<Options>({
    defaults: {
        foo: 'bar'
    }
});

console.log(continu.has('foo'));
// false
console.log(continu.get('foo'));
// 'bar'

continu.set('foo', 'baz');

console.log(continu.has('foo'));
// true
console.log(continu.get('foo'));
// 'baz'

```

### Transformation

Transformers can be used to accept multiple input formats.
The data can than be converted to the appropriate format before setting.
Therefore, the `setRaw` method must be used.

```typescript
import { Continu } from 'continu';

type Options = {
    foo: string
}

const continu = new Continu<Options>({
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

continu.set('foo', '123');

console.log(continu.get('foo'));
// '123'

continu.set('foo', 456);

console.log(continu.get('foo'));
// '456'

continu.set('foo', {bar: 'baz'});
// this statement will throw an error!
```

### Validation

Validators can be useful for defining constraints and prevent values from being set,
if they don't match specific criteria.

```typescript
import { Continu } from 'continu';

type Options = {
    foo: string
}

const continu = new Continu<Options>({
    validators: {
        foo: (value) => typeof value === 'string' && value.length > 3,
    }
});

continu.set('foo', 'bar');

console.log(continu.get('foo'));
// undefined

continu.set('foo', 'bar-baz');

console.log(continu.get('foo'));
// 'bar-baz'

```

### Nesting

When using nested object types, it is also possible to use key paths (separated by `.`) to
access properties in depth.

```typescript
import { Continu } from 'continu';

type Options = {
    nested: {
        foo: string
    }
}

const continu = new Continu<Options>();

console.log(continu.has('nested.foo'));
// false
console.log(continu.get('nested.foo'));
// undefined

continu.set('nested.foo', 'bar');

console.log(continu.has('nested.foo'));
// true
console.log(continu.get('nested.foo'));
// 'bar'

console.log(continu.has('nested'));
// true;
console.log(continu.get('nested'));
// { foo: 'bar' }
```

## License

Made with 💚

Published under [MIT License](./LICENSE).
