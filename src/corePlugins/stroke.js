const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default
const withAlphaVariable = require('tailwindcss/lib/util/withAlphaVariable').default
const toColorValue = require('tailwindcss/lib/util/toColorValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  let colorPalette = flattenColorPalette(theme.stroke)

  addUtilities({
    stroke: [
      (modifier, { theme }) => {
        if (modifier === '' || colorPalette[modifier] === undefined) {
          return []
        }

        return [[nameClass('stroke', modifier), { stroke: toColorValue(colorPalette[modifier]) }]]
      },
    ],
  })
}
