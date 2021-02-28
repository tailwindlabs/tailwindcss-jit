const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    p: [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('padding')
        let value = transformValue(theme.padding[modifier])
        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('p', modifier), { padding: value }]]
      },
    ],
  })
  addUtilities({
    px: [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('padding')
        let value = transformValue(theme.padding[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('px', modifier), { 'padding-left': value, 'padding-right': value }]]
      },
    ],
    py: [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('padding')
        let value = transformValue(theme.padding[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('py', modifier), { 'padding-top': value, 'padding-bottom': value }]]
      },
    ],
  })
  addUtilities({
    pt: [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('padding')
        let value = transformValue(theme.padding[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('pt', modifier), { 'padding-top': value }]]
      },
    ],
    pr: [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('padding')
        let value = transformValue(theme.padding[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('pr', modifier), { 'padding-right': value }]]
      },
    ],
    pb: [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('padding')
        let value = transformValue(theme.padding[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('pb', modifier), { 'padding-bottom': value }]]
      },
    ],
    pl: [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('padding')
        let value = transformValue(theme.padding[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('pl', modifier), { 'padding-left': value }]]
      },
    ],
  })
}
