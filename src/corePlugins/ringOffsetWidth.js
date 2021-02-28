const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'ring-offset': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('ringOffsetWidth')
        let value = transformValue(theme.ringOffsetWidth[modifier])

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
