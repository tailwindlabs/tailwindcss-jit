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
  }

  @layer utilities {
    .custom-util {
      custom: stuff;
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
