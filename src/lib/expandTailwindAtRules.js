const fs = require('fs')
const path = require('path')
const fastGlob = require('fast-glob')
const parseGlob = require('parse-glob')
const sharedState = require('./sharedState')
const generateRules = require('./generateRules')
const { bigSign, toPostCssNode } = require('./utils')

let env = sharedState.env
let contentMatchCache = sharedState.contentMatchCache

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

function buildStylesheet(rules, context) {
  let sortedRules = rules.sort(([a], [z]) => bigSign(a - z))

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

function expandTailwindAtRules(context, registerDependency) {
  return (root) => {
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

    for (let maybeGlob of context.candidateFiles) {
      let {
        is: { glob: isGlob },
        base,
      } = parseGlob(maybeGlob)

      if (isGlob) {
        registerDependency(path.resolve(base), 'context-dependency')
      } else {
        registerDependency(path.resolve(maybeGlob))
      }
    }

    env.DEBUG && console.time('Finding changed files')
    let files = fastGlob.sync(context.candidateFiles)
    for (let file of files) {
      let prevModified = sharedState.fileModifiedCache.get(file) ?? -Infinity
      let modified = fs.statSync(file).mtimeMs

      if (modified > prevModified) {
        context.changedFiles.add(file)
        sharedState.fileModifiedCache.set(file, modified)
      }
    }
    env.DEBUG && console.timeEnd('Finding changed files')

    // ---

    // Find potential rules in changed files
    let candidates = new Set(['*'])
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
    let rules = generateRules(context.tailwindConfig, candidates, context)
    env.DEBUG && console.timeEnd('Generate rules')

    // We only ever add to the classCache, so if it didn't grow, there is nothing new.
    if (context.stylesheetCache === null || context.classCache.size !== classCacheCount) {
      env.DEBUG && console.time('Build stylesheet')
      for (let rule of rules) {
        context.ruleCache.add(rule)
      }

      context.stylesheetCache = buildStylesheet([...context.ruleCache], context)
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
  }
}

module.exports = expandTailwindAtRules
