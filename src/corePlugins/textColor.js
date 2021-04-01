const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default
const withAlphaVariable = require('tailwindcss/lib/util/withAlphaVariable').default
const toColorValue = require('tailwindcss/lib/util/toColorValue').default
const { asColor, nameClass } = require('../pluginUtils')

module.exports = function ({ corePlugins, matchUtilities, jit: { theme } }) {
  let colorPalette = flattenColorPalette(theme.textColor)

  matchUtilities({
    text: (modifier, { theme }) => {
      let value = asColor(modifier, colorPalette)

      if (value === undefined) {
        return []
      }

      if (corePlugins('textOpacity')) {
        return {
          [nameClass('text', modifier)]: withAlphaVariable({
            color: value,
            property: 'color',
            variable: '--tw-text-opacity',
          }),
        }
      }

      return {
        [nameClass('text', modifier)]: { color: value },
      }
    },
  })
}
