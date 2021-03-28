const fs = require("fs")
const path = require("path")
const postcss = require("postcss")
const tailwind = require("../src/index.js")
const configPath = path.resolve(__dirname, './rebuilds.tailwind.config.js')

function run(input, config = {}, from = null) {
  from = from || path.resolve(__filename)

  return postcss([tailwind(config)]).process(input, { from })
}

async function runTest() {
  let messages = []
  let config1 = {
    darkMode: 'class',
    purge: [path.resolve(__dirname, './rebuilds.test.html')],
    corePlugins: { preflight: false },
    theme: {
      colors: { plorange: 'orange' },
    },
    plugins: [],
  }

  let config2 = {
    ...config1,
    theme: {
      colors: { plorange: 'purple' },
    },
  }

  let from = path.resolve(__filename)
  let css = `
    @tailwind utilities;
    body { @apply bg-plorange; }
  `

  fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(config1)};`)

  let results = [
    await run(css, configPath, `${from}?id=1`),
    await run(css, configPath, `${from}?id=2`),
  ]

  results.forEach(result => {
    messages.push({
      css: result.css,
    })
  })

  await new Promise(resolve => setTimeout(resolve, 100))

  fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(config2)};`)

  results = [
    await run(css, configPath, `${from}?id=1`),
    await run(css, configPath, `${from}?id=2`),
  ]

  results.forEach(result => {
    messages.push({
      css: result.css,
    })
  })

  process.stdout.write(JSON.stringify(messages))
}

runTest().finally(() => {
  fs.unlinkSync(configPath)
})
