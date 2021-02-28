# @tailwindcss/jit

An experimental library that generates CSS with the same API you already know from Tailwind CSS, but on-demand as you author your template files instead of generating an extremely large stylesheet once when you start your build system.

This has the following advantages:

- No long initial build time (Tailwind can take 3–8s to compile in isolation, and upwards of 30–45s in webpack projects)
- No need to purge unused styles, since styles are generated as they are needed
- Your CSS is identical in development and production, so there's no chance of accidentally purging a style you needed to keep
- No need to explicitly enable variants, everything works out of the box since file-size isn't a limiting factor
- No dev tools performance issues that stem from parsing large stylesheets

---

#### Current limitations:

These are all things we're actively working on, but aren't ready yet in this current pre-alpha release.

- Custom CSS is not processed, can't use `@apply`, `@layer`, `@screen`, etc.
- User plugins are not supported
- Can't use complex media queries  (only basic min-width is supported)
- Container is very naive, doesn't support complex options Tailwind normally supports
- No prefix support
- No !important support
- No custom separator support

---

#### To Dos

- [x] Get our data structure rendering to CSS, perhaps rework data structure if needed
- [x] Solve for a candidate that has multiple rules with different order numbers
- [x] Make tabular nums work with media queries
- [x] Avoid redundant generation of rules used by multiple candidates
- [x] Avoid redundant generation of rules used by multiple candidates in variants
- [x] Generate a hover variant
- [x] Make a hover variant stack with a screen variant
- [x] Generate focus variant
- [x] Make a hover variant stack with a focus variant
- [x] Get a resolved config object we can use to read values from
- [x] Move variants and plugins to their own modules
- [x] Generate all screens based on config object
- [x] Make a dynamic plugin read from the config
- [x] Put utilities in right place (@tailwind utilities)
- [x] Add Preflight styles
- [x] ~~Figure out a more user-friendly API for specifying variant precedence~~ Just works baby.
- [x] Cache PostCSS nodes instead of our data structure? Lots of wasted time re-parsing styles we've already parsed
- [x] Cache all generated styles each build, only inserting generated styles for changed files and re-sorting/CSSifying then
- [x] Make sure variants are applied to all classes in a selector, not just first
- [x] ~~Enforce variants order (no hover:sm:underline)? Or just make it work~~ This just works, builds are faster if you use a consistent order though because it's a cache hit
- [x] Add tests for the love of god
- [x] Resolve config at run-time, re-resolve when config changes
- [x] Read template files from purge config, not from files config
- [x] Add support for `theme` function
- [x] Make animation utilities work
- [x] Make components/container generally work
--- Feb 25
- [x] Make the group-* features work
- [x] Add dark mode support
- [x] Put components, static utilities, and utilities into a single map for faster lookups
- [x] Sort responsive components before responsive utilities (need to reserve a bit for layer?)
--- Feb 26
- [x] Look for more specific matches, only run those matches (ring-offset shouldn't also run ring matches)
- [x] Refactor pass in modifier as string instead of parts array
- [x] Refactor plugins to use more specific keys
- [x] Support negative values, we don't see these utilities at all because of the `-` prefix, we also split on `-` so the prefix doesn't make it to the plugin
- [x] Avoid re-resolving config if build was triggered by template change
- [x] Use single addUtilities API for both static and dynamic plugins
- [x] Test with Vue components and <style> blocks (tons of watchers?)
- [x] Figure out how to support multiple PostCSS builds (this is extremely common, every Vue style block, every CSS module, etc. Need to be careful about global state)
- [x] Support multiple config formats but probably less than before
- [x] Figure out how to close Chokidar watchers whenever we generate a new context, I think we are leaking them
- [x] Flatten color palette once for performance
--- Feb 27
- [x] Simplify all of the concurrency code, model it more correctly
- [x] Avoid memory leak in contentMatchCache (every time a file is saved with different content this cache grows)
- [x] Figure out when to clear caches
- [x] Test with Laravel mix


- [ ] Add support for plugin API
- [ ] Make existing official plugins work
- [ ] Rebuild when config dependencies change
- [ ] Support container configuration options
- [ ] Support complex screens configuration
- [ ] Make prefixes work
- [ ] Make important work
- [ ] Make separator work
- [ ] Make @apply work
- [ ] Add support for custom CSS that supports variants (anything in @layer?)

- [ ] Support square brackets for arbitrary values
- [ ] Support purge safelist (just add entries to candidate list, regexes will be harder though)
- [ ] Incorporate 'transformThemeValue' properly (mostly important for `theme` function which already works, but also need it to support array syntax for things like box shadow in someone's config)
- [ ] Support "dynamic" components

- [ ] Refactor plugins to an abstraction that handles negative values, transformThemeValue, etc.
- [ ] Factor the code in a responsible way
- [ ] Put plugins in deliberate order
- [ ] Include vendor prefixes for modern browsers by default so autoprefixer is only needed in production?
- [ ] Cache Preflight styles? They only change when the config changes (default font family, border color, etc.)
- [ ] Collapse media queries
- [ ] Cache entire PostCSS tree and re-use if no candidate cache misses
- [ ] Move code to a feature flag in Tailwind, hopefully without introducing additional performance costs