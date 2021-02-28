const nameClass = require('tailwindcss/lib/util/nameClass').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const parseAnimationValue = require('tailwindcss/lib/util/parseAnimationValue').default

module.exports = function ({ jit: { theme, addUtilities } }) {
  let keyframes = Object.fromEntries(
    Object.entries(theme.keyframes).map(([key, value]) => {
      return [
        key,
        [
          `@keyframes ${key}`,
          Object.entries(value).map(([key, value]) => {
            return [key, value]
          }),
        ],
      ]
    })
  )

  let transformValue = transformThemeValue('animation')
  addUtilities({
    animate: [
      (modifier, { theme }) => {
        let value = transformValue(theme.animation[modifier])

        if (modifier === '' || value === undefined) {
          return []
        }

        let { name: animationName } = parseAnimationValue(value)

        return [keyframes[animationName], [nameClass('animate', modifier), { animation: value }]]
      },
    ],
  })
}
