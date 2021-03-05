const postcss = require('postcss')
const parseObjectStyles = require('tailwindcss/lib/util/parseObjectStyles').default
const { updateLastClasses, updateAllClasses, transformRule } = require('./pluginUtils')

test('transforming simple class rule', () => {
  // let simpleClass = [
  //   '.bg-black',
  //   {
  //     'background-color': '#000',
  //   },
  // ]

  // TODO: Make this work
  let simpleClass = postcss.rule({
    selector: '.bg-black',
    nodes: [postcss.decl({ prop: 'background-color', value: '#000' })],
  })

  // console.log(simpleClass)

  console.log(
    parseObjectStyles({
      '.bg-black': {
        'background-color': '#000',
      },
    })
  )

  expect(transformRule(simpleClass, ([sel, rules]) => ['.transformed', rules])).toEqual([
    '.transformed',
    {
      'background-color': '#000',
    },
  ])
})

test('transforming multiple class rule', () => {
  let multipleClasses = [
    '.ordinal, .tabular-nums, .diagonal-fractions',
    {
      'font-variant-numeric':
        'var(--tw-ordinal) var(--tw-numeric-figure) var(--tw-numeric-fraction)',
    },
  ]

  expect(
    transformRule(multipleClasses, ([selector, rules]) => {
      let newSelector = updateAllClasses(selector, (className) => `transformed-${className}`)

      return [newSelector, rules]
    })
  ).toEqual([
    '.transformed-ordinal, .transformed-tabular-nums, .transformed-diagonal-fractions',
    {
      'font-variant-numeric':
        'var(--tw-ordinal) var(--tw-numeric-figure) var(--tw-numeric-fraction)',
    },
  ])
})

test('transforming media query with class rules', () => {
  let mediaQuery = [
    '@media (min-width: 300px)',
    [
      [
        '.sm\\:bg-black',
        {
          'background-color': '#000',
        },
      ],
      [
        '.sm\\:bg-white',
        {
          'background-color': '#fff',
        },
      ],
    ],
  ]

  expect(
    transformRule(mediaQuery, ([selector, rules]) => {
      let newSelector = updateAllClasses(selector, (className) => `print:${className}`)

      return [newSelector, rules]
    })
  ).toEqual([
    '@media (min-width: 300px)',
    [
      [
        '.print\\:sm\\:bg-black',
        {
          'background-color': '#000',
        },
      ],
      [
        '.print\\:sm\\:bg-white',
        {
          'background-color': '#fff',
        },
      ],
    ],
  ])
})

test('transforming media query with multiple class rules', () => {
  let mediaQueryMultipleClasses = [
    '@media (min-width: 300px)',
    [
      [
        '.group:hover .group-hover\\:bg-black',
        {
          'background-color': '#000',
        },
      ],
      [
        '.group:hover .group-hover\\:bg-white',
        {
          'background-color': '#fff',
        },
      ],
    ],
  ]

  expect(
    transformRule(mediaQueryMultipleClasses, ([selector, rules]) => {
      let newSelector = updateAllClasses(selector, (className) => `print:${className}`)

      return [newSelector, rules]
    })
  ).toEqual([
    '@media (min-width: 300px)',
    [
      [
        '.print\\:group:hover .print\\:group-hover\\:bg-black',
        {
          'background-color': '#000',
        },
      ],
      [
        '.print\\:group:hover .print\\:group-hover\\:bg-white',
        {
          'background-color': '#fff',
        },
      ],
    ],
  ])
})

test('transforming media query with multiple class rules, last classes only', () => {
  let mediaQueryMultipleClasses = [
    '@media (min-width: 300px)',
    [
      [
        '.foo .bar, .baz .zap',
        {
          'background-color': '#000',
        },
      ],
      [
        '.bronze .silver, .platinum .diamond',
        {
          'background-color': '#fff',
        },
      ],
    ],
  ]

  expect(
    transformRule(mediaQueryMultipleClasses, ([selector, rules]) => {
      let newSelector = updateLastClasses(selector, (className) => `print:${className}`)

      return [newSelector, rules]
    })
  ).toEqual([
    '@media (min-width: 300px)',
    [
      [
        '.foo .print\\:bar, .baz .print\\:zap',
        {
          'background-color': '#000',
        },
      ],
      [
        '.bronze .print\\:silver, .platinum .print\\:diamond',
        {
          'background-color': '#fff',
        },
      ],
    ],
  ])
})

