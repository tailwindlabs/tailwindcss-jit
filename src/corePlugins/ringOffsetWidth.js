const nameClass = require('tailwindcss/lib/util/nameClass').default
const { asLength } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'ring-offset': [
      (modifier, { theme }) => {
        let value = asLength(modifier, theme['ringOffsetWidth'])

        if (value === undefined) {
          return []
        }

        return [
          [
            nameClass('ring-offset', modifier),
            {
              '--tw-ring-offset-width': value,
            },
          ],
        ]
      },
    ],
  })
}
