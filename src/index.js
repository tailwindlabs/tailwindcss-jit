const fs = require('fs')

const postcss = require('postcss')
const fastGlob = require('fast-glob')
const LRU = require('quick-lru')

const escape = require('tailwindcss/lib/util/escapeClassName').default
const evaluateTailwindFunctions = require('tailwindcss/lib/lib/evaluateTailwindFunctions').default
const substituteScreenAtRules = require('tailwindcss/lib/lib/substituteScreenAtRules').default

const setupContext = require('./lib/setupContext')
const sharedState = require('./lib/sharedState')

let env = sharedState.env

function sign(bigIntValue) {
  return (bigIntValue > 0n) - (bigIntValue < 0n)
}

// Scans template contents for possible classes. This is a hot path on initial build but
// not too important for subsequent builds. The faster the better though — if we can speed
// up these regexes by 50% that could cut initial build time by like 20%.

function getClassCandidates(content, contentMatchCache, candidates, seen) {
  for (let line of content.split('\n')) {
    line = line.trim()

    if (seen.has(line)) {
      continue
    }
    seen.add(line)

    if (contentMatchCache.has(line)) {
      for (let match of contentMatchCache.get(line)) {
        candidates.add(match)
      }
    } else {
      let allMatches = new Set()
      let broadMatches = line.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []
      let innerMatches = line.match(/[^<>"'`\s.(){}[\]#=%]*[^<>"'`\s.(){}[\]#=%:]/g) || []

      for (let match of broadMatches) {
        allMatches.add(match)
        candidates.add(match)
      }
      for (let match of innerMatches) {
        allMatches.add(match)
        candidates.add(match)
      }

      contentMatchCache.set(line, allMatches)
    }
  }
}

// ---

// Takes our lightweight rule structure and turns it into a PostCSS node.
// This is likely a hot path and should be as optimized as possible. We
// use a cache for the actual rules so that we are never recreating them
// if we've already done the work, but we need to be careful we don't
// mutate these nodes after we get them because we reuse the same
// reference.

function toPostCssNode(rule, postCssNodeCache) {
  if (postCssNodeCache.has(rule)) {
    return postCssNodeCache.get(rule)
  }

  let [selector, childRule] = rule
  let node

  if (selector[0] === '@') {
    let name = selector.slice(1, selector.indexOf(' '))
    let params = selector.slice(selector.indexOf(' ') + 1)
    node = postcss.atRule({ name, params })

    if (Array.isArray(childRule)) {
      // It's a rule tuple
      node.append(
        childRule.map((rule) => {
          return toPostCssNode(rule, postCssNodeCache)
        })
      )
    } else {
      // It's an object, like pairs in keyframes
      for (let property in childRule) {
        node.append(
          postcss.decl({
            prop: property,
            value: childRule[property],
          })
        )
      }
    }
  } else {
    // Regular rule (like a class), children are definitely declarations,
    // not other rules
    node = postcss.rule({
      selector: rule[0],
      nodes: Object.entries(rule[1]).map(([prop, value]) => {
        return postcss.decl({ prop, value })
      }),
    })
  }

  postCssNodeCache.set(rule, node)

  return node
}

// ---

// Generate match permutations for a class candidate, like:
// ['ring-offset-blue', '100']
// ['ring-offset', 'blue-100']
// ['ring', 'offset-blue-100']
function* candidatePermutations(prefix, modifier = '') {
  yield [prefix, modifier]

  let dashIdx = prefix.lastIndexOf('-')
  if (dashIdx === -1) {
    return
  }

  yield* candidatePermutations(
    prefix.slice(0, dashIdx),
    [prefix.slice(dashIdx + 1), modifier].filter(Boolean).join('-')
  )
}

function generateRules(tailwindConfig, candidates, context) {
  let { componentMap, utilityMap, classCache, notClassCache, postCssNodeCache } = context

  let layers = {
    components: [],
    utilities: [],
  }

  for (let candidate of candidates) {
    if (notClassCache.has(candidate)) {
      continue
    }

    if (classCache.has(candidate)) {
      let [layer, matches] = classCache.get(candidate)
      layers[layer].push(matches)
      continue
    }

    let [classCandidate, ...variants] = candidate.split(':').reverse()

    if (componentMap.has(classCandidate)) {
      let matches = componentMap.get(classCandidate)

      if (matches.length === 0) {
        notClassCache.add(candidate)
        continue
      }

      for (let variant of variants) {
        matches = applyVariant(variant, matches, context)
      }

      classCache.set(candidate, ['components', matches])
      layers.components.push(matches)
    } else {
      let matchedPlugins = null

      if (utilityMap.has(classCandidate)) {
        matchedPlugins = [utilityMap.get(classCandidate), 'DEFAULT']
      } else {
        let candidatePrefix = classCandidate
        let negative = false

        if (candidatePrefix[0] === '-') {
          negative = true
          candidatePrefix = candidatePrefix.slice(1)
        }

        for (let [prefix, modifier] of candidatePermutations(candidatePrefix)) {
          if (utilityMap.has(prefix)) {
            matchedPlugins = [utilityMap.get(prefix), negative ? `-${modifier}` : modifier]
            break
          }
        }
      }

      if (matchedPlugins === null) {
        notClassCache.add(candidate)
        continue
      }

      let pluginHelpers = {
        candidate: classCandidate,
        theme: tailwindConfig.theme,
      }

      let matches = []
      let [plugins, modifier] = matchedPlugins

      for (let [sort, plugin] of plugins) {
        if (Array.isArray(plugin)) {
          matches.push([sort, plugin])
        } else {
          for (let result of plugin(modifier, pluginHelpers)) {
            matches.push([sort, result])
          }
        }
      }

      for (let variant of variants) {
        matches = applyVariant(variant, matches, context)
      }

      classCache.set(candidate, ['utilities', matches])
      layers.utilities.push(matches)
    }
  }

  return {
    components: layers.components
      .flat(1)
      .map(([sort, rule]) => [
        sort | context.layerOrder.components,
        toPostCssNode(rule, postCssNodeCache),
      ]),
    utilities: layers.utilities
      .flat(1)
      .map(([sort, rule]) => [
        sort | context.layerOrder.utilities,
        toPostCssNode(rule, postCssNodeCache),
      ]),
  }
}

function buildStylesheet(rules, context) {
  let sortedRules = rules.sort(([a], [z]) => sign(a - z))

  let returnValue = {
    components: new Set(),
    utilities: new Set(),
    screens: new Set(),
  }

  for (let [sort, rule] of sortedRules) {
    if (sort >= context.minimumScreen) {
      returnValue.screens.add(rule)
      continue
    }

    if (sort & context.layerOrder.components) {
      returnValue.components.add(rule)
      continue
    }

    if (sort & context.layerOrder.utilities) {
      returnValue.utilities.add(rule)
      continue
    }
  }

  return returnValue
}

// ---

// Takes a list of rule tuples and applies a variant like `hover`, sm`,
// whatever to it. We used to do some extra caching here to avoid generating
// a variant of the same rule more than once, but this was never hit because
// we cache at the entire selector level further up the tree.
//
// Technically you can get a cache hit if you have `hover:focus:text-center`
// and `focus:hover:text-center` in the same project, but it doesn't feel
// worth the complexity for that case.

function applyVariant(variant, matches, { variantMap }) {
  if (matches.length === 0) {
    return matches
  }

  if (variantMap.has(variant)) {
    let [variantSort, applyThisVariant] = variantMap.get(variant)
    let result = []

    for (let [sort, rule] of matches) {
      let [, , options = {}] = rule

      if (options.respectVariants === false) {
        result.push([sort, rule])
        continue
      }

      let ruleWithVariant = applyThisVariant(rule)

      if (ruleWithVariant === null) {
        continue
      }

      let withOffset = [variantSort | sort, ruleWithVariant]
      result.push(withOffset)
    }

    return result
  }

  return []
}

// ---

function isPlainObject(value) {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === null || prototype === Object.prototype
}

let contentMatchCache = new LRU({ maxSize: 25000 })

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
          // Remove @layer rules, already collected and added to context
          function (root) {
            root.walkAtRules('layer', (rule) => {
              rule.remove()
            })
          },
          // substituteTailwindAtRules
          function (root) {
            let foundTailwind = false
            let layerNodes = {
              base: null,
              components: null,
              utilities: null,
              screens: null,
            }

            // Make sure this file contains Tailwind directives. If not, we can save
            // a lot of work and bail early. Also we don't have to register our touch
            // file as a dependency since the output of this CSS does not depend on
            // the source of any templates. Think Vue <style> blocks for example.
            root.walkAtRules('tailwind', (rule) => {
              foundTailwind = true

              if (rule.params === 'base') {
                layerNodes.base = rule
              }

              if (rule.params === 'components') {
                layerNodes.components = rule
              }

              if (rule.params === 'utilities') {
                layerNodes.utilities = rule
              }

              if (rule.params === 'screens') {
                layerNodes.screens = rule
              }
            })

            if (!foundTailwind) {
              return root
            }

            // ---

            // Register our temp file as a dependency — we write to this file
            // to trigger rebuilds.
            if (context.touchFile) {
              registerDependency(context.touchFile)
            }

            // If we're not set up and watching files ourselves, we need to do
            // the work of grabbing all of the template files for candidate
            // detection.
            if (!context.scannedContent) {
              let files = fastGlob.sync(context.candidateFiles)
              for (let file of files) {
                context.changedFiles.add(file)
              }
              context.scannedContent = true
            }

            // ---

            // Find potential classes in changed files
            let candidates = new Set()
            let seen = new Set()

            env.DEBUG && console.time('Reading changed files')
            for (let file of context.changedFiles) {
              let content = fs.readFileSync(file, 'utf8')
              getClassCandidates(content, contentMatchCache, candidates, seen)
            }
            env.DEBUG && console.timeEnd('Reading changed files')

            // ---

            // Generate the actual CSS

            let classCacheCount = context.classCache.size

            env.DEBUG && console.time('Generate rules')
            let { utilities, components } = generateRules(
              context.tailwindConfig,
              candidates,
              context
            )
            env.DEBUG && console.timeEnd('Generate rules')

            // We only ever add to the classCache, so if it didn't grow, there is nothing new.
            if (context.classCache.size !== classCacheCount) {
              for (let rule of components) {
                context.componentRuleCache.add(rule)
              }

              for (let rule of utilities) {
                context.utilityRuleCache.add(rule)
              }

              env.DEBUG && console.time('Build stylesheet')
              context.stylesheetCache = buildStylesheet(
                [...context.componentRuleCache, ...context.utilityRuleCache],
                context
              )
              env.DEBUG && console.timeEnd('Build stylesheet')
            }

            let {
              components: componentNodes,
              utilities: utilityNodes,
              screens: screenNodes,
            } = context.stylesheetCache

            // ---

            // Replace any Tailwind directives with generated CSS

            if (layerNodes.base) {
              layerNodes.base.before([...context.baseRules])
              layerNodes.base.remove()
            }

            if (layerNodes.components) {
              layerNodes.components.before([...componentNodes])
              layerNodes.components.remove()
            }

            if (layerNodes.utilities) {
              layerNodes.utilities.before([...utilityNodes])
              layerNodes.utilities.remove()
            }

            if (layerNodes.screens) {
              layerNodes.screens.before([...screenNodes])
              layerNodes.screens.remove()
            } else {
              root.append([...screenNodes])
            }

            // ---

            if (env.DEBUG) {
              console.log('Changed files: ', context.changedFiles.size)
              console.log('Potential classes: ', candidates.size)
              console.log('Active contexts: ', sharedState.contextMap.size)
              console.log('Content match entries', contentMatchCache.size)
            }

            // Clear the cache for the changed files
            context.changedFiles.clear()
          },
          function (root) {
            let applyCandidates = new Set()

            // Collect all @apply rules and candidates
            let applies = []
            root.walkAtRules('apply', (rule) => {
              for (let util of rule.params.split(/[\s\t\n]+/g)) {
                applyCandidates.add(util)
              }
              applies.push(rule)
            })

            // Start the @apply process if we have rules with @apply in them
            if (applies.length > 0) {
              // Fill up some caches!
              generateRules(context.tailwindConfig, applyCandidates, context)

              /**
               * When we have an apply like this:
               *
               * .abc {
               *    @apply hover:font-bold;
               * }
               *
               * What we essentially will do is resolve to this:
               *
               * .abc {
               *    @apply .hover\:font-bold:hover {
               *      font-weight: 500;
               *    }
               * }
               *
               * Notice that the to-be-applied class is `.hover\:font-bold:hover` and that the utility candidate was `hover:font-bold`.
               * What happens in this function is that we prepend a `.` and escape the candidate.
               * This will result in `.hover\:font-bold`
               * Which means that we can replace `.hover\:font-bold` with `.abc` in `.hover\:font-bold:hover` resulting in `.abc:hover`
               */
              // TODO: Should we use postcss-selector-parser for this instead?
              function replaceSelector(selector, utilitySelector, candidate) {
                return selector
                  .split(/\s*,\s*/g)
                  .map((s) => utilitySelector.replace(`.${escape(candidate)}`, s))
                  .join(', ')
              }

              function updateSelectors(rule, apply, candidate) {
                return rule.map(([selector, rule]) => {
                  if (!isPlainObject(rule)) {
                    return [selector, updateSelectors(rule, apply, candidate)]
                  }
                  return [replaceSelector(apply.parent.selector, selector, candidate), rule]
                })
              }

              for (let apply of applies) {
                let siblings = []
                let applyCandidates = apply.params.split(/[\s\t\n]+/g)
                for (let applyCandidate of applyCandidates) {
                  // TODO: Check for user css rules?
                  if (!context.classCache.has(applyCandidate)) {
                    throw new Error('Utility does not exist!')
                  }

                  let [layerName, rules] = context.classCache.get(applyCandidate)
                  for (let [sort, [selector, rule]] of rules) {
                    // Nested rules...
                    if (!isPlainObject(rule)) {
                      siblings.push([
                        sort,
                        toPostCssNode(
                          [selector, updateSelectors(rule, apply, applyCandidate)],
                          context.postCssNodeCache
                        ),
                      ])
                    } else {
                      let appliedSelector = replaceSelector(
                        apply.parent.selector,
                        selector,
                        applyCandidate
                      )

                      if (appliedSelector !== apply.parent.selector) {
                        siblings.push([
                          sort,
                          toPostCssNode([appliedSelector, rule], context.postCssNodeCache),
                        ])
                        continue
                      }

                      // Add declarations directly
                      for (let property in rule) {
                        apply.before(postcss.decl({ prop: property, value: rule[property] }))
                      }
                    }
                  }
                }

                // Inject the rules, sorted, correctly
                for (let [sort, sibling] of siblings.sort(([a], [z]) => sign(z - a))) {
                  // `apply.parent` is refering to the node at `.abc` in: .abc { @apply mt-2 }
                  apply.parent.after(sibling)
                }

                // If there are left-over declarations, just remove the @apply
                if (apply.parent.nodes.length > 1) {
                  apply.remove()
                } else {
                  // The node is empty, drop the full node
                  apply.parent.remove()
                }
              }
            }
          },
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
