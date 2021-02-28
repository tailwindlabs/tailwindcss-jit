const nameClass = require('tailwindcss/lib/util/nameClass').default

function isPlainObject(value) {
  return typeof value === 'object' && value !== null
}

module.exports = function ({ jit: { theme, addUtilities, addVariant, e } }) {
  addUtilities({
    text: [
      (modifier, { theme }) => {
        let value = theme.fontSize[modifier]

        if (value === undefined) {
          return []
        }

        let [fontSize, options] = Array.isArray(value) ? value : [value]
        let { lineHeight, letterSpacing } = isPlainObject(options)
          ? options
          : {
              lineHeight: options,
            }

        return [
          [
            nameClass('text', modifier),
            {
              'font-size': fontSize,
              ...(lineHeight === undefined
                ? {}
                : {
                    'line-height': lineHeight,
                  }),
              ...(letterSpacing === undefined
                ? {}
                : {
                    'letter-spacing': letterSpacing,
                  }),
            },
          ],
        ]
      },
    ],
  })
}
