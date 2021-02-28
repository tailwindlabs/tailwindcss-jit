const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default
const withAlphaVariable = require('tailwindcss/lib/util/withAlphaVariable').default
const toColorValue = require('tailwindcss/lib/util/toColorValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  let colorPalette = flattenColorPalette(theme.borderColor)

  addUtilities({
    border: [
      (modifier, { theme }) => {
        if (modifier === 'DEFAULT' || colorPalette[modifier] === undefined) {
          return []
        }

        return [
          [
            nameClass('border', modifier),
            withAlphaVariable({
              color: colorPalette[modifier],
              property: 'border-color',
              variable: '--tw-border-opacity',
            }),
          ],
        ]
      },
    ],
  })
}
