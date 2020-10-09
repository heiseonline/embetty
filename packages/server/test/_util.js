const { spawn } = require('child_process')
const path = require('path')

module.exports = class Util {
  static get embettyBin() {
    return path.resolve(__dirname, '../bin/embetty')
  }

  static run(command, args = []) {
    return new Promise((resolve, reject) => {
      let stdout = ''

      const cmd = spawn(command, args)

      cmd.stdout.on('data', (d) => {
        stdout += d.toString()
      })

      cmd.on('close', (exitCode) => {
        if (exitCode === 0) return resolve({ cmd, exitCode, stdout })
        const error = new Error(exitCode)
        error.stdout = stdout
        error.exitCode = exitCode
        reject(error)
      })

      cmd.on('error', reject)
    })
  }
}
