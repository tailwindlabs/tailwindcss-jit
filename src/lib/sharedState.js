let env = {
  TAILWIND_MODE: process.env.TAILWIND_MODE,
  NODE_ENV: process.env.NODE_ENV,
  DEBUG: process.env.DEBUG !== undefined,
}

module.exports = {
  env,
  contextMap: new Map(),
}
