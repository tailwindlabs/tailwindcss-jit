const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default
const withAlphaVariable = require('tailwindcss/lib/util/withAlphaVariable').default
const toColorValue = require('tailwindcss/lib/util/toColorValue').default
const { asColor, nameClass } = require('../pluginUtils')

module.exports = function ({ corePlugins, matchUtilities, jit: { theme } }) {
  let colorPalette = flattenColorPalette(theme.backgroundColor)

  matchUtilities({
    bg: (modifier, { theme }) => {
      let value = asColor(modifier, colorPalette)

      if (value === undefined) {
        return []
      }

      if (corePlugins('backgroundOpacity')) {
        return {
          [nameClass('bg', modifier)]: withAlphaVariable({
            color: value,
            property: 'background-color',
            variable: '--tw-bg-opacity',
          }),
        }
      }

      return { [nameClass('bg', modifier)]: { 'background-color': value } }
    },
  })
}
