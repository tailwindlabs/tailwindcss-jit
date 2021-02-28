const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'divide-x': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('divideWidth')
        let value = transformValue(theme.divideWidth[modifier])

        if (value === undefined) {
          return []
        }

        return [
          [
            `${nameClass('divide-x', modifier)} > :not([hidden]) ~ :not([hidden])`,
            {
              '--tw-divide-x-reverse': '0',
              'border-right-width': `calc(${value} * var(--tw-divide-x-reverse))`,
              'border-left-width': `calc(${value} * calc(1 - var(--tw-divide-x-reverse)))`,
            },
          ],
        ]
      },
    ],
    'divide-y': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('divideWidth')
        let value = transformValue(theme.divideWidth[modifier])

        if (value === undefined) {
          return []
        }

        return [
          [
            `${nameClass('divide-y', modifier)} > :not([hidden]) ~ :not([hidden])`,
            {
              '--tw-divide-y-reverse': '0',
              'border-top-width': `calc(${value} * calc(1 - var(--tw-divide-y-reverse)))`,
              'border-bottom-width': `calc(${value} * var(--tw-divide-y-reverse))`,
            },
          ],
        ]
      },
    ],
  })

  addUtilities({
    'divide-y-reverse': [
      [
        '.divide-y-reverse > :not([hidden]) ~ :not([hidden])',
        {
          '--tw-divide-y-reverse': '1',
        },
      ],
    ],
    'divide-x-reverse': [
      [
        '.divide-x-reverse > :not([hidden]) ~ :not([hidden])',
        {
          '--tw-divide-x-reverse': '1',
        },
      ],
    ],
  })
}
