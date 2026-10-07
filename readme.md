<!-- title -->

# cad-nauseam

<!-- /title -->

<!-- badges -->

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit)
[![CI](https://github.com/kitschpatrol/cad-nauseam/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/cad-nauseam/actions/workflows/ci.yml)

<!-- /badges -->

<!-- short-description -->

**Web-based implementation of Wolfram's one-dimensional cellular automata.**

<!-- /short-description -->

## Overview

This is a modern port of a 2010 project named CAd nauseam, which was an implementation of Wolfram's elementary one-dimensional cellular automata rendered purely as plain text in the web browser to allow for scroll-back exploration and cut / paste of patterns of interest.

You can play with the live version [here](https://frontiernerds.com/cad-nauseam), and read more about the original intent [on the Frontier Nerds blog](https://frontiernerds.com/ascii-ca).

The original JavaScript + [MooTools](https://mootools.net) version has been ported to a web component in [Lit](https://lit.dev) and vanilla TypeScript.

Functionally, it's identical to the original, it just runs slightly faster.

The original 2010 source code is preserved in this repository in the `/archive` folder.

## Development

```sh
pnpm install
pnpm dev
```

Open `http://localhost:5173/cad-nauseam`. Local development and previews use HTTP
without certificates.

| Command        | Purpose                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| `pnpm build`   | Build the library and declarations to `dist/`, and the site to `site/`.     |
| `pnpm preview` | Build and open a Cloudflare preview at `http://localhost:4173/cad-nauseam`. |
| `pnpm lint`    | Check types, code, formatting, and documentation.                           |
| `pnpm fix`     | Apply automatic fixes.                                                      |
| `pnpm test`    | Run component tests.                                                        |
| `pnpm release` | Bump the version, commit, tag, push, build, and deploy.                     |

[`vite.config.ts`](vite.config.ts) configures the site and Cloudflare. The build
writes `site/version.json` and generates Wrangler's deployment configuration for
<https://frontiernerds.com/cad-nauseam>. The library build is configured separately
in [`vite-library.config.ts`](vite-library.config.ts).
Authenticate before releasing with `pnpm exec wrangler login`.

<!-- license -->

## License

[MIT](license.txt) © [Eric Mika](https://ericmika.com)

<!-- /license -->
