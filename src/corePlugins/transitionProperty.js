const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  let defaultTimingFunction = theme.transitionTimingFunction.DEFAULT
  let defaultDuration = theme.transitionDuration.DEFAULT

  addUtilities({
    transition: [
      (modifier, { theme }) => {
        let transformValue = transformThemeValue('transitionProperty')
        let value = transformValue(theme.transitionProperty[modifier])

        if (value === undefined) {
          return []
        }

        return [
          [
            nameClass('transition', modifier),
            {
              'transition-property': value,
              ...(value === 'none'
                ? {}
                : {
                    'transition-timing-function': defaultTimingFunction,
                    'transition-duration': defaultDuration,
                  }),
            },
          ],
        ]
      },
    ],
  })
}
