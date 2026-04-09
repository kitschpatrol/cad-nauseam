<!-- title -->

# demo-component

<!-- /title -->

<!-- badges -->

[![NPM Package demo-component](https://img.shields.io/npm/v/demo-component.svg)](https://npmjs.com/package/demo-component)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/kitschpatrol/demo-component/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/demo-component/actions/workflows/ci.yml)

<!-- /badges -->

<!-- short-description -->

**A Lit web component.**

<!-- /short-description -->

## Overview

A single `<demo-component>` Lit web component, published as an ESM-only NPM package.

## Usage

Install alongside `lit` (which is declared as a peer dependency):

```sh
pnpm add demo-component lit
```

Then import the component — importing the module self-registers the custom element:

```ts
import 'demo-component'
```

```html
<demo-component label="Hello CAD">
  <p>Slotted content here.</p>
</demo-component>
```

You can also import the class directly for subclassing or programmatic use:

```ts
import { DemoComponent } from 'demo-component'
```

## Development

```sh
pnpm install
pnpm dev   # dev playground with HMR
pnpm test  # run tests
pnpm build # build library + type declarations to dist/
```

## Maintainers

_List maintainer(s) for a repository, along with one way of contacting them (e.g. GitHub link or email)._

## Acknowledgments

_State anyone or anything that significantly helped with the development of your project. State public contact hyper-links if applicable._

<!-- contributing -->

## Contributing

[Issues](https://github.com/kitschpatrol/demo-component/issues) and pull requests are welcome.

<!-- /contributing -->

<!-- license -->

## License

[MIT](license.txt) © Eric Mika

<!-- /license -->
