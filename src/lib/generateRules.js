const postcss = require('postcss')
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

    for (let [{ sort, layer }, rule] of matches) {
      let options = rule.__tailwind ?? {}

      if (options.respectVariants === false) {
        result.push([{ sort, layer }, rule])
        continue
      }

      let container = postcss.root({ nodes: [rule] })

      let ruleWithVariant = applyThisVariant({ container })

      if (ruleWithVariant === null) {
        continue
      }

      let withOffset = [{ sort: variantSort | sort, layer }, container.nodes[0]]
      result.push(withOffset)
    }

    return result
  }

  return []
}

function generateRules(tailwindConfig, candidates, context) {
  let { candidateRuleMap, classCache, notClassCache, postCssNodeCache } = context
  let allRules = []

  for (let candidate of candidates) {
    if (notClassCache.has(candidate)) {
      continue
    }

    if (classCache.has(candidate)) {
      allRules.push(classCache.get(candidate))
      continue
    }

    let [classCandidate, ...variants] = candidate.split(':').reverse()
    let matchedPlugins = null

    if (candidateRuleMap.has(classCandidate)) {
      matchedPlugins = [candidateRuleMap.get(classCandidate), 'DEFAULT']
    } else {
      let candidatePrefix = classCandidate
      let negative = false

      if (candidatePrefix[0] === '-') {
        negative = true
        candidatePrefix = candidatePrefix.slice(1)
      }

      for (let [prefix, modifier] of candidatePermutations(candidatePrefix)) {
        if (candidateRuleMap.has(prefix)) {
          matchedPlugins = [candidateRuleMap.get(prefix), negative ? `-${modifier}` : modifier]
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
      if (typeof plugin === 'function') {
        for (let result of plugin(modifier, pluginHelpers)) {
          if (Array.isArray(result)) {
            result = toPostCssNode(result, context.postCssNodeCache)
          }
          matches.push([sort, result])
        }
      } else {
        if (Array.isArray(plugin)) {
          plugin = toPostCssNode(plugin, context.postCssNodeCache)
        }
        matches.push([sort, plugin])
      }
    }

    for (let variant of variants) {
      matches = applyVariant(variant, matches, context)
    }

    classCache.set(candidate, matches)
    allRules.push(matches)
  }

  return allRules.flat(1).map(([{ sort, layer }, rule]) => [sort | context.layerOrder[layer], rule])
}

module.exports = generateRules
