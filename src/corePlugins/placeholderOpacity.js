const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    'placeholder-opacity': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('placeholderOpacity')
        let value = transformValue(theme.placeholderOpacity[modifier])

        if (value === undefined) {
          return []
        }

        return [
          [
            `${nameClass('placeholder-opacity', modifier)}::placeholder`,
            { '--tw-placeholder-opacity': value },
          ],
        ]
      },
    ],
  })
}
