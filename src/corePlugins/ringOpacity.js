const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'ring-opacity': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('ringOpacity')
        let value = transformValue(theme.ringOpacity[modifier])

        if (value === undefined) {
          return []
        }

        return [
          [
            nameClass('ring-opacity', modifier),
            {
              '--tw-ring-opacity': value,
            },
          ],
        ]
      },
    ],
  })
}
