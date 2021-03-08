const postcss = require('postcss')
const { default: parseObjectStyles } = require('tailwindcss/lib/util/parseObjectStyles')
const { transformAllSelectors } = require('../pluginUtils')
const { toPostCssNode, isPlainObject } = require('./utils')

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

    for (let [{ sort, layer, options }, rule] of matches) {
      if (options.respectVariants === false) {
        result.push([{ sort, layer, options }, rule])
        continue
      }

      let container = postcss.root({ nodes: [rule] })

      let ruleWithVariant = applyThisVariant({ container })

      if (ruleWithVariant === null) {
        continue
      }

      let withOffset = [{ sort: variantSort | sort, layer, options }, container.nodes[0]]
      result.push(withOffset)
    }

    return result
  }

  return []
}

function parseRules(rule, cache, options = {}) {
  // PostCSS node
  if (!isPlainObject(rule) && !Array.isArray(rule)) {
    return [[rule], options]
  }

  // Tuple
  if (Array.isArray(rule)) {
    return parseRules(rule[0], cache, rule[1])
  }

  // Simple object
  if (!cache.has(rule)) {
    cache.set(rule, parseObjectStyles(rule))
  }

  return [cache.get(rule), options]
}

function resolveMatchedPlugins(classCandidate, context) {
  if (context.candidateRuleMap.has(classCandidate)) {
    return [context.candidateRuleMap.get(classCandidate), 'DEFAULT']
  }

  let candidatePrefix = classCandidate
  let negative = false

  if (candidatePrefix[0] === '-') {
    negative = true
    candidatePrefix = candidatePrefix.slice(1)
  }

  for (let [prefix, modifier] of candidatePermutations(candidatePrefix)) {
    if (context.candidateRuleMap.has(prefix)) {
      return [context.candidateRuleMap.get(prefix), negative ? `-${modifier}` : modifier]
    }
  }

  return null
}

function resolveMatches(candidate, context) {
  let [classCandidate, ...variants] = candidate.split(':').reverse()
  let matchedPlugins = resolveMatchedPlugins(classCandidate, context)

  if (matchedPlugins === null) {
    return []
  }

  let pluginHelpers = {
    candidate: classCandidate,
    theme: context.tailwindConfig.theme,
  }

  let matches = []
  let [plugins, modifier] = matchedPlugins

  for (let [sort, plugin] of plugins) {
    if (typeof plugin === 'function') {
      for (let ruleSet of [].concat(plugin(modifier, pluginHelpers))) {
        let [rules, options] = parseRules(ruleSet, context.postCssNodeCache)
        for (let rule of rules) {
          matches.push([{ ...sort, options }, rule])
        }
      }
    } else {
      let ruleSet = plugin
      let [rules, options] = parseRules(ruleSet, context.postCssNodeCache)
      for (let rule of rules) {
        matches.push([{ ...sort, options }, rule])
      }
    }
  }

  for (let variant of variants) {
    matches = applyVariant(variant, matches, context)
  }

  return matches
}

function generateRules(candidates, context) {
  let allRules = []

  for (let candidate of candidates) {
    if (context.notClassCache.has(candidate)) {
      continue
    }

    if (context.classCache.has(candidate)) {
      allRules.push(context.classCache.get(candidate))
      continue
    }

    let matches = resolveMatches(candidate, context)

    if (matches.length === 0) {
      context.notClassCache.add(candidate)
      continue
    }

    context.classCache.set(candidate, matches)
    allRules.push(matches)
  }

  return allRules.flat(1).map(([{ sort, layer }, rule]) => [sort | context.layerOrder[layer], rule])
}

module.exports = {
  resolveMatches,
  generateRules,
}
