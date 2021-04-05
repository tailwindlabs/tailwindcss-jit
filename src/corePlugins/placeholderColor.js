const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default
const withAlphaVariable = require('tailwindcss/lib/util/withAlphaVariable').default
const toColorValue = require('tailwindcss/lib/util/toColorValue').default
const { asColor, nameClass } = require('../pluginUtils')

module.exports = function ({ corePlugins, matchUtilities, jit: { theme } }) {
  let colorPalette = flattenColorPalette(theme.placeholderColor)

  matchUtilities({
    placeholder: (modifier, { theme }) => {
      let value = asColor(modifier, colorPalette)

      if (value === undefined) {
        return []
      }

      if (corePlugins('placeholderOpacity')) {
        return {
          [`${nameClass('placeholder', modifier)}::placeholder`]: withAlphaVariable({
            color: value,
            property: 'color',
            variable: '--tw-placeholder-opacity',
          }),
        }
      }

      return {
        [`${nameClass('placeholder', modifier)}::placeholder`]: { color: value },
      }
    },
  })
}
