const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

let transformValue = transformThemeValue('boxShadow')
let shadowReset = {
  '*': {
    '--tw-shadow': '0 0 #0000',
  },
}

module.exports = function ({ matchUtilities, jit: { theme } }) {
  matchUtilities({
    shadow: (modifier, { theme }) => {
      modifier = modifier === '' ? 'DEFAULT' : modifier

      let value = transformValue(theme.boxShadow[modifier])

      if (modifier === '' || value === undefined) {
        return []
      }

      return [
        [shadowReset, { respectVariants: false }],
        {
          [nameClass('shadow', modifier)]: {
            '--tw-shadow': value === 'none' ? '0 0 #0000' : value,
            'box-shadow': [
              `var(--tw-ring-offset-shadow, 0 0 #0000)`,
              `var(--tw-ring-shadow, 0 0 #0000)`,
              `var(--tw-shadow)`,
            ].join(', '),
          },
        },
      ]
    },
  })
}
