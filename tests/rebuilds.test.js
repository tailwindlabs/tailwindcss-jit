const path = require('path')
const process = require('child_process')
const { promisify } = require('util')
const exec = promisify(process.exec)

test('builds with multiple sources handle config file changes', async () => {
  const filepath = path.resolve(__dirname, './rebuild.worker.js')

  const { stdout } = await exec(`node ${filepath}`)

  const results = JSON.parse(stdout.trim())
  expect(results[0].css).toMatchCss(`
    body {
      --tw-bg-opacity: 1;
      background-color: rgba(255, 165, 0, var(--tw-bg-opacity));
    }
  `)
  expect(results[1].css).toMatchCss(`
    body {
      --tw-bg-opacity: 1;
      background-color: rgba(255, 165, 0, var(--tw-bg-opacity));
    }
  `)
  expect(results[2].css).toMatchCss(`
    body {
      --tw-bg-opacity: 1;
      background-color: rgba(128, 0, 128, var(--tw-bg-opacity));
    }
  `)
  expect(results[3].css).toMatchCss(`
    body {
      --tw-bg-opacity: 1;
      background-color: rgba(128, 0, 128, var(--tw-bg-opacity));
    }
  `)
})
