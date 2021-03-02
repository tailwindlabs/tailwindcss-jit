const nameClass = require('tailwindcss/lib/util/nameClass').default
const buildMediaQuery = require('tailwindcss/lib/util/buildMediaQuery').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const {
  updateLastClasses,
  updateAllClasses,
  transformRule,
  transformAllSelectors,
  transformAllClasses,
  transformLastClasses,
} = require('../pluginUtils')

module.exports = {
  variants: function ({ jit: { config, theme, addUtilities, addVariant, e } }) {
    let pseudoVariants = [
      ['first', 'first-child'],
      ['last', 'last-child'],
      ['odd', 'nth-child(odd)'],
      ['even', 'nth-child(even)'],
      'visited',
      'checked',
      'focus-within',
      'hover',
      'focus',
      'focus-visible',
      'active',
      'disabled',
    ]

    for (let variant of pseudoVariants) {
      let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant]

      addVariant(
        variantName,
        transformAllClasses((className, { withPseudo }) => {
          return withPseudo(`${variantName}:${className}`, state)
        })
      )
    }

    for (let variant of pseudoVariants) {
      let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant]
      let groupVariantName = `group-${variantName}`

      addVariant(
        groupVariantName,
        transformAllSelectors((selector) => {
          let variantSelector = updateAllClasses(selector, (className) => {
            return `${groupVariantName}:${className}`
          })

          if (variantSelector === selector) {
            return null
          }

          return `.group:${state} ${variantSelector}`
        })
      )
    }

    addVariant(
      'motion-safe',
      transformLastClasses((className) => {
        return `motion-safe:${className}`
      }, '@media (prefers-reduced-motion: no-preference)')
    )

    addVariant(
      'motion-reduce',
      transformLastClasses((className) => {
        return `motion-reduce:${className}`
      }, '@media (prefers-reduced-motion: reduce)')
    )

    addVariant(
      'ltr',
      transformAllSelectors(
        (selector) => `[dir="ltr"] ${updateAllClasses(selector, (className) => `ltr:${className}`)}`
      )
    )

    addVariant(
      'rtl',
      transformAllSelectors(
        (selector) => `[dir="rtl"] ${updateAllClasses(selector, (className) => `rtl:${className}`)}`
      )
    )

    if (config.darkMode === 'class') {
      addVariant(
        'dark',
        transformAllSelectors((selector) => {
          let variantSelector = updateAllClasses(selector, (className) => {
            return `dark:${className}`
          })

          if (variantSelector === selector) {
            return null
          }

          return `.dark ${variantSelector}`
        })
      )
    } else if (config.darkMode === 'media') {
      addVariant(
        'dark',
        transformLastClasses((className) => {
          return `dark:${className}`
        }, '@media (prefers-color-scheme: dark)')
      )
    }

    for (let screen in theme.screens) {
      let size = theme.screens[screen]
      let query = buildMediaQuery(size)

      addVariant(
        screen,
        transformLastClasses((className) => {
          return `${screen}:${className}`
        }, `@media ${query}`)
      )
    }
  },

  // Sorted
  // Base
  preflight: require('./preflight'),

  // Components
  container: require('./container'),

  // Utilitiles
  // External
  accessibility: require('./accessibility'),
  position: require('./position'),
  inset: require('./inset'),
  zIndex: require('./zIndex'),
  order: require('./order'),
  gridColumn: require('./gridColumn'),
  gridColumnEnd: require('./gridColumnEnd'),
  gridColumnStart: require('./gridColumnStart'),
  gridRow: require('./gridRow'),
  gridRowEnd: require('./gridRowEnd'),
  gridRowStart: require('./gridRowStart'),
  margin: require('./margin'),
  boxSizing: require('./boxSizing'),
  display: require('./display'),
  height: require('./height'),
  maxHeight: require('./maxHeight'),
  minHeight: require('./minHeight'),
  width: require('./width'),
  minWidth: require('./minWidth'),
  maxWidth: require('./maxWidth'),
  flex: require('./flex'),

  // Internal
  appearance: require('./appearance'),
  gridAutoColumns: require('./gridAutoColumns'),
  gridAutoFlow: require('./gridAutoFlow'),
  gridAutoRows: require('./gridAutoRows'),
  gridTemplateColumns: require('./gridTemplateColumns'),
  gridTemplateRows: require('./gridTemplateRows'),
  flexDirection: require('./flexDirection'),
  flexWrap: require('./flexWrap'),
  flexShrink: require('./flexShrink'),
  flexGrow: require('./flexGrow'),
  placeItems: require('./placeItems'),
  placeSelf: require('./placeSelf'),
  alignContent: require('./alignContent'),
  alignItems: require('./alignItems'),
  alignSelf: require('./alignSelf'),
  justifyContent: require('./justifyContent'),
  justifyItems: require('./justifyItems'),
  justifySelf: require('./justifySelf'),
  float: require('./float'),

  // To be sorted
  transform: require('./transform'),
  translate: require('./translate'),
  rotate: require('./rotate'),
  skew: require('./skew'),
  scale: require('./scale'),
  animation: require('./animation'),
  backgroundAttachment: require('./backgroundAttachment'),
  backgroundClip: require('./backgroundClip'),
  backgroundColor: require('./backgroundColor'),
  backgroundImage: require('./backgroundImage'),
  backgroundOpacity: require('./backgroundOpacity'),
  backgroundPosition: require('./backgroundPosition'),
  backgroundRepeat: require('./backgroundRepeat'),
  backgroundSize: require('./backgroundSize'),
  borderCollapse: require('./borderCollapse'),
  borderColor: require('./borderColor'),
  borderOpacity: require('./borderOpacity'),
  borderRadius: require('./borderRadius'),
  borderStyle: require('./borderStyle'),
  borderWidth: require('./borderWidth'),
  boxShadow: require('./boxShadow'),
  clear: require('./clear'),
  cursor: require('./cursor'),
  divideColor: require('./divideColor'),
  divideOpacity: require('./divideOpacity'),
  divideStyle: require('./divideStyle'),
  divideWidth: require('./divideWidth'),
  fill: require('./fill'),
  fontFamily: require('./fontFamily'),
  fontSize: require('./fontSize'),
  fontSmoothing: require('./fontSmoothing'),
  fontStyle: require('./fontStyle'),
  fontVariantNumeric: require('./fontVariantNumeric'),
  fontWeight: require('./fontWeight'),
  gap: require('./gap'),
  gradientColorStops: require('./gradientColorStops'),
  letterSpacing: require('./letterSpacing'),
  lineHeight: require('./lineHeight'),
  listStylePosition: require('./listStylePosition'),
  listStyleType: require('./listStyleType'),
  objectFit: require('./objectFit'),
  objectPosition: require('./objectPosition'),
  opacity: require('./opacity'),
  outline: require('./outline'),
  overflow: require('./overflow'),
  overscrollBehavior: require('./overscrollBehavior'),
  padding: require('./padding'),
  placeContent: require('./placeContent'),
  placeholderColor: require('./placeholderColor'),
  placeholderOpacity: require('./placeholderOpacity'),
  pointerEvents: require('./pointerEvents'),
  resize: require('./resize'),
  ringWidth: require('./ringWidth'),
  ringOffsetWidth: require('./ringOffsetWidth'),
  ringColor: require('./ringColor'),
  ringOffsetColor: require('./ringOffsetColor'),
  ringOpacity: require('./ringOpacity'),
  space: require('./space'),
  stroke: require('./stroke'),
  strokeWidth: require('./strokeWidth'),
  tableLayout: require('./tableLayout'),
  textAlign: require('./textAlign'),
  textColor: require('./textColor'),
  textDecoration: require('./textDecoration'),
  textOpacity: require('./textOpacity'),
  textOverflow: require('./textOverflow'),
  textTransform: require('./textTransform'),
  transformOrigin: require('./transformOrigin'),
  transitionDelay: require('./transitionDelay'),
  transitionDuration: require('./transitionDuration'),
  transitionProperty: require('./transitionProperty'),
  transitionTimingFunction: require('./transitionTimingFunction'),
  userSelect: require('./userSelect'),
  verticalAlign: require('./verticalAlign'),
  visibility: require('./visibility'),
  whitespace: require('./whitespace'),
  wordBreak: require('./wordBreak'),
}
