const dlv = require('dlv')
const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const toRgba = require('tailwindcss/lib/util/withAlphaVariable').toRgba
const { asLength } = require('../pluginUtils')

function safeCall(callback, defaultValue) {
  try {
    return callback()
  } catch (_error) {
    return defaultValue
  }
}

module.exports = function ({ matchUtilities, addUtilities, jit: { theme } }) {
  let ringColorDefault = (([r, g, b]) => {
    return `rgba(${r}, ${g}, ${b}, ${dlv(theme, ['ringOpacity', 'DEFAULT'], '0.5')})`
  })(safeCall(() => toRgba(dlv(theme, ['ringColor', 'DEFAULT'])), ['147', '197', '253']))

  let ringReset = {
    '*': {
      '--tw-ring-inset': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-ring-offset-width': theme.ringOffsetWidth?.DEFAULT ?? '0px',
      '--tw-ring-offset-color': theme.ringOffsetColor?.DEFAULT ?? '#fff',
      '--tw-ring-color': ringColorDefault,
      '--tw-ring-offset-shadow': '0 0 #0000',
      '--tw-ring-shadow': '0 0 #0000',
    },
  }

  matchUtilities({
    ring: (modifier, { theme }) => {
      let value = asLength(modifier, theme['ringWidth'])

      if (value === undefined) {
        return []
      }

      return [
        [
          ringReset,
          {
            respectVariants: false,
          },
        ],
        {
          [nameClass('ring', modifier)]: {
            '--tw-ring-offset-shadow': `var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)`,
            '--tw-ring-shadow': `var(--tw-ring-inset) 0 0 0 calc(${value} + var(--tw-ring-offset-width)) var(--tw-ring-color)`,
            'box-shadow': [
              `var(--tw-ring-offset-shadow)`,
              `var(--tw-ring-shadow)`,
              `var(--tw-shadow, 0 0 #0000)`,
            ].join(', '),
          },
        },
      ]
    },
  })

  addUtilities({
    '.ring-inset': {
      '--tw-ring-inset': 'inset',
    },
  })
}
