const { toPostCssNode } = require('./utils')

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

module.exports = generateRules
