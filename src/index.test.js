const prettier = require('prettier')
const diff = require('jest-diff').default
const postcss = require('postcss')
const tailwind = require('./index.js')
const fs = require('fs')
const path = require('path')

function run(input, config = {}) {
  return postcss([tailwind(config)]).process(input, { from: undefined })
}

test('it works', () => {
  let config = {
    darkMode: 'class',
    purge: [path.resolve(__dirname, './index.test.html')],
    corePlugins: { preflight: false },
    theme: {
      extend: {
        screens: {
          portrait: { raw: '(orientation: portrait)' },
          range: { min: '1280px', max: '1535px' },
          multi: [{ min: '640px', max: '767px' }, { max: '868px' }],
        },
      },
    },
    plugins: [
      require('@tailwindcss/aspect-ratio'),
      function ({ addUtilities, addBase, theme }) {
        addBase({
          h1: {
            fontSize: theme('fontSize.2xl'),
            fontWeight: theme('fontWeight.bold'),
            '&:first-child': {
              marginTop: '0px',
            },
          },
        })
        addUtilities(
          {
            '.filter-none': {
              filter: 'none',
            },
            '.filter-grayscale': {
              filter: 'grayscale(100%)',
            },
          },
          ['responsive', 'hover']
        )
      },
    ],
  }

  return run(
    `
    @layer utilities {
      .custom-util {
        background: #abcdef;
      }
    }
    @layer components {
      .custom-component {
        background: #123456;
      }
    }
    @layer base {
      div {
        background: #654321;
      }
    }
    .theme-test {
      font-family: theme('fontFamily.sans');
      color: theme('colors.blue.500');
    }
    @screen lg {
      .screen-test {
        color: purple;
      }
    }
    .apply-test {
      @apply mt-6 bg-pink-500 hover:font-bold focus:hover:font-bold sm:bg-green-500 sm:focus:even:bg-pink-200;
    }
    .apply-components {
      @apply container mx-auto;
    }
    .drop-empty-rules {
      @apply hover:font-bold;
    }
    .apply-group {
      @apply group-hover:font-bold;
    }
    .apply-dark-mode {
      @apply dark:font-bold;
    }
    .apply-with-existing:hover {
      @apply font-normal sm:bg-green-500;
    }
    .multiple, .selectors {
      @apply font-bold group-hover:font-normal;
    }
    .list {
      @apply space-x-4;
    }
    .nested {
      .example {
        @apply font-bold hover:font-normal;
      }
    }
    .crazy-example {
      @apply sm:motion-safe:group-active:focus:opacity-10;
    }
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
  `,
    config
  ).then((result) => {
    let expectedPath = path.resolve(__dirname, './index.test.css')
    let expected = fs.readFileSync(expectedPath, 'utf8')

    expect(result.css).toMatchCss(expected)
  })
})

function format(input) {
  return prettier.format(input, {
    parser: 'css',
    printWidth: 100,
  })
}

expect.extend({
  // Compare two CSS strings with all whitespace removed
  // This is probably naive but it's fast and works well enough.
  toMatchCss(received, argument) {
    const options = {
      comment: 'stripped(received) === stripped(argument)',
      isNot: this.isNot,
      promise: this.promise,
    }

    let formattedReceived = format(received)
    let formattedArgument = format(argument)

    const pass = formattedReceived === formattedArgument

    const message = pass
      ? () => {
          return (
            this.utils.matcherHint('toMatchCss', undefined, undefined, options) +
            '\n\n' +
            `Expected: not ${this.utils.printExpected(formattedReceived)}\n` +
            `Received: ${this.utils.printReceived(formattedArgument)}`
          )
        }
      : () => {
          const actual = formattedReceived
          const expected = formattedArgument

          const diffString = diff(expected, actual, {
            expand: this.expand,
          })

          return (
            this.utils.matcherHint('toMatchCss', undefined, undefined, options) +
            '\n\n' +
            (diffString && diffString.includes('- Expect')
              ? `Difference:\n\n${diffString}`
              : `Expected: ${this.utils.printExpected(expected)}\n` +
                `Received: ${this.utils.printReceived(actual)}`)
          )
        }

    return { actual: received, message, pass }
  },
})
