const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    rounded: [
      (modifier, { theme }) => {
        if (modifier === '' || theme.borderRadius[modifier] === undefined) {
          return []
        }

        return [[nameClass('rounded', modifier), { 'border-radius': theme.borderRadius[modifier] }]]
      },
    ],
  })
  addUtilities({
    'rounded-t': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderRadius')
        let value = transformValue(theme.borderRadius[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }
        return [
          [
            nameClass('rounded-t', modifier),
            { 'border-top-left-radius': value, 'border-top-right-radius': value },
          ],
        ]
      },
    ],
    'rounded-r': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderRadius')
        let value = transformValue(theme.borderRadius[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [
          [
            nameClass('rounded-r', modifier),
            { 'border-top-right-radius': value, 'border-bottom-right-radius': value },
          ],
        ]
      },
    ],
    'rounded-b': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderRadius')
        let value = transformValue(theme.borderRadius[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [
          [
            nameClass('rounded-b', modifier),
            { 'border-bottom-right-radius': value, 'border-bottom-left-radius': value },
          ],
        ]
      },
    ],
    'rounded-l': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderRadius')
        let value = transformValue(theme.borderRadius[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [
          [
            nameClass('rounded-l', modifier),
            { 'border-top-left-radius': value, 'border-bottom-left-radius': value },
          ],
        ]
      },
    ],
  })
  addUtilities({
    'rounded-tl': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderRadius')
        let value = transformValue(theme.borderRadius[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('rounded-tl', modifier), { 'border-top-left-radius': value }]]
      },
    ],
    'rounded-tr': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderRadius')
        let value = transformValue(theme.borderRadius[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('rounded-tr', modifier), { 'border-top-right-radius': value }]]
      },
    ],
    'rounded-br': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderRadius')
        let value = transformValue(theme.borderRadius[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('rounded-br', modifier), { 'border-bottom-right-radius': value }]]
      },
    ],
    'rounded-bl': [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('borderRadius')
        let value = transformValue(theme.borderRadius[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [[nameClass('rounded-bl', modifier), { 'border-bottom-left-radius': value }]]
      },
    ],
  })
}
