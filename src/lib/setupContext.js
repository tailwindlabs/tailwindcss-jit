const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')
const chokidar = require('chokidar')
const postcss = require('postcss')
const dlv = require('dlv')
const selectorParser = require('postcss-selector-parser')
const LRU = require('quick-lru')

const transformThemeValue = require('tailwindcss/lib/util/transformThemeValue').default
const parseObjectStyles = require('tailwindcss/lib/util/parseObjectStyles').default
const getModuleDependencies = require('tailwindcss/lib/lib/getModuleDependencies').default

const resolveConfig = require('tailwindcss/resolveConfig')

const sharedState = require('./sharedState')
const corePlugins = require('../corePlugins')
const { isPlainObject, toPostCssNode } = require('./utils')
const { isBuffer } = require('util')

let contextMap = sharedState.contextMap
let env = sharedState.env

// Earmarks a directory for our touch files.
// If the directory already exists we delete any existing touch files,
// invalidating any caches associated with them.

const touchDir = path.join(os.homedir() || os.tmpdir(), '.tailwindcss', 'touch')

if (fs.existsSync(touchDir)) {
  for (let file of fs.readdirSync(touchDir)) {
    fs.unlinkSync(path.join(touchDir, file))
  }
} else {
  fs.mkdirSync(touchDir, { recursive: true })
}

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

function isObject(value) {
  return typeof value === 'object' && value !== null
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0
}

