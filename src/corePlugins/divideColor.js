const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default
const withAlphaVariable = require('tailwindcss/lib/util/withAlphaVariable').default
const toColorValue = require('tailwindcss/lib/util/toColorValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  let colorPalette = flattenColorPalette(theme.divideColor)

  // TODO: Make sure there is no issue with DEFAULT here
  addUtilities({
    divide: [
      (modifier, { theme }) => {
        if (modifier === '' || colorPalette[modifier] === undefined) {
          return []
        }

        return [
          [
            `${nameClass('divide', modifier)} > :not([hidden]) ~ :not([hidden])`,
            withAlphaVariable({
              color: colorPalette[modifier],
              property: 'border-color',
              variable: '--tw-divide-opacity',
            }),
          ],
        ]
      },
    ],
  })
}