test('transforming nested media query rules', () => {
  let nestedMediaQuery = [
    '@media (min-width: 300px)',
    [
      [
        '@supports (display: grid)',
        [
          [
            '.sm\\:bg-black',
            {
              'background-color': '#000',
            },
          ],
          [
            '.sm\\:bg-white',
            {
              'background-color': '#fff',
            },
          ],
        ],
      ],
    ],
  ]

  expect(
    transformRule(nestedMediaQuery, ([selector, rules]) => {
      let newSelector = updateAllClasses(selector, (className) => `print:${className}`)

      return [newSelector, rules]
    })
  ).toEqual([
    '@media (min-width: 300px)',
    [
      [
        '@supports (display: grid)',
        [
          [
            '.print\\:sm\\:bg-black',
            {
              'background-color': '#000',
            },
          ],
          [
            '.print\\:sm\\:bg-white',
            {
              'background-color': '#fff',
            },
          ],
        ],
      ],
    ],
  ])
})

test('transforming keyframes', () => {
  let keyframes = [
    '@keyframes spin',
    [
      [
        '0%, 100%',
        {
          transform: 'translateY(-25%)',
          animationTimingFunction: 'cubic-bezier(0.8,0,1,1)',
        },
      ],
      [
        '50%',
        {
          transform: 'none',
          animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
        },
      ],
    ],
  ]

  expect(
    transformRule(keyframes, ([selector, rules]) => {
      let newSelector = updateAllClasses(selector, (className) => `transformed-${className}`)

      return [newSelector, rules]
    })
  ).toEqual([
    '@keyframes spin',
    [
      [
        '0%, 100%',
        {
          transform: 'translateY(-25%)',
          animationTimingFunction: 'cubic-bezier(0.8,0,1,1)',
        },
      ],
      [
        '50%',
        {
          transform: 'none',
          animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
        },
      ],
    ],
  ])
})

test('transforming font face', () => {
  let fontFace = [
    '@font-face',
    {
      'font-family': 'MyHelvetica',
      src: 'local("Helvetica Neue Bold"), local("HelveticaNeue-Bold"), url(MgOpenModernaBold.ttf)',
      'font-weight': 'bold',
    },
  ]

  expect(
    transformRule(fontFace, ([selector, rules]) => {
      let newSelector = updateAllClasses(selector, (className) => `transformed-${className}`)

      return [newSelector, rules]
    })
  ).toEqual([
    '@font-face',
    {
      'font-family': 'MyHelvetica',
      src: 'local("Helvetica Neue Bold"), local("HelveticaNeue-Bold"), url(MgOpenModernaBold.ttf)',
      'font-weight': 'bold',
    },
  ])
})

test('transforming a rule where a node needs to be removed', () => {
  let mediaQueryWithRuleThatNeedsToBeRemoved = [
    '@supports (display: grid)',
    [
      [
        '*',
        {
          '--tw-shadow': '0 0 #0000',
        },
      ],
      [
        '.shadow',
        {
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
        },
      ],
    ],
  ]

  expect(
    transformRule(mediaQueryWithRuleThatNeedsToBeRemoved, ([selector, rules]) => {
      // If a rule with nested rules (like a media query) just keep chuggin'
      if (Array.isArray(rules)) {
        return [selector, rules]
      }

      let newSelector = updateAllClasses(selector, (className) => `transformed-${className}`)

      if (newSelector === selector) {
        return null
      }

      return [newSelector, rules]
    })
  ).toEqual([
    '@supports (display: grid)',
    [
      [
        '.transformed-shadow',
        {
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
        },
      ],
    ],
  ])
})

test('transforming a rule such that it becomes empty returns null', () => {
  let mediaQueryWithRuleThatNeedsToBeRemoved = [
    '@supports (display: grid)',
    [
      [
        '*',
        {
          '--tw-shadow': '0 0 #0000',
        },
      ],
      [
        'h2',
        {
          '--tw-something-else': '0 0 #0000',
        },
      ],
    ],
  ]

  expect(
    transformRule(mediaQueryWithRuleThatNeedsToBeRemoved, ([selector, rules]) => {
      // If a rule with nested rules (like a media query) just keep chuggin'
      if (Array.isArray(rules)) {
        return [selector, rules]
      }

      let newSelector = updateAllClasses(selector, (className) => `transformed-${className}`)

      if (newSelector === selector) {
        return null
      }

      return [newSelector, rules]
    })
  ).toEqual(null)
})