function isString(value) {
  return typeof value === 'string' || value instanceof String
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

let configPathCache = new LRU({ maxSize: 100 })

// Get the config object based on a path
function getTailwindConfig(configOrPath) {
  let userConfigPath = resolveConfigPath(configOrPath)

  if (userConfigPath !== null) {
    let [prevConfig, prevModified = -Infinity] = configPathCache.get(userConfigPath) ?? []
    let modified = fs.statSync(userConfigPath).mtimeMs

    // It hasn't changed (based on timestamp)
    if (modified <= prevModified) {
      return [prevConfig, userConfigPath]
    }

    // It has changed (based on timestamp), or first run
    delete require.cache[userConfigPath]
    let newConfig = resolveConfig(require(userConfigPath))
    configPathCache.set(userConfigPath, [newConfig, modified])
    return [newConfig, userConfigPath]
  }

  // It's a plain object, not a path
  let newConfig = resolveConfig(
    configOrPath.config === undefined ? configOrPath : configOrPath.config
  )

  return [newConfig, null]
}

let fileModifiedMap = new Map()

function trackModified(files) {
  let changed = false

  for (let file of files) {
    let newModified = fs.statSync(file).mtimeMs

    if (!fileModifiedMap.has(file) || newModified > fileModifiedMap.get(file)) {
      changed = true
    }

    fileModifiedMap.set(file, newModified)
  }

  return changed
}

function generateTouchFileName() {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let randomChars = ''
  let randomCharsLength = 12
  let bytes = null

  try {
    bytes = crypto.randomBytes(randomCharsLength)
  } catch (_error) {
    bytes = crypto.pseudoRandomBytes(randomCharsLength)
  }

  for (let i = 0; i < randomCharsLength; i++) {
    randomChars += chars[bytes[i] % chars.length]
  }

  return path.join(touchDir, `touch-${process.pid}-${randomChars}`)
}

function rebootWatcher(context) {
  if (context.touchFile === null) {
    context.touchFile = generateTouchFileName()
    touch(context.touchFile)
  }

  if (env.TAILWIND_MODE === 'build') {
    return
  }

  if (
    env.TAILWIND_MODE === 'watch' ||
    (env.TAILWIND_MODE === undefined && env.NODE_ENV === 'development')
  ) {
    Promise.resolve(context.watcher ? context.watcher.close() : null).then(() => {
      context.watcher = chokidar.watch([...context.candidateFiles, ...context.configDependencies], {
        ignoreInitial: true,
      })

      context.watcher.on('add', (file) => {
        context.changedFiles.add(path.resolve('.', file))
        touch(context.touchFile)
      })

      context.watcher.on('change', (file) => {
        // If it was a config dependency, touch the config file to trigger a new context.
        // This is not really that clean of a solution but it's the fastest, because we
        // can do a very quick check on each build to see if the config has changed instead
        // of having to get all of the module dependencies and check every timestamp each
        // time.
        if (context.configDependencies.has(file)) {
          for (let dependency of context.configDependencies) {
            delete require.cache[require.resolve(dependency)]
          }
          touch(context.configPath)
        } else {
          context.changedFiles.add(path.resolve('.', file))
          touch(context.touchFile)
        }
      })

      context.watcher.on('unlink', (file) => {
        // Touch the config file if any of the dependencies are deleted.
        if (context.configDependencies.has(file)) {
          for (let dependency of context.configDependencies) {
            delete require.cache[require.resolve(dependency)]
          }
          touch(context.configPath)
        }
      })
    })
  }
}

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

function parseLegacyStyles(styles) {
  if (!Array.isArray(styles)) {
    return parseLegacyStyles([styles])
  }

  return styles.flatMap((style) => {
    let isNode = !Array.isArray(style) && !isPlainObject(style)
    return isNode ? style : parseObjectStyles(style)
  })
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

function toRuleTuple(node) {
  if (node.type === 'atrule') {
    return [`@${node.name} ${node.params}`, node.nodes.map(toRuleTuple)]
  }

  if (node.type === 'rule') {
    let decls = Object.fromEntries(
      node.nodes.map(({ prop, value }) => {
        return [prop, value]
      })
    )
    return [node.selector, decls]
  }
}

function extractCandidates(node) {
  let classes = node.type === 'rule' ? getClasses(node.selector) : []

  if (node.type === 'atrule') {
    node.walkRules((rule) => {
      classes = [...classes, ...getClasses(rule.selector)]
    })
  }

  return classes
}

// { .foo { color: black } }
// => [ ['foo', ['.foo', { color: 'black' }] ]
function toStaticRuleArray(legacyStyles) {
  return parseLegacyStyles(legacyStyles).flatMap((node) => {
    let nodeMap = new Map()
    let candidates = extractCandidates(node)

    // If this isn't "on-demandable", assign it a universal candidate.
    if (candidates.length === 0) {
      return [['*', toRuleTuple(node)]]
    }

    return candidates.map((c) => {
      if (!nodeMap.has(node)) {
        nodeMap.set(node, toRuleTuple(node))
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
    return prefixSelector(tailwindConfig.prefix, selector)
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

        if (!context.componentMap.has(identifier)) {
          context.componentMap.set(identifier, [])
        }

        context.componentMap.get(identifier).push([{ sort: offset, layer: 'components' }, tuple])
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

        if (!context.utilityMap.has(identifier)) {
          context.utilityMap.set(identifier, [])
        }

        context.utilityMap.get(identifier).push([{ sort: offset, layer: 'utilities' }, tuple])
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

          let withOffsets = value.map((tuple) => [{ sort: offset, layer: 'components' }, tuple])

          if (!context.componentMap.has(identifier)) {
            context.componentMap.set(identifier, [])
          }

          context.componentMap.get(identifier).push(...withOffsets)
        }
      },
      addUtilities(utilities) {
        let offset = offsets.utilities++

        for (let identifier in utilities) {
          let value = [].concat(utilities[identifier])

          let withOffsets = value.map((tuple) => [{ sort: offset, layer: 'utilities' }, tuple])

          if (!context.utilityMap.has(identifier)) {
            context.utilityMap.set(identifier, [])
          }

          context.utilityMap.get(identifier).push(...withOffsets)
        }
      },
    },
  }
}

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

function cleanupContext(context) {
  if (context.watcher) {
    context.watcher.close()
  }
}

// Retrieve an existing context from cache if possible (since contexts are unique per
// source path), or set up a new one (including setting up watchers and registering
// plugins) then return it
function setupContext(configOrPath) {
  return (result, root) => {
    let sourcePath = result.opts.from
    let [tailwindConfig, userConfigPath] = getTailwindConfig(configOrPath)

    let contextDependencies = new Set()
    contextDependencies.add(sourcePath)

    if (userConfigPath !== null) {
      contextDependencies.add(userConfigPath)
    }

    for (let message of result.messages) {
      if (message.type === 'dependency') {
        contextDependencies.add(message.file)
      }
    }

    let contextDependenciesChanged =
      trackModified([...contextDependencies]) || userConfigPath === null

    process.env.DEBUG && console.log('Source path:', sourcePath)
    if (contextMap.has(sourcePath) && !contextDependenciesChanged) {
      return contextMap.get(sourcePath)
    }

    if (contextMap.has(sourcePath)) {
      cleanupContext(contextMap.get(sourcePath))
    }

    process.env.DEBUG && console.log('Setting up new context...')

    let context = {
      changedFiles: new Set(),
      ruleCache: new Set(),
      watcher: null,
      scannedContent: false,
      touchFile: null,
      classCache: new Map(),
      notClassCache: new Set(),
      postCssNodeCache: new Map(),
      componentMap: new Map(),
      utilityMap: new Map(),
      baseRules: new Set(),
      configPath: userConfigPath,
      sourcePath: sourcePath,
      tailwindConfig: tailwindConfig,
      configDependencies: new Set(),
      candidateFiles: Array.isArray(tailwindConfig.purge)
        ? tailwindConfig.purge
        : tailwindConfig.purge.content,
      variantMap: new Map(),
      stylesheetCache: null,
    }
    contextMap.set(sourcePath, context)

    if (userConfigPath !== null) {
      for (let dependency of getModuleDependencies(userConfigPath)) {
        if (dependency.file === userConfigPath) {
          continue
        }

        context.configDependencies.add(dependency.file)
      }
    }

    rebootWatcher(context)

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

    let layerPlugins = []

    // Walk @layer rules and treat them like plugins
    root.walkAtRules('layer', (layerNode) => {
      if (layerNode.params === 'base') {
        for (let node of layerNode.nodes) {
          layerPlugins.push(function ({ addBase }) {
            addBase(node)
          })
        }
      }
      if (layerNode.params === 'components') {
        for (let node of layerNode.nodes) {
          layerPlugins.push(function ({ addComponents }) {
            addComponents(node)
          })
        }
      }
      if (layerNode.params === 'utilities') {
        for (let node of layerNode.nodes) {
          layerPlugins.push(function ({ addUtilities }) {
            addUtilities(node)
          })
        }
      }
    })

    registerPlugins(
      context.tailwindConfig,
      [...corePluginList, ...userPlugins, ...layerPlugins],
      context
    )

    return context
  }
}

module.exports = setupContext
