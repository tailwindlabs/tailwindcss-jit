const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const toRgba = require('tailwindcss/lib/util/withAlphaVariable').toRgba

function safeCall(callback, defaultValue) {
  try {
    return callback()
  } catch (_error) {
    return defaultValue
  }
}

let ringReset = ['*']

module.exports = function ({ jit: { theme, addUtilities } }) {
  let ringColorDefault = (([r, g, b]) => {
    return `rgba(${r}, ${g}, ${b}, ${theme.ringOpacity?.DEFAULT ?? '0.5'})`
  })(safeCall(() => toRgba(theme.ringOpacity?.DEFAULT), ['147', '197', '253']))

  ringReset[1] = {
    '--tw-ring-inset': 'var(--tw-empty,/*!*/ /*!*/)',
    '--tw-ring-offset-width': theme.ringOffsetWidth?.DEFAULT ?? '0px',
    '--tw-ring-offset-color': theme.ringOffsetColor?.DEFAULT ?? '#fff',
    '--tw-ring-color': ringColorDefault,
    '--tw-ring-offset-shadow': '0 0 #0000',
    '--tw-ring-shadow': '0 0 #0000',
  }

  addUtilities({
    ring: [
      (modifier, { theme }) => {
        modifier = modifier === '' ? 'DEFAULT' : modifier

        let transformValue = transformThemeValue('ringWidth')
        let value = transformValue(theme.ringWidth[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        return [
          ringReset,
          [
            nameClass('ring', modifier),
            {
              '--tw-ring-offset-shadow': `var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)`,
              '--tw-ring-shadow': `var(--tw-ring-inset) 0 0 0 calc(${value} + var(--tw-ring-offset-width)) var(--tw-ring-color)`,
              'box-shadow': [
                `var(--tw-ring-offset-shadow)`,
                `var(--tw-ring-shadow)`,
                `var(--tw-shadow, 0 0 #0000)`,
              ].join(', '),
            },
          ],
        ]
      },
    ],
  })

  addUtilities({
    'ring-inset': [
      [
        '.ring-inset',
        {
          '--tw-ring-inset': 'inset',
        },
      ],
    ],
  })
}
