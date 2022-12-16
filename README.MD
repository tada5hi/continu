# Opticon 🐦

[![npm version](https://badge.fury.io/js/opticon.svg)](https://badge.fury.io/js/opticon)
[![main](https://github.com/tada5hi/opticon/actions/workflows/main.yml/badge.svg)](https://github.com/tada5hi/opticon/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/tada5hi/opticon/branch/master/graph/badge.svg?token=0VL41WO0CG)](https://codecov.io/gh/tada5hi/opticon)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/opticon/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Tada5hi/opticon?targetFile=package.json)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

Zero dependency **opti**on **con**tainer library.

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Installation

```bash
npm install opticon --save
```

---
**Important NOTE**

The `README.md` file is under construction ☂ at the moment.
So please stay patient or contribute to it, till it covers all parts ⭐.

---

## Usage

```typescript
import { Opticon } from "opticon";

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
