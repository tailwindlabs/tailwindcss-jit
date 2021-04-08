const { asValue, nameClass } = require('../pluginUtils')

module.exports = function ({ matchUtilities, matchWildcards, jit: { theme } }) {
  matchWildcards({
    p: Object.keys(theme['padding']),
    px: Object.keys(theme['padding']),
    py: Object.keys(theme['padding']),
    pt: Object.keys(theme['padding']),
    pr: Object.keys(theme['padding']),
    pb: Object.keys(theme['padding']),
    pl: Object.keys(theme['padding']),
  })

  matchUtilities({
    p: (modifier, { theme }) => {
      let value = asValue(modifier, theme['padding'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('p', modifier)]: { padding: value } }
    },
  })
  matchUtilities({
    px: (modifier, { theme }) => {
      let value = asValue(modifier, theme['padding'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('px', modifier)]: { 'padding-left': value, 'padding-right': value } }
    },
    py: (modifier, { theme }) => {
      let value = asValue(modifier, theme['padding'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('py', modifier)]: { 'padding-top': value, 'padding-bottom': value } }
    },
  })
  matchUtilities({
    pt: (modifier, { theme }) => {
      let value = asValue(modifier, theme['padding'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('pt', modifier)]: { 'padding-top': value } }
    },
    pr: (modifier, { theme }) => {
      let value = asValue(modifier, theme['padding'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('pr', modifier)]: { 'padding-right': value } }
    },
    pb: (modifier, { theme }) => {
      let value = asValue(modifier, theme['padding'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('pb', modifier)]: { 'padding-bottom': value } }
    },
    pl: (modifier, { theme }) => {
      let value = asValue(modifier, theme['padding'])

      if (value === undefined) {
        return []
      }

      return { [nameClass('pl', modifier)]: { 'padding-left': value } }
    },
  })
}
