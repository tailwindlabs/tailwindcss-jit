const { asLength } = require('../pluginUtils')

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    m: [
      (modifier, { theme, candidate }) => {
        let value = asLength(modifier, theme['margin'])

        if (value === undefined) {
          return []
        }

        return [[`.${candidate}`, { margin: value }]]
      },
    ],
  })
  addUtilities({
    mx: [
      (modifier, { theme, candidate }) => {
        let value = asLength(modifier, theme['margin'])

        if (value === undefined) {
          return []
        }

        return [[`.${candidate}`, { 'margin-left': value, 'margin-right': value }]]
      },
    ],
    my: [
      (modifier, { theme, candidate }) => {
        let value = asLength(modifier, theme['margin'])

        if (value === undefined) {
          return []
        }

        return [[`.${candidate}`, { 'margin-top': value, 'margin-bottom': value }]]
      },
    ],
  })
  addUtilities({
    mt: [
      (modifier, { theme, candidate }) => {
        let value = asLength(modifier, theme['margin'])

        if (value === undefined) {
          return []
        }

        return [[`.${candidate}`, { 'margin-top': value }]]
      },
    ],
    mr: [
      (modifier, { theme, candidate }) => {
        let value = asLength(modifier, theme['margin'])

        if (value === undefined) {
          return []
        }

        return [[`.${candidate}`, { 'margin-right': value }]]
      },
    ],
    mb: [
      (modifier, { theme, candidate }) => {
        let value = asLength(modifier, theme['margin'])

        if (value === undefined) {
          return []
        }

        return [[`.${candidate}`, { 'margin-bottom': value }]]
      },
    ],
    ml: [
      (modifier, { theme, candidate }) => {
        let value = asLength(modifier, theme['margin'])

        if (value === undefined) {
          return []
        }

        return [[`.${candidate}`, { 'margin-left': value }]]
      },
    ],
  })
}
