# Optin 🐦

[![npm version](https://badge.fury.io/js/optin.svg)](https://badge.fury.io/js/optin)
[![main](https://github.com/tada5hi/optin/actions/workflows/main.yml/badge.svg)](https://github.com/tada5hi/optin/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/tada5hi/optin/branch/master/graph/badge.svg?token=0VL41WO0CG)](https://codecov.io/gh/tada5hi/optin)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/optin/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Tada5hi/optin?targetFile=package.json)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

**Optin** is a zero dependency options container library.
It supports transformation & validation before setting an option.

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Installation

```bash
npm install optin --save
```

---
**Important NOTE**

The `README.md` file is under construction ☂ at the moment.
So please stay patient or contribute to it, till it covers all parts ⭐.

---

## Usage

```typescript
import { Opticon } from "optin";

type Options = {
    foo: string,
    bar: number
}

const config = new Opticon<Options>({
    defaults: {
        foo: 'baz'
    }
});

console.log(config.get('foo'));
// baz

console.log(config.get('bar'));
// undefined
```

## License

Made with 💚

Published under [MIT License](./LICENSE).
