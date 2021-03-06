const LRU = require('quick-lru')

module.exports = {
  env: {
    TAILWIND_MODE: process.env.TAILWIND_MODE,
    NODE_ENV: process.env.NODE_ENV,
    DEBUG: process.env.DEBUG !== undefined,
  },
  contextMap: new Map(),
  configContextMap: new Map(),
  contextSourcesMap: new Map(),
  contentMatchCache: new LRU({ maxSize: 25000 }),
}
