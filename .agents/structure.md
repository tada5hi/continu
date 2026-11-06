# Project Structure

| Source | Responsibility |
|---|---|
| `src/module.ts` | Container behavior |
| `src/create.ts and src/define.ts` | Container construction and declarations |
| `src/getter and src/proxy.ts` | Getter/proxy access |
| `src/utils` | Shared container helpers |
| `src/index.ts` | Public package exports |
| `tsdown.config.mts` | JavaScript build configuration |

The package exposes CommonJS, ESM and TypeScript declarations through `package.json`. Preserve the declared `dist/` paths and any public deep type imports. `types.ts` owns shared type declarations; compatibility facades retain public import paths.

The build runs tsdown and refreshes declarations through `build:types` after successful JavaScript builds. Generated `dist/` files are build artifacts.
