
<p align="center">
    <img src="https://raw.githubusercontent.com/tailwindlabs/tailwindcss-jit/main/.github/logo.svg" alt="Tailwind CSS Just-In-Time">
</p>

<p align="center">
    <a href="https://github.com/tailwindlabs/tailwindcss-jit/releases"><img src="https://img.shields.io/npm/v/@tailwindcss/jit" alt="Latest Release"></a>
    <a href="https://github.com/tailwindlabs/tailwindcss-jit/actions/workflows/main.yml"><img src="https://github.com/tailwindlabs/tailwindcss-jit/actions/workflows/main.yml/badge.svg"></a>
    <a href="https://github.com/tailwindlabs/tailwindcss-jit/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@tailwindcss/jit.svg" alt="License"></a>
</p>

## Overview

**An experimental just-in-time compiler for Tailwind CSS** that generates your styles on-demand as you author your templates instead of generating everything in advance at initial build time.

This comes with a lot of advantages:

- **Lightning fast build times**. Tailwind can take 3–8s to initially compile using our CLI, and upwards of 30–45s in webpack projects because webpack struggles with large CSS files. This library can compile even the biggest projects in about 800ms _(with incremental rebuilds as fast as 3ms)_, no matter what build tool you're using.
- **Every variant is enabled out of the box**. Variants like `focus-visible`, `active`, `disabled`, and others are not normally enabled by default due to file-size considerations. Since this library generates styles on demand, you can use any variant you want, whenever you want. You can even stack them like `sm:hover:active:disabled:opacity-75`. Never configure your variants again.
- **Generate arbitrary styles without writing custom CSS.** Ever needed some ultra-specific value that wasn't part of your design system, like `top: -113px` for a quirky background image? Since styles are generated on demand, you can just generate a utility for this as needed using square bracket notation like `top-[-113px]`. Works with variants too, like `md:top-[-113px]`.
- **Your CSS is identical in development and production**. Since styles are generated as they are needed, you don't need to purge unused styles for production, which means you see the exact same CSS in all environments. Never worry about accidentally purging an important style in production again.
- **Better browser performance in development**. Since development builds are as small as production builds, the browser doesn't have to parse and manage multiple megabytes of pre-generated CSS. In projects with heavily extended configurations this makes dev tools a lot more responsive.

To see it in action, [watch our announcement video](https://www.youtube.com/watch?v=3O_3X7InOw8).

## Getting started

Install `@tailwindcss/jit` from npm:

```sh
npm install -D @tailwindcss/jit tailwindcss postcss
```

> The existing `tailwindcss` library is a peer-dependency of `@tailwindcss/jit`, and is also needed for compatibility with Tailwind plugins.

Add `@tailwindcss/jit` to your PostCSS configuration _(instead of `tailwindcss`)_:

```js
  // postcss.config.js
  module.exports = {
    plugins: {
      '@tailwindcss/jit': {},
      autoprefixer: {},
    }
  }
```

> If you are using autoprefixer, make sure you are on the latest version using `npm install -D autoprefixer@latest` — there's a bug in older versions that makes it incompatible with this library.

Configure the `purge` option in your `tailwind.config.js` file with all of your template paths:

```js
// tailwind.config.js
module.exports = {
  purge: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  theme: {
    // ...
  }
  // ...
}
```

Now start your dev server or build tool as you normally would and you're good to go.

> Make sure you set `NODE_ENV=development` if you are running a watcher, or Tailwind won't watch your template files for changes. Set `NODE_ENV=production` for one-off builds.
>
> If you want to control whether Tailwind watches files or not more explicitly, set `TAILWIND_MODE=watch` or `TAILWIND_MODE=build` to override the default `NODE_ENV`-based behavior.
>
> For example if you want to do one-off builds with `NODE_ENV=development`, explicitly set `TAILWIND_MODE=build` so that Tailwind knows you are just doing a one-off build and doesn't hang.

## Documentation

This library is simply a new internal engine for Tailwind CSS, so for a complete API reference [visit the official Tailwind CSS documentation](https://tailwindcss.com).

The on-demand nature of this new engine does afford some new features that weren't possible before, which you can learn about below.

### All variants are enabled out of the box

Since styles are generated on-demand, there's no need to configure which variants are available for each core plugin.

```html
<input class="disabled:opacity-75">
```

You can use variants like `focus-visible`, `active`, `disabled`, `even`, and more in combination with any utility, without making any changes to your `tailwind.config.js` file.

### Stackable variants

All variants can be combined together to easily target very specific situations without writing custom CSS.

```html
<button class="md:dark:disabled:focus:hover:bg-gray-400">
```

### Arbitrary value support

Many utilities support arbitrary values using a new square bracket notation to indicate that you're "breaking out" of your design system.

```html
<!-- Sizes and positioning -->
<img class="absolute w-[762px] h-[918px] top-[-325px] right-[62px] md:top-[-400px] md:right-[80px]" src="/crazy-background-image.png">

<!-- Colors -->
<button class="bg-[#1da1f1]">Share on Twitter</button>

<!-- Complex grids -->
<div class="grid-cols-[1fr,700px,2fr]">
  <!-- ... -->
</div>
```

This is very useful for building pixel-perfect designs where there are a few elements that need hyper-specific styles, like a carefully positioned background image on a marketing site.

We'll likely add some form of "strict mode" in the future for power-hungry team leads who don't trust their colleagues to use this feature responsibly.

### Built-in important modifier

You can make any utility important by adding a `!` character to the beginning:

```html
<p class="font-bold !font-medium">
  This will be medium even though bold comes later in the CSS.
</p>
```

The `!` always goes at the beginning of the utility name, after any variants, but before any prefix:

```diff
- !sm:hover:tw-font-bold
+ sm:hover:!tw-font-bold
```

This can be useful in rare situations where you need to increase specificity because you're at war with some styles you don't control.

## Known limitations

This library is very close to feature parity with `tailwindcss` currently and for most projects I bet you'll find it works exactly as you'd expect.

There are a few items still on our todo list though that we are actively working on:

- Advanced PurgeCSS options like `safelist` aren't supported yet since we aren't actually using PurgeCSS. We'll add a way to safelist classes for sure though. For now, a `safelist.txt` file somewhere in your project with all the classes you want to safelist will work fine.
- You can only `@apply` classes that are part of core, generated by plugins, or defined within a `@layer` rule. You can't `@apply` arbitrary CSS classes that aren't defined within a `@layer` rule.
- Currently the JIT project **only supports PostCSS 8**. We may do a compat build like we do for Tailwind, but it isn't a priority right now.

If you run into any other issues or find any bugs, please [open an issue](https://github.com/tailwindlabs/tailwindcss-jit/issues/new) so we can fix it.

## Roadmap

Eventually we plan to merge this project with `tailwindcss` and expose it via an option in your `tailwind.config.js` file, something like this:

```js
// tailwind.config.js
module.exports = {
  mode: 'jit',
  purge: [
    // ...
  ],
  theme: {
    // ...
  }
  // ...
}
```

Once it's been heavily tested by the community and we've worked out any kinks, we hope to make it the default mode for Tailwind CSS v3.0 later this year.

We'll always provide a `mode: 'aot'` option for people who want to generate the stylesheet in advance and purge later — we'll need that ourselves for our CDN builds.

## License

This library is MIT licensed.
