## [1.3.2](https://github.com/Tada5hi/continu/compare/v1.3.1...v1.3.2) (2023-06-29)


### Bug Fixes

* minor changes to pub release ([0984287](https://github.com/Tada5hi/continu/commit/098428747fa4a975b835cd5279b8e2b9f1a5b6e7))

# [1.2.0](https://github.com/Tada5hi/continu/compare/v1.1.0...v1.2.0) (2023-03-30)


## [2.0.0](https://github.com/tada5hi/continu/compare/v1.3.2...v2.0.0) (2026-11-06)


### ⚠ BREAKING CHANGES

* The promoted API replaces the published Continu export with Container and constructor options with data, and removes reset() without a key and bulk setRaw(record). Record this existing API break for release-please before generating the next release from the unchanged 1.3.2 baseline.
* public api changed

### Features

* refactored public api ([a914623](https://github.com/tada5hi/continu/commit/a91462342adb4fdf90f0bcb2e3b5aaf4f44db8e1))
* refactoring public api ([bf38088](https://github.com/tada5hi/continu/commit/bf38088268fa7c8ade445a171de32c0d368fb51c))


### Bug Fixes

* correct optional paths and getter context after promotion ([0396245](https://github.com/tada5hi/continu/commit/03962452690167c6311432cb6d9b321e73653d3d))
* ignore inherited getter registry properties ([388f066](https://github.com/tada5hi/continu/commit/388f066bc9c3ab8730689214aa70b00d97c47d13))

## v1.3.1

[compare changes](https://github.com/Tada5hi/continu/compare/v1.3.0...v1.3.1)


### 🩹 Fixes

  - **deps:** Set changelogen as dev-dependency ([65530f4](https://github.com/Tada5hi/continu/commit/65530f4))

### ❤️  Contributors

- Tada5hi <peter.placzek1996@gmail.com>

## v1.3.0

[compare changes](https://github.com/Tada5hi/continu/compare/v1.2.0...v1.3.0)


### 🚀 Enhancements

  - Nested access on dynamic getter + enhance object pÃath access ([d828fd5](https://github.com/Tada5hi/continu/commit/d828fd5))

### 🩹 Fixes

  - Context type of dynamic getter evaluation ([7aec4eb](https://github.com/Tada5hi/continu/commit/7aec4eb))

### 📖 Documentation

  - Add README.md section for dynamic getters ([49905a8](https://github.com/Tada5hi/continu/commit/49905a8))
  - Fix typeo in console.log ([4c27268](https://github.com/Tada5hi/continu/commit/4c27268))

### 📦 Build

  - **deps-dev:** Bump @swc/core from 1.3.42 to 1.3.44 ([#68](https://github.com/Tada5hi/continu/pull/68))
  - **deps-dev:** Bump typescript from 5.0.2 to 5.0.4 ([#74](https://github.com/Tada5hi/continu/pull/74))
  - **deps-dev:** Bump @rollup/plugin-node-resolve from 15.0.1 to 15.0.2 ([#73](https://github.com/Tada5hi/continu/pull/73))
  - **deps-dev:** Bump @swc/core from 1.3.44 to 1.3.46 ([#72](https://github.com/Tada5hi/continu/pull/72))
  - Replaced semantic release with changelogen ([4ee61a1](https://github.com/Tada5hi/continu/commit/4ee61a1))

### ❤️  Contributors

- Tada5hi <peter.placzek1996@gmail.com>

### Features

* dynamic option getters ([6e4709b](https://github.com/Tada5hi/continu/commit/6e4709bfaa45b753bc2669ae69fb0ae4cb031a59))

# [1.1.0](https://github.com/Tada5hi/continu/compare/v1.0.5...v1.1.0) (2023-03-29)


### Features

* refactored build system + output exports ([7493a98](https://github.com/Tada5hi/continu/commit/7493a98bfd311477d003e3fa2c9c0ed20b2cda24))

## [1.0.5](https://github.com/Tada5hi/continu/compare/v1.0.4...v1.0.5) (2023-01-11)


### Bug Fixes

* **deps:** bump json5 from 1.0.1 to 1.0.2 ([5ad5f31](https://github.com/Tada5hi/continu/commit/5ad5f316d0f66c156d12a9fbb6f61466b6a0bf01))

## [1.0.4](https://github.com/Tada5hi/continu/compare/v1.0.3...v1.0.4) (2022-12-18)


### Bug Fixes

* spelling & dump version ([c8a452b](https://github.com/Tada5hi/continu/commit/c8a452be99a7d97f03c98cae837299878c7521ea))

## [1.0.3](https://github.com/Tada5hi/continu/compare/v1.0.2...v1.0.3) (2022-12-17)


### Bug Fixes

* types destination directory ([13e7379](https://github.com/Tada5hi/continu/commit/13e7379249fdb9aede4f11ce6f66abddefc5d17b))

## [1.0.2](https://github.com/Tada5hi/continu/compare/v1.0.1...v1.0.2) (2022-12-17)


### Bug Fixes

* validators and transformers type ([a0d6dd9](https://github.com/Tada5hi/continu/commit/a0d6dd993d8a77a81ccfbdb38c324fa088e5917d))

## [1.0.1](https://github.com/Tada5hi/continu/compare/v1.0.0...v1.0.1) (2022-12-17)


### Bug Fixes

* module export and fn/class naming ([ba2df34](https://github.com/Tada5hi/continu/commit/ba2df349603546cfba88ebd3974aa52ec84cc7b3))

# 1.0.0 (2022-12-17)


### Features

* add key path access for nested object types ([1e64930](https://github.com/Tada5hi/continu/commit/1e6493054001c6c6fec7e17ff0735edbffe402d0))
* force version dump ([805b0c6](https://github.com/Tada5hi/continu/commit/805b0c6b8a55dabd63f00e2020c8a39d4f3c4b0e))
