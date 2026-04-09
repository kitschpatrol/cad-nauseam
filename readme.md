<!-- title -->

# cad-nauseam

<!-- /title -->

<!-- badges -->

[![NPM Package cad-nauseam](https://img.shields.io/npm/v/cad-nauseam.svg)](https://npmjs.com/package/cad-nauseam)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/kitschpatrol/cad-nauseam/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/cad-nauseam/actions/workflows/ci.yml)

<!-- /badges -->

<!-- short-description -->

**A web-based implementation of Wolfram's one-dimensional cellular automata.**

<!-- /short-description -->

## Overview

A single `<cad-nauseam>` Lit web component, published as an ESM-only NPM package.

## Usage

Install alongside `lit` (which is declared as a peer dependency):

```sh
pnpm add cad-nauseam lit
```

Then import the component — importing the module self-registers the custom element:

```ts
import 'cad-nauseam'
```

```html
<cad-nauseam rule="30"></cad-nauseam>
```

You can also import the class directly for subclassing or programmatic use:

```ts
import { CadNauseam } from 'cad-nauseam'
```

<!-- license -->

## License

[MIT](license.txt) © Eric Mika

<!-- /license -->
