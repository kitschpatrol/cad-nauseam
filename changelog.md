# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Documentation

- Add development and deployment instructions covering setup, build/test/lint commands, HTTP previews, and Wrangler authentication.

### Maintenance

- Refresh development dependencies, including TypeScript 6, Vitest 5, happy-dom 21 and shared-config 8; upgrade to pnpm 12 and remove explicit native build dependencies.
- Set the development Node.js requirement to `^24.16.0 || >=26.3.0`.
- Migrate site builds and HTTP development/previews to the Cloudflare Vite plugin, separate library/test configurations, build before previewing, and validate deployment with CI dry runs.
- Add scheduled repository and website link checks and monthly dependency-update pull requests.
- Update and SHA-pin GitHub Actions, restrict release triggers to three-part version tags, and verify tagged commits belong to the repository’s default branch.
- Configure pnpm-managed shared-config skills for contributor setup.
- Rename the repository cleanup command to `clean-deep` and remove its `.claude` exclusion.
- Archive an additional snapshot of the legacy site with separate JavaScript and CSS assets.

## [1.0.3] - 2026-05-17

### Documentation

- Update the README’s MIT license link.

### Maintenance

- Refresh Lit, development tooling, and CI actions; add native build dependencies and adopt pnpm 11 with updated dependency build approvals.

## [1.0.2] - 2026-04-23

### Fixed

- Correct Safari page scrolling and keep wide ASCII output centered, suppressing horizontal overflow and adding spacing above the first row.

### Maintenance

- Fix Windows declaration builds by resolving the TypeScript compiler and invoking it through Node.js.
- Update Vite and pnpm development tooling.

## [1.0.1] - 2026-04-22

### Fixed

- Correct the browser page title to “CAd nauseam.”

### Documentation

- Correct the README overview wording and live-demo sentence.

## [1.0.0] - 2026-04-22

### Added

- Introduce a browser-based simulator for all 256 elementary cellular automata, rendering generations as copyable ASCII text.
- Provide numeric rule selection, eight visual rule switches, Stop/Go controls, reseeding from a single center cell, and WolframAlpha rule-information links.
- Provide an ES module exporting `CadNauseam`, automatically registering `<cad-nauseam>`, and supplying TypeScript declarations with Lit 3 as a peer dependency.
- Expose configurable rule, column count, tick interval, running state, and row-history limits, with unlimited history by default.
- Support automatic scrolling within the component with sticky controls or full-page scrolling with fixed controls.
- Optionally synchronize the active rule with the URL hash, restoring linked rules on load and following hash changes.
- Emit bubbling, composed `cad-rule-change` and `cad-running-change` events carrying the current rule or running state.
- Expose CSS custom properties and shadow parts for customizing colors, typography, borders, controls, and grid styling.

### Documentation

- Document the modern port and live site, and preserve the original 2010 MooTools implementation and screenshots for historical reference.

### Maintenance

- Set up library/site builds, declaration generation, component tests, linting, cross-platform CI, and Cloudflare deployment with version metadata.

[Unreleased]: https://github.com/kitschpatrol/cad-nauseam/compare/v1.0.3...HEAD
[1.0.0]: https://github.com/kitschpatrol/cad-nauseam/releases/tag/v1.0.0
[1.0.1]: https://github.com/kitschpatrol/cad-nauseam/compare/v1.0.0...v1.0.1
[1.0.2]: https://github.com/kitschpatrol/cad-nauseam/compare/v1.0.1...v1.0.2
[1.0.3]: https://github.com/kitschpatrol/cad-nauseam/compare/v1.0.2...v1.0.3
