const fs = require('fs')
const path = require('path')

const tmp = require('tmp')
const postcss = require('postcss')
const chokidar = require('chokidar')
const fastGlob = require('fast-glob')
const hash = require('object-hash')
const LRU = require('quick-lru')
const dlv = require('dlv')
const Node = require('postcss/lib/node')
const selectorParser = require('postcss-selector-parser')

const resolveConfig = require('tailwindcss/resolveConfig')
const escape = require('tailwindcss/lib/util/escapeClassName').default
const evaluateTailwindFunctions = require('tailwindcss/lib/lib/evaluateTailwindFunctions').default
const substituteScreenAtRules = require('tailwindcss/lib/lib/substituteScreenAtRules').default
const parseObjectStyles = require('tailwindcss/lib/util/parseObjectStyles').default
const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const prefixSelector = require('tailwindcss/lib/util/prefixSelector').default

const corePlugins = require('./corePlugins')

let env = {
  TAILWIND_MODE: process.env.TAILWIND_MODE,
  NODE_ENV: process.env.NODE_ENV,
  DEBUG: process.env.DEBUG !== undefined,
}

function sign(bigIntValue) {
  return (bigIntValue > 0n) - (bigIntValue < 0n)
}

// ---

// This is used to trigger rebuilds. Just updating the timestamp
// is significantly faster than actually writing to the file (10x).

function touch(filename) {
  let time = new Date()

  try {
    fs.utimesSync(filename, time, time)
  } catch (err) {
    fs.closeSync(fs.openSync(filename, 'w'))
  }
}

// ---

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

function insertInto(list, value, { before = [] } = {}) {
  if (before.length <= 0) {
    list.push(value)
    return
  }

  let idx = list.length - 1
  for (let other of before) {
    let iidx = list.indexOf(other)
    if (iidx === -1) continue
    idx = Math.min(idx, iidx)
  }

  list.splice(idx, 0, value)
}

// ---

function cleanupContext(context) {
  if (context.watcher) {
    context.watcher.close()
  }
  contextMap.delete(context.configHash)
  contextSources.delete(context)
}

function rebootTemplateWatcher(context) {
  if (env.TAILWIND_MODE === 'build') {
    return
  }

  if (
    env.TAILWIND_MODE === 'watch' ||
    (env.TAILWIND_MODE === undefined && env.NODE_ENV === 'development')
  ) {
    context.touchFile = context.touchFile !== null ? context.touchFile : tmp.fileSync()

    Promise.resolve(context.watcher ? context.watcher.close() : null).then(() => {
      context.watcher = chokidar.watch(context.candidateFiles, {
        ignoreInitial: true,
      })

      context.watcher.on('add', (file) => {
        context.changedFiles.add(path.resolve('.', file))
        touch(context.touchFile.name)
      })

      context.watcher.on('change', (file) => {
        context.changedFiles.add(path.resolve('.', file))
        touch(context.touchFile.name)
      })
    })
  }
}

function parseLegacyStyles(styles) {
  if (!Array.isArray(styles)) {
    return parseLegacyStyles([styles])
  }

  return styles.flatMap((style) => (style instanceof Node ? style : parseObjectStyles(style)))
}

function getClasses(selector) {
  let parser = selectorParser((selectors) => {
    let allClasses = []
    selectors.walkClasses((classNode) => {
      allClasses.push(classNode.value)
    })
    return allClasses
  })
  return parser.transformSync(selector)
}

function toPath(value) {
  if (Array.isArray(value)) {
    return value
  }

  let inBrackets = false
  let parts = []
  let chunk = ''

  for (let i = 0; i < value.length; i++) {
    let char = value[i]
    if (char === '[') {
      inBrackets = true
      parts.push(chunk)
      chunk = ''
      continue
    }
    if (char === ']' && inBrackets) {
      inBrackets = false
      parts.push(chunk)
      chunk = ''
      continue
    }
    if (char === '.' && !inBrackets && chunk.length > 0) {
      parts.push(chunk)
      chunk = ''
      continue
    }
    chunk = chunk + char
  }

  if (chunk.length > 0) {
    parts.push(chunk)
  }

  return parts
}

