const postcss = require('postcss')

const evaluateTailwindFunctions = require('tailwindcss/lib/lib/evaluateTailwindFunctions').default
const substituteScreenAtRules = require('tailwindcss/lib/lib/substituteScreenAtRules').default

const rewriteTailwindImports = require('./lib/rewriteTailwindImports')
const setupContext = require('./lib/setupContext')
const removeLayerAtRules = require('./lib/removeLayerAtRules')
const expandTailwindAtRules = require('./lib/expandTailwindAtRules')
const expandApplyAtRules = require('./lib/expandApplyAtRules')
const collapseAdjacentRules = require('./lib/collapseAdjacentRules')

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

        rewriteTailwindImports(root)

        let context = setupContext(configOrPath)(result, root)

        if (context.configPath !== null) {
          registerDependency(context.configPath)
        }

        return postcss([
          removeLayerAtRules(context),
          expandTailwindAtRules(context, registerDependency),
          expandApplyAtRules(context),
          evaluateTailwindFunctions(context.tailwindConfig),
          substituteScreenAtRules(context.tailwindConfig),
          collapseAdjacentRules(context),
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
