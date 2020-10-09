const { spawnSync } = require('child_process')
const { embettyBin, run } = require('./_util')
const { version } = require('../package.json')
const assert = require('assert')

describe('CLI', () => {
  it('embetty', async () => {
    const { exitCode, stdout } = await run(embettyBin)
    assert.ok(/Usage: /.test(stdout))
    assert.strictEqual(exitCode, 0)
  })

  it('embetty --help', async () => {
    const { exitCode, stdout } = await run(embettyBin, ['--help'])
    assert.ok(stdout.includes('Usage: embetty <command> [options'))
    assert.strictEqual(exitCode, 0)
  })

  it('embetty --version', async () => {
    const { exitCode, stdout } = await run(embettyBin, ['--version'])
    assert.strictEqual(stdout, version + '\n')
    assert.strictEqual(exitCode, 0)
  })

  it('embetty start --help', async () => {
    const { exitCode, stdout } = await run(embettyBin, ['start', '--help'])
    assert.ok(stdout.includes('Usage: embetty-start [options]'))
    assert.strictEqual(exitCode, 0)
  })

  it('embetty start --port <port>', () => {
    const { stderr } = spawnSync(embettyBin, ['start', '-v', '--port', 8888], { timeout: 3000 })
    assert.ok(stderr.toString().includes('Listening on port 8888'))
  })

  it('embetty start --debug', () => {
    const { stderr } = spawnSync(embettyBin, ['start', '--debug'], { timeout: 3000 })
    const out = stderr.toString()
    assert.ok(out.includes('express:router'))
    assert.ok(out.includes('embetty-base'))
  })

  it('embetty start --cache <cache>', () => {
    const { stderr } = spawnSync(embettyBin, ['start', '-v', '--cache', 'redis://'], { timeout: 3000 })
    assert.ok(stderr.toString().includes('Using Redis cache'))
  })
})
