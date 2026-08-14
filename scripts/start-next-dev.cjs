const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

const root = path.resolve(__dirname, "..")
const out = fs.createWriteStream(path.join(root, "dev-server.log"), { flags: "a" })
const err = fs.createWriteStream(path.join(root, "dev-server.err.log"), { flags: "a" })

const child = spawn(
  process.execPath,
  [path.join(root, "node_modules", "next", "dist", "bin", "next"), "dev", "-H", "127.0.0.1", "-p", "3000"],
  {
    cwd: root,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    windowsHide: true,
  },
)

child.stdout.pipe(out)
child.stderr.pipe(err)

child.on("exit", (code, signal) => {
  const line = `[dev-wrapper] next exited code=${code ?? ""} signal=${signal ?? ""}\n`
  out.write(line)
  err.write(line)
  process.exit(code ?? 0)
})

process.on("SIGTERM", () => child.kill("SIGTERM"))
process.on("SIGINT", () => child.kill("SIGINT"))