// { .foo { color: black } }
// => [ ['foo', ['.foo', { color: 'black' }] ]
function toStaticRuleArray(legacyStyles) {
  return parseLegacyStyles(legacyStyles).flatMap((node) => {
    let nodeMap = new Map()
    let classes = getClasses(node.selector)
    return classes.map((c) => {
      if (!nodeMap.has(node)) {
        let decls = Object.fromEntries(
          node.nodes.map(({ prop, value }) => {
            return [prop, value]
          })
        )
        nodeMap.set(node, [node.selector, decls])
      }
      return [c, nodeMap.get(node)]
    })
  })
}

function buildPluginApi(tailwindConfig, context, { variantList, variantMap, offsets }) {
  function getConfigValue(path, defaultValue) {
    return path ? dlv(tailwindConfig, path, defaultValue) : tailwindConfig
  }

  function applyConfiguredPrefix(selector) {
    return prefixSelector(config.prefix, selector)
  }

  return {
    // Classic plugin API
    addVariant() {
      throw new Error(`Variant plugins aren't supported yet`)
    },
    postcss,
    prefix: applyConfiguredPrefix,
    e: escape,
    config: getConfigValue,
    theme(path, defaultValue) {
      const [pathRoot, ...subPaths] = toPath(path)
      const value = getConfigValue(['theme', pathRoot, ...subPaths], defaultValue)
      return transformThemeValue(pathRoot)(value)
    },
    corePlugins: (path) => {
      if (Array.isArray(tailwindConfig.corePlugins)) {
        return tailwindConfig.corePlugins.includes(path)
      }

      return getConfigValue(['corePlugins', path], true)
    },
    variants: (path, defaultValue) => {
      if (Array.isArray(tailwindConfig.variants)) {
        return tailwindConfig.variants
      }

      return getConfigValue(['variants', path], defaultValue)
    },
    addBase(styles) {
      let nodes = parseLegacyStyles(styles)
      for (let node of nodes) {
        context.baseRules.add(node)
      }
    },
    addComponents(components, options) {
      let defaultOptions = {
        variants: [],
        respectPrefix: true,
        respectImportant: false,
        respectVariants: true,
      }

      options = Object.assign(
        {},
        defaultOptions,
        Array.isArray(options) ? { variants: options } : options
      )

      for (let [identifier, tuple] of toStaticRuleArray(components)) {
        let offset = offsets.components++

        if (context.componentMap.has(identifier)) {
          context.componentMap.get(identifier).push([offset, tuple])
        } else {
          context.componentMap.set(identifier, [[offset, tuple]])
        }
      }
    },
    addUtilities(utilities, options) {
      let defaultOptions = {
        variants: [],
        respectPrefix: true,
        respectImportant: true,
        respectVariants: true,
      }

      options = Object.assign(
        {},
        defaultOptions,
        Array.isArray(options) ? { variants: options } : options
      )

      for (let [identifier, tuple] of toStaticRuleArray(utilities)) {
        let offset = offsets.utilities++

        if (context.utilityMap.has(identifier)) {
          context.utilityMap.get(identifier).push([offset, tuple])
        } else {
          context.utilityMap.set(identifier, [[offset, tuple]])
        }
      }
    },
    // ---
    jit: {
      e: escape,
      config: tailwindConfig,
      theme: tailwindConfig.theme,
      addVariant(variantName, applyVariant, options = {}) {
        insertInto(variantList, variantName, options)
        variantMap.set(variantName, applyVariant)
      },
      addComponents(components) {
        let offset = offsets.components++

        for (let identifier in components) {
          let value = components[identifier]

          let withOffsets = value.map((tuple) => [offset, tuple])

          if (context.componentMap.has(identifier)) {
            context.componentMap.get(identifier).push(...withOffsets)
          } else {
            context.componentMap.set(identifier, withOffsets)
          }
        }
      },
      addUtilities(utilities) {
        let offset = offsets.utilities++

        for (let identifier in utilities) {
          let value = [].concat(utilities[identifier])

          let withOffsets = value.map((plugin) => [offset, plugin])

          if (context.utilityMap.has(identifier)) {
            context.utilityMap.get(identifier).push(...withOffsets)
          } else {
            context.utilityMap.set(identifier, withOffsets)
          }
        }
      },
    },
  }
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

function registerPlugins(tailwindConfig, plugins, context) {
  let variantList = []
  let variantMap = new Map()
  let offsets = {
    components: 0n,
    utilities: 0n,
  }

  let pluginApi = buildPluginApi(tailwindConfig, context, {
    variantList,
    variantMap,
    offsets,
  })

  for (let plugin of plugins) {
    if (Array.isArray(plugin)) {
      for (let pluginItem of plugin) {
        pluginItem(pluginApi)
      }
    } else {
      plugin(pluginApi)
    }
  }

  let highestOffset =
    offsets.utilities > offsets.components ? offsets.utilities : offsets.components
  let reservedBits = BigInt(highestOffset.toString(2).length)

  context.layerOrder = {
    base: (1n << reservedBits) << 0n,
    components: (1n << reservedBits) << 1n,
    utilities: (1n << reservedBits) << 2n,
  }

  reservedBits += 3n
  context.variantOrder = variantList.reduce(
    (map, variant, i) => map.set(variant, (1n << BigInt(i)) << reservedBits),
    new Map()
  )

  context.minimumScreen = [...context.variantOrder.values()].shift()

  // Build variantMap
  for (let [variantName, variantFunction] of variantMap.entries()) {
    let sort = context.variantOrder.get(variantName)
    context.variantMap.set(variantName, [sort, variantFunction])
  }
}

function isObject(value) {
  return typeof value === 'object' && value !== null
}

function isPlainObject(value) {
  return isObject(value) && !Array.isArray(value)
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0
}

function isString(value) {
  return typeof value === 'string' || value instanceof String
}

function resolveConfigPath(pathOrConfig) {
  // require('tailwindcss')({ theme: ..., variants: ... })
  if (isObject(pathOrConfig) && pathOrConfig.config === undefined && !isEmpty(pathOrConfig)) {
    return null
  }

  // require('tailwindcss')({ config: 'custom-config.js' })
  if (
    isObject(pathOrConfig) &&
    pathOrConfig.config !== undefined &&
    isString(pathOrConfig.config)
  ) {
    return path.resolve(pathOrConfig.config)
  }

  // require('tailwindcss')({ config: { theme: ..., variants: ... } })
  if (
    isObject(pathOrConfig) &&
    pathOrConfig.config !== undefined &&
    isObject(pathOrConfig.config)
  ) {
    return null
  }

  // require('tailwindcss')('custom-config.js')
  if (isString(pathOrConfig)) {
    return path.resolve(pathOrConfig)
  }

  // require('tailwindcss')
  for (const configFile of ['./tailwind.config.js', './tailwind.config.cjs']) {
    try {
      const configPath = path.resolve(configFile)
      fs.accessSync(configPath)
      return configPath
    } catch (err) {}
  }

  return null
}

let contentMatchCache = new LRU({ maxSize: 25000 })
let configPathCache = new LRU({ maxSize: 100 })

let contextMap = new Map()
let sourceContextMap = new Map()
let contextSources = new Map()

// Retrieve an existing context from cache if possible (since contexts are unique per
// config object), or set up a new one (including setting up watchers and registering
// plugins) then return it
function setupContext(tailwindConfig, configHash, configPath) {
  if (contextMap.has(configHash)) {
    return contextMap.get(configHash)
  }

  let context = {
    changedFiles: new Set(),
    utilityRuleCache: new Set(),
    componentRuleCache: new Set(),
    watcher: null,
    scannedContent: false,
    touchFile: null,
    classCache: new Map(),
    notClassCache: new Set(),
    postCssNodeCache: new Map(),
    componentMap: new Map(),
    utilityMap: new Map(),
    baseRules: new Set(),
    configPath: configPath,
    configHash: configHash,
    tailwindConfig: tailwindConfig,
    candidateFiles: Array.isArray(tailwindConfig.purge)
      ? tailwindConfig.purge
      : tailwindConfig.purge.content,
    variantMap: new Map(),
    stylesheetCache: {
      components: [],
      utilities: [],
      screens: [],
    },
  }
  contextMap.set(configHash, context)

  rebootTemplateWatcher(context)

  let corePluginList = Object.entries(corePlugins)
    .map(([name, plugin]) => {
      // TODO: Make variants a real core plugin so we don't special case it
      if (name === 'variants') {
        return plugin
      }

      if (!tailwindConfig.corePlugins.includes(name)) {
        return null
      }

      return plugin
    })
    .filter(Boolean)

  let userPlugins = tailwindConfig.plugins.map((plugin) => {
    if (plugin.__isOptionsFunction) {
      plugin = plugin()
    }

    return typeof plugin === 'function' ? plugin : plugin.handler
  })

  registerPlugins(context.tailwindConfig, [...corePluginList, ...userPlugins], context)

  return context
}

module.exports = (pluginOptions = {}) => {
  // Get the config object based on a path
  function getTailwindConfig(userConfigPath) {
    if (userConfigPath !== null) {
      let [prevConfig, prevModified = -Infinity, configHash] =
        configPathCache.get(userConfigPath) ?? []
      let modified = fs.statSync(userConfigPath).mtimeMs

      // It hasn't changed (based on timestamp)
      // TODO: This will be invalid once we start looking at config dependencies, but if
      // we don't figure out a way to reuse unchanged config files we have to re-resolve
      // on every build.
      if (modified <= prevModified) {
        return [prevConfig, configHash]
      }

      // It has changed (based on timestamp), or first run
      delete require.cache[userConfigPath]
      let newConfig = resolveConfig(require(userConfigPath))
      configHash = hash(newConfig)
      configPathCache.set(userConfigPath, [newConfig, modified, configHash])
      return [newConfig, configHash]
    }

    // It's a plain object, not a path
    let newConfig = resolveConfig(
      pluginOptions.config === undefined ? pluginOptions : pluginOptions.config
    )
    let configHash = hash(newConfig)

    return [newConfig, configHash]
  }

  // This function takes a source path (like /Users/elonmusk/Projects/mars-landing/tailwind.css)
  // and the current context being used for that path and makes sure we do any necessary clean up.
  // It checks to see if this path is using a different context than it was before, and if so,
  // it checks to see if that old context is still being used by anything else. If it's not, the
  // old context is cleaned up and destroyed.
  //
  // Probably still a memory leak here somewhere in weird situations I haven't thought of.
  function updateSourceContext(sourcePath, newContext) {
    let oldContext = sourceContextMap.get(sourcePath)

    if (oldContext === newContext) {
      return
    }

    if (contextSources.has(oldContext)) {
      // Remove the source path from the list of sources associated with this source path
      let sources = contextSources.get(oldContext)
      sources.delete(sourcePath)

      // If the old context is no longer used, clean it up
      if (sources.size === 0) {
        cleanupContext(oldContext)
      }
    }

    if (!contextSources.has(newContext)) {
      contextSources.set(newContext, new Set())
    }

    let newSources = contextSources.get(newContext)
    newSources.add(sourcePath)
    sourceContextMap.set(sourcePath, newContext)
  }

  // Given a source path (~/my-project/tailwind.css), sets up and returns the context
  function getContext(sourcePath) {
    let userConfigPath = resolveConfigPath(pluginOptions)
    let [config, configHash] = getTailwindConfig(userConfigPath)
    let context = setupContext(config, configHash, userConfigPath)

    // Track which context this source is using and clean up old context if necessary
    updateSourceContext(sourcePath, context)

    return context
  }

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

        let context = getContext(result.opts.from)

        if (context.configPath !== null) {
          registerDependency(context.configPath)
        }

        return postcss([
          // substituteTailwindAtRules
          function (root) {
            // Make sure this file contains Tailwind directives. If not, we can save
            // a lot of work and bail early. Also we don't have to register our touch
            // file as a dependency since the output of this CSS does not depend on
            // the source of any templates. Think Vue <style> blocks for example.
            let foundTailwind = false
            let layerNodes = {
              base: null,
              components: null,
              utilities: null,
              screens: null,
            }

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
              registerDependency(context.touchFile.name)
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
              console.log('Active contexts: ', contextMap.size)
              console.log('Active sources:', sourceContextMap.size)
              console.log('Context source size: ', contextSources.size)
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
