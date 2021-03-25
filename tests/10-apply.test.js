const postcss = require('postcss')
const tailwind = require('../src/index.js')
const fs = require('fs')
const path = require('path')

function run(input, config = {}) {
  return postcss([tailwind(config)]).process(input, { from: path.resolve(__filename) })
}

test('@apply', () => {
  let config = {
    darkMode: 'class',
    purge: [path.resolve(__dirname, './10-apply.test.html')],
    corePlugins: { preflight: false },
    theme: {},
    plugins: [],
  }

  let css = `
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer components {
    .basic-example {
      @apply px-4 py-2 bg-blue-500 rounded-md;
    }
    .class-order {
      @apply pt-4 pr-1 px-3 py-7 p-8;
    }
    .with-additional-properties {
      font-weight: 500;
      @apply text-right;
    }
    .variants {
      @apply xl:focus:font-black hover:font-bold lg:font-light focus:font-medium font-semibold;
    }
    .only-variants {
      @apply xl:focus:font-black hover:font-bold lg:font-light focus:font-medium;
    }
    .apply-group-variant {
      @apply group-hover:text-center lg:group-hover:text-left;
    }
    .apply-dark-variant {
      @apply dark:text-center dark:hover:text-right lg:dark:text-left;
    }
    .apply-custom-utility {
      @apply custom-util hover:custom-util lg:custom-util xl:focus:custom-util;
    }
    .multiple, .selectors {
      @apply px-4 py-2 bg-blue-500 rounded-md;
    }
    .multiple-variants, .selectors-variants {
      @apply hover:text-center active:text-right lg:focus:text-left;
    }
    .multiple-group, .selectors-group {
      @apply group-hover:text-center lg:group-hover:text-left;
    }
    /* TODO: This works but the generated CSS is unnecessarily verbose. */
    .complex-utilities {
      @apply ordinal tabular-nums focus:diagonal-fractions shadow-lg hover:shadow-xl;
    }
    .basic-nesting-parent {
      .basic-nesting-child {
        @apply font-bold hover:font-normal;
      }
    }
    .use-base-only-a {
      @apply font-bold;
    }
    .use-base-only-b {
      @apply use-base-only-a font-normal;
    }
    .use-dependant-only-a {
      @apply font-bold;
    }
    .use-dependant-only-b {
      @apply use-dependant-only-a font-normal;
    }
    .btn {
      @apply font-bold py-2 px-4 rounded;
    }
    .btn-blue {
      @apply btn bg-blue-500 hover:bg-blue-700 text-white;
    }
    .recursive-apply-a {
      @apply font-black sm:font-thin;
    }
    .recursive-apply-b {
      @apply recursive-apply-a font-semibold md:font-extralight;
    }
    .recursive-apply-c {
      @apply recursive-apply-b font-bold lg:font-light;
    }
    .use-with-other-properties-base {
      color: green;
      @apply font-bold;
    }
    .use-with-other-properties-component {
      @apply use-with-other-properties-base;
    }
    .add-sibling-properties {
      padding: 2rem;
      @apply px-4 hover:px-2 lg:px-10 xl:focus:px-1;
      padding-top: 3px;
      @apply use-with-other-properties-base;
    }

    h1 {
      @apply text-2xl lg:text-2xl sm:text-3xl;
    }
    h2 {
      @apply text-2xl;
      @apply lg:text-2xl;
      @apply sm:text-2xl;
    }
  }

  @layer utilities {
    .custom-util {
      custom: stuff;
    }

    .foo {
      @apply animate-spin;
    }

    .bar {
      @apply animate-pulse !important;
    }
  }
`

  return run(css, config).then((result) => {
    let expectedPath = path.resolve(__dirname, './10-apply.test.css')
    let expected = fs.readFileSync(expectedPath, 'utf8')

    expect(result.css).toMatchCss(expected)
  })
})

// TODO: Test stuff that should throw
