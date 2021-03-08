**Internal**. Please don't tweet about this project, write tutorials, create screencasts, etc. until we are ready to announce it ourselves. We've published it to make it easier to get feedback from a handful of bleeding-edge early adopters (including you if you found this and want to try it!) but really don't want the general public judging it until it's ready. Still missing lots of important features and there are lots of rough edges.

---

# @tailwindcss/jit

An experimental library that generates CSS with the same API you already know from Tailwind CSS, but on-demand as you author your template files instead of generating an extremely large stylesheet at initial build time.

This comes with a lot of advantages:

- **Lightning fast build times**. Tailwind can take 3–8s to initially compile using our CLI, and upwards of 30–45s in webpack projects because webpack struggles with large CSS files. This library can compile even the biggest projects in about 800ms, no matter what build tool you're using.
- **Every variant is enabled out of the box**. Variants like `focus-visible`, `active`, `disabled`, and others are not normally enabled by default due to file-size considerations. Since this library generates styles on demand, you can use any variant you want, whenever you want. You can even stack them like `sm:hover:active:disabled:opacity-75`. Never configure your variants again.
- **Generate arbitrary styles without writing custom CSS.** Ever needed some ultra-specific value that wasn't part of your design system, like `top: -113px` for a quirky background image? Since styles are generated on demand, you can just generate a utility for this as needed using square bracket notation like `top-[-113px]`. Works with variants too, like `md:top-[-113px]`.
- **Your CSS is identical in development and production**. Since styles are generated as they are needed, you don't need to purge unused styles for production, which means you see the exact same CSS in all environments. Never worry about accidentally purging an important style in production again.
- **Better browser performance in development**. Since development builds are as small as production builds, the browser doesn't has to parse and manage multiple megabytes of CSS like it does with an ahead-of-time Tailwind build. This makes dev tools a lot more responsive.

---

## Getting started

> While this idea is still in the pre-release phase, we've published it under a separate package. Eventually, we'll merge it with `tailwindcss` and expose it as a configuration option.

Install `@tailwindcss/jit` from npm:

```sh
npm install -D @tailwindcss/jit postcss tailwindcss
```

> The existing `tailwindcss` library is needed as a peer-dependency for third-party Tailwind plugins to work.

Add `@tailwindcss/jit` to your PostCSS configuration instead of `tailwindcss`:

```diff
  // postcss.config.js
  module.exports = {
    plugins: {
-     tailwindcss: {},
+     '@tailwindcss/jit': {},
      autoprefxier: {},
    }
  }
```

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

> Make sure `NODE_ENV` is set to `development` if you are running a watcher, or Tailwind won't watch your template files for changes. Use `production` for one-off builds.
>
> If you want to control whether Tailwind watches files or not more explicitly, set the `TAILWIND_MODE` environment variable to either `watch` or `build`.

---

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

If this proves to be the best way to use Tailwind once it's been heavily tested by the community and we've worked out any kinks, we hope to make it the default mode for Tailwind CSS v3.0.

We'll always provide a `mode: 'aot'` option for people who want to generate the stylesheet in advance and purge later — we'll need that ourselves for our CDN builds.

---

## Known limitations

This library is very close to feature parity with `tailwindcss` currently and for most projects I bet you will find it works exactly as you'd expect.

There are a few items on our todo list still though that we are still implementing:

- The `prefix`, `important`, and `separator` options are not supported yet.
- Advanced PurgeCSS options like `safelist` aren't supported yet since we aren't actually using PurgeCSS. We'll add a way to safelist classes for sure though.
- Third party plugins that add variants using the `modifySelectors` API aren't supported yet. Plugins that add variants without that API do work though.
- You can only `@apply` classes that are part of core, generated by plugins, or defined within a `@layer` rule. You can't `@apply` arbitrary CSS classes that aren't defined within a `@layer` rule.
