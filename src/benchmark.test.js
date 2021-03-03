const prettier = require('prettier')
const diff = require('jest-diff').default
const postcss = require('postcss')
const tailwind = require('./index.js')
const fs = require('fs/promises')
const path = require('path')
const _ = require('lodash')

function run(input, config = {}) {
  return postcss([tailwind(config)]).process(input, { from: undefined })
}

/**
 *
 * @param {number} count
 */
async function createTestFiles(count) {
  const ns = Math.random().toString(16).substr(2, 8)
  const testDir = path.normalize(path.join(__dirname, `/../.test/${ns}`))

  const utilities = (() => {
    const prefixes = _.shuffle(["", "sm:", "hover:", "active:"])
    const types = _.shuffle(["h-", "mt-", "max-w-", "foobar-"])
    const suffixes = _.shuffle([_.range(0, 1000), "full", "screen"])
    const utilities = []

    for (let prefix in prefixes) for (let type in types) for (let suffix in suffixes) {
      utilities.push(`${prefix}${type}${suffix}`)
    }

    return utilities
  })()

  async function createCandidateFile(id) {
    const content = utilities.slice(
      Math.floor(Math.random() * utilities.length / 4),
      Math.floor(Math.random() * utilities.length)
    ).join("\n")

    await fs.writeFile(path.resolve(testDir, `bench_${id}`), content, "utf-8")
  }

  await fs.mkdir(testDir, { recursive: true })
  await Promise.all(_.range(0, count).map(n => createCandidateFile(n)))

  return testDir
}

async function bench(count, callback) {
  const start = performance.now()

  for (let i = 0; i < count; i++) {
    await callback();
  }

  const end = performance.now()

  return (end-start) / count;
}

test('bechmark', async () => {
  const runPerfTest = async (dir) => {
    const config = { purge: [`${dir}/*.css`] }
    const content = '@tailwind utilities;'

    try {
      return await bench(100, () => run(content, config))
    } finally {
      await fs.rm(dir, { recursive: true, force: true })
    }
  }

  const small = await runPerfTest(await createTestFiles(1e1))
  const medium = await runPerfTest(await createTestFiles(1e3))
  const large = await runPerfTest(await createTestFiles(1e4))

  console.log({small, medium, large})

  expect(small).toBeLessThan(20)
  expect(medium).toBeLessThan(20)
  expect(large).toBeLessThan(20)
})
