module.exports = function ({ jit: { theme, addComponents, e } }) {
  let screens = theme.screens

  addComponents({
    container: [
      [
        '.container',
        {
          width: '100%',
        },
      ],
      ...Object.entries(screens).map(([screen, width]) => {
        return [
          `@media (min-width: ${width})`,
          [
            [
              '.container',
              {
                'max-width': width,
              },
            ],
          ],
        ]
      }),
    ],
  })
}
