# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Nothing yet!

## [0.1.18] - 2021-03-31

### Added

- Add support Svelte's `class:` syntax ([#183](https://github.com/tailwindlabs/tailwindcss-jit/issues/183))

## [0.1.17] - 2021-03-28

### Added

- Add support for prefix as a function ([#177](https://github.com/tailwindlabs/tailwindcss-jit/issues/177))

## [0.1.16] - 2021-03-28

### Added

- Add support for selectors in `important` option ([#175](https://github.com/tailwindlabs/tailwindcss-jit/issues/175))

## [0.1.15] - 2021-03-27

### Added

- Add `!font-bold`-style important modifier ([#174](https://github.com/tailwindlabs/tailwindcss-jit/issues/174))

## [0.1.14] - 2021-03-27

### Fixed

- Fix infinite recursion on `]-[]` candidate ([#172](https://github.com/tailwindlabs/tailwindcss-jit/issues/172), [5b366f2](https://github.com/tailwindlabs/tailwindcss-jit/commit/5b366f24bcebc741086c5184001e0f6323d80b68))

## [0.1.13] - 2021-03-27

### Fixed

- Fix infinite recursion issue with TypeScript syntax ([#167](https://github.com/tailwindlabs/tailwindcss-jit/pull/167))

## [0.1.12] - 2021-03-26

### Fixed

- Support custom modifiers with double dashes ([#164](https://github.com/tailwindlabs/tailwindcss-jit/pull/164))

## [0.1.11] - 2021-03-26

### Added

- Add explicit errors for unsupported `@apply` in nested CSS ([#161](https://github.com/tailwindlabs/tailwindcss-jit/pull/161))
- Add `TAILWIND_DISABLE_TOUCH` environment flag for using native bundler dependency tracking for template files (very experimental/unstable, only works in webpack 5) ([#162](https://github.com/tailwindlabs/tailwindcss-jit/pull/162))
- Add `TAILWIND_TOUCH_ROOT` environment variable for overriding default touch file location (advanced) ([#152](https://github.com/tailwindlabs/tailwindcss-jit/pull/152))

## [0.1.10] - 2021-03-25

### Fixed

- Fix divide-style not generating, and divide-width not handling '0' properly ([#157](https://github.com/tailwindlabs/tailwindcss-jit/pull/157))

## [0.1.9] - 2021-03-25

### Fixed

- Respect order of sibling declarations when mixing `@apply` with regular CSS properties ([#155](https://github.com/tailwindlabs/tailwindcss-jit/pull/155))

## [0.1.8] - 2021-03-24

### Added

- Direct support for @import 'tailwindcss/{layer}' syntax ([#145](https://github.com/tailwindlabs/tailwindcss-jit/pull/145))
- Support for custom extractors ([#125](https://github.com/tailwindlabs/tailwindcss-jit/pull/125))

### Fixed

- Fix `@apply` with animation utilities stripping keyframe names ([#150](https://github.com/tailwindlabs/tailwindcss-jit/pull/150))
- Fix using `@apply` multiple times within a single rule ([#151](https://github.com/tailwindlabs/tailwindcss-jit/pull/151))

## [0.1.7] - 2021-03-22

### Fixed

- Clone nodes to prevent bugs related to rule cache mutation ([#141](https://github.com/tailwindlabs/tailwindcss-jit/pull/141))


## [0.1.6] - 2021-03-22

### Fixed

- Add initial support for recursive `@apply` ([#136](https://github.com/tailwindlabs/tailwindcss-jit/pull/136))

## [0.1.5] - 2021-03-20

### Fixed

- Fix extending gradient colors directly ([#127](https://github.com/tailwindlabs/tailwindcss-jit/pull/127))

## [0.1.4] - 2021-03-19

### Added

- Support arbitrary values for `transition-duration` ([#99](https://github.com/tailwindlabs/tailwindcss-jit/pull/99))
- Support completely arbitrary values for `margin` ([#105](https://github.com/tailwindlabs/tailwindcss-jit/pull/105))
- Support CSS custom properties in arbitrary values ([d628fbc](https://github.com/tailwindlabs/tailwindcss-jit/commit/d628fbc3d393267ce3d1a1d11eed6c3025e6b8f0))
- Support completely arbitrary values for `inset` ([3ea5421](https://github.com/tailwindlabs/tailwindcss-jit/commit/3ea542170c8631afbfaf5ea341e9860178cf9843)
- Support completely arbitrary `width`/`height`/`min-width`/`max-width`/`min-height`/`max-height` ([76ba529](https://github.com/tailwindlabs/tailwindcss-jit/commit/76ba529d3b120481d153066d348b5dc316cc581f), [6e55976](https://github.com/tailwindlabs/tailwindcss-jit/commit/6e55976ed9c86cc749509c239c751af066d57152))

### Fixed

- Fix issues when project paths have spaces ([#106](https://github.com/tailwindlabs/tailwindcss-jit/pull/106))
- Fix negative classes when using a prefix ([#114](https://github.com/tailwindlabs/tailwindcss-jit/pull/114))
- Fix issues with Windows-style paths ([#118](https://github.com/tailwindlabs/tailwindcss-jit/pull/118))
- Ensure commas are escaped when applying variants ([#119](https://github.com/tailwindlabs/tailwindcss-jit/pull/119)

## [0.1.3] - 2021-03-17

### Fixed

- Escape commas in class names to workaround minifier bug ([#91](https://github.com/tailwindlabs/tailwindcss-jit/pull/91))

## [0.1.2] - 2021-03-17

### Fixed

- Don't apply !important to direct children of at-rules or in keyframes ([#69](https://github.com/tailwindlabs/tailwindcss-jit/pull/69))
- Fix handling of outline offsets ([#89](https://github.com/tailwindlabs/tailwindcss-jit/pull/89))

## [0.1.1] - 2021-03-15

### Fixed

- Don't collapse adjacent `@font-face` rules ([#30](https://github.com/tailwindlabs/tailwindcss-jit/pull/30))

## [0.1.0] - 2021-03-15

### Added

- Everything!

[unreleased]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.18...HEAD
[0.1.18]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.17...v0.1.18
[0.1.17]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.16...v0.1.17
[0.1.16]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.15...v0.1.16
[0.1.15]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.14...v0.1.15
[0.1.14]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.13...v0.1.14
[0.1.13]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.12...v0.1.13
[0.1.12]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.11...v0.1.12
[0.1.11]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/tailwindlabs/tailwindcss-jit/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/tailwindlabs/tailwindcss-jit/releases/tag/v0.1.0
