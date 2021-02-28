const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    border: [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderWidth')
        let value = transformValue(theme.borderWidth[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('border', modifier), { 'border-width': value }]]
      },
    ],
  })
  addUtilities({
    'border-t': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderWidth')
        let value = transformValue(theme.borderWidth[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('border-t', modifier), { 'border-top-width': value }]]
      },
    ],
    'border-r': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderWidth')
        let value = transformValue(theme.borderWidth[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('border-r', modifier), { 'border-right-width': value }]]
      },
    ],
    'border-b': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderWidth')
        let value = transformValue(theme.borderWidth[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('border-b', modifier), { 'border-bottom-width': value }]]
      },
    ],
    'border-l': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderWidth')
        let value = transformValue(theme.borderWidth[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('border-l', modifier), { 'border-left-width': value }]]
      },
    ],
  })
}
