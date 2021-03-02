const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default
const withAlphaVariable = require('tailwindcss/lib/util/withAlphaVariable').default
const toColorValue = require('tailwindcss/lib/util/toColorValue').default
const { asColor } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  let colorPalette = flattenColorPalette(theme.ringOffsetColor)

  addUtilities({
    'ring-offset': [
      (modifier, { theme }) => {
        let value = asColor(modifier, colorPalette)

        if (value === undefined) {
          return []
        }

        return [
          [
            nameClass('ring-offset', modifier),
            {
              '--tw-ring-offset-color': toColorValue(value),
            },
          ],
        ]
      },
    ],
  })
}
