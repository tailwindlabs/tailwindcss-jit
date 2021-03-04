const postcss = require('postcss')

const evaluateTailwindFunctions = require('tailwindcss/lib/lib/evaluateTailwindFunctions').default
const substituteScreenAtRules = require('tailwindcss/lib/lib/substituteScreenAtRules').default

const setupContext = require('./lib/setupContext')
const removeLayerAtRules = require('./lib/removeLayerAtRules')
const substituteTailwindAtRules = require('./lib/substituteTailwindAtRules')
const expandApplyAtRules = require('./lib/expandApplyAtRules')

const { env } = require('./lib/sharedState')

module.exports = (configOrPath = {}) => {
  return {
    postcssPlugin: 'tailwindcss-jit',
    plugins: [
      env.DEBUG &&
        function (root) {
          console.log('\n')
          console.time('JIT TOTAL')
          return root
        },
      function (root, result) {
        function registerDependency(fileName) {
          result.messages.push({
            type: 'dependency',
            plugin: 'tailwindcss-jit',
            parent: result.opts.from,
            file: fileName,
          })
        }

        let context = setupContext(configOrPath)(result, root)

        if (context.configPath !== null) {
          registerDependency(context.configPath)
        }

        return postcss([
          removeLayerAtRules(context),
          substituteTailwindAtRules(context, registerDependency),
          expandApplyAtRules(context),
          evaluateTailwindFunctions(context.tailwindConfig),
          substituteScreenAtRules(context.tailwindConfig),

          // Collapse adjacent media queries
          function (root) {
            let currentRule = null
            root.each((node) => {
              if (node.type !== 'atrule') {
                currentRule = null
                return
              }

              if (currentRule === null) {
                currentRule = node
                return
              }

              if (node.params === currentRule.params) {
                currentRule.append(node.nodes)
                node.remove()
              } else {
                currentRule = node
              }
            })
          },
        ]).process(root, { from: undefined })
      },
      env.DEBUG &&
        function (root) {
          console.timeEnd('JIT TOTAL')
          console.log('\n')
          return root
        },
    ],
  }
}

module.exports.postcss = true
