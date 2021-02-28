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

These are all things we're actively working on, but aren't ready yet in this current pre-alpha release. This is all stuff I expect will be ready by the end of next week :)

- Custom CSS is not processed, can't use `@apply`, `@layer`, `@screen`, etc.
- User plugins are not supported
- Can't use complex media queries (only basic min-width is supported)
- Container is very naive, doesn't support complex options Tailwind normally supports
- No prefix support
- No !important support
- No custom separator support
