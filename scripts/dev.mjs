// Frees port 3004 (kills any stale process holding it) and then starts Next.js
// dev on that exact port. Avoids "terminal colgada / puerto ocupado" on Windows.
import { execSync, spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const PORT = process.env.PORT || '3004'
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function killPort(port) {
  try {
    if (process.platform === 'win32') {
      // Find PIDs LISTENING on the port and kill them.
      const out = execSync(`netstat -ano | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
      const pids = new Set()
      for (const line of out.split(/\r?\n/)) {
        if (!line.toUpperCase().includes('LISTENING')) continue
        const pid = line.trim().split(/\s+/).pop()
        if (pid && pid !== '0') pids.add(pid)
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F /T`, { stdio: 'ignore' })
          console.log(`[dev] Puerto ${port} liberado (PID ${pid} terminado)`)
        } catch {
          /* already gone */
        }
      }
    } else {
      execSync(`lsof -ti:${port} | xargs -r kill -9`, { stdio: 'ignore' })
    }
  } catch {
    // No process was using the port — nothing to do.
  }
}

killPort(PORT)

// Launch the Next.js CLI directly with the current Node binary (no cmd.exe / npx
// in between). This keeps `next` as a direct child so Ctrl+C propagates cleanly
// and never leaves an orphan process holding the port.
const nextBin = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next')
const child = spawn(process.execPath, [nextBin, 'dev', '-p', PORT], {
  stdio: 'inherit',
  cwd: projectRoot,
})

// Forward termination so closing the terminal kills the WHOLE tree. Next.js
// (Turbopack) forks a worker that holds the port; killing only the direct child
// would leave that worker orphaned on the port.
function shutdown() {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${child.pid} /F /T`, { stdio: 'ignore' })
    } else {
      child.kill('SIGTERM')
    }
  } catch {
    /* already gone */
  }
}

for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sig, shutdown)
}

child.on('exit', (code) => process.exit(code ?? 0))
