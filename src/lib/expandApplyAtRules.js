const postcss = require('postcss')
const { resolveMatches } = require('./generateRules')
const { bigSign } = require('./utils')
const escape = require('tailwindcss/lib/util/escapeClassName').default

function buildApplyCache(applyCandidates, context) {
  for (let candidate of applyCandidates) {
    if (context.notClassCache.has(candidate) || context.applyClassCache.has(candidate)) {
      continue
    }

    if (context.classCache.has(candidate)) {
      context.applyClassCache.set(candidate, context.classCache.get(candidate))
      continue
    }

    let matches = Array.from(resolveMatches(candidate, context))

    if (matches.length === 0) {
      context.notClassCache.add(candidate)
      continue
    }

    context.applyClassCache.set(candidate, matches)
  }

  return context.applyClassCache
}

// TODO: Apply `!important` stuff correctly instead of just skipping it
function extractApplyCandidates(params) {
  let candidates = params.split(/[\s\t\n]+/g)

  if (candidates[candidates.length - 1] === '!important') {
    return [candidates.slice(0, -1), true]
  }

  return [candidates, false]
}

function expandApplyAtRules(context) {
  return (root) => {
    let applyCandidates = new Set()

    // Collect all @apply rules and candidates
    let ruleApplies = new Map()
    root.walkAtRules('apply', (rule) => {
      let [candidates, important] = extractApplyCandidates(rule.params)

      if (!ruleApplies.has(rule.parent)) {
        ruleApplies.set(rule.parent, new Set())
      }

      let applies = ruleApplies.get(rule.parent)
      for (let util of candidates) {
        applies.add([util, important])
        applyCandidates.add(util)
      }
      rule.remove()
    })

    // Start the @apply process if we have rules with @apply in them
    if (ruleApplies.size > 0) {
      // Fill up some caches!
      let applyClassCache = buildApplyCache(applyCandidates, context)

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
      function replaceSelector(selector, utilitySelectors, candidate) {
        return selector
          .split(/\s*,\s*/g)
          .map((s) => {
            let replaced = []
            for (let utilitySelector of utilitySelectors.split(/\s*,\s*/g)) {
              let replacedSelector = utilitySelector.replace(`.${escape(candidate)}`, s)
              if (replacedSelector === utilitySelector) {
                continue
              }
              replaced.push(replacedSelector)
            }
            return replaced.join(', ')
          })
          .join(', ')
      }

      for (let [applyParentRule, applyCandidates] of ruleApplies.entries()) {
        let siblings = []
        for (let [applyCandidate, important] of applyCandidates) {
          if (!applyClassCache.has(applyCandidate)) {
            throw apply.error(
              `The \`${applyCandidate}\` class does not exist. If \`${applyCandidate}\` is a custom class, make sure it is defined within a \`@layer\` directive.`
            )
          }

          let rules = applyClassCache.get(applyCandidate)

          for (let [meta, node] of rules) {
            let root = postcss.root({ nodes: [node.clone()] })

            root.walkRules((rule) => {
              rule.selector = replaceSelector(
                applyParentRule.selector,
                rule.selector,
                applyCandidate
              )
              rule.walkDecls((d) => {
                d.important = important
              })
            })

            siblings.push([meta, root.nodes[0]])
          }
        }

        // Inject the rules, sorted, correctly
        for (let [, sibling] of siblings.sort(([a], [z]) => bigSign(z.sort - a.sort))) {
          // `applyParentRule` is referring to the node at `.abc` in: .abc { @apply mt-2 }
          applyParentRule.after(sibling)
        }

        // The node is empty, drop the full node
        if (applyParentRule.nodes.length === 0) {
          applyParentRule.remove()
        }
      }
    }
  }
}

module.exports = expandApplyAtRules
