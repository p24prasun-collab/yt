import { spawn, exec } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const FRONTEND_DIR = resolve(__dirname, '..')
const PROJECT_ROOT = resolve(FRONTEND_DIR, '..')
const BACKEND_DIR = resolve(PROJECT_ROOT, 'backend')

const venvPython = resolve(PROJECT_ROOT, 'venv', 'bin', 'python')
const pythonCmd = venvPython

async function killPort(port) {
  try {
    // macOS/Linux
    const { stdout } = await execAsync(`lsof -ti:${port}`)
    const pids = stdout.trim().split('\n').filter(Boolean)
    for (const pid of pids) {
      try {
        await execAsync(`kill -9 ${pid}`)
        console.log(`   Killed process ${pid} on port ${port}`)
      } catch {}
    }
    // Wait a moment for port to be released
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  } catch {
    // Port not in use
    return false
  }
}

async function checkBackendReady(maxRetries = 60) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('http://localhost:8000/api/health', { method: 'GET' })
      if (response.ok) {
        return true
      }
    } catch {
      // Not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return false
}

async function startBackend() {
  console.log('➜ Checking port 8000...')
  await killPort(8000)
  
  console.log('➜ Starting backend on http://localhost:8000 …')
  const proc = spawn(pythonCmd, ['main.py'], {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    env: process.env,
  })
  
  proc.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.log(`⚠️  Backend exited with code ${code}`)
    }
  })
  
  proc.on('error', (err) => {
    console.error('❌ Backend process error:', err)
  })
  
  return proc
}

function startFrontend() {
  console.log('➜ Starting frontend on http://localhost:5173 …')
  const proc = spawn('npm', ['run', 'dev:client'], {
    cwd: FRONTEND_DIR,
    stdio: 'inherit',
    env: { ...process.env, BROWSER: 'open' },
  })
  return proc
}

async function openBrowser() {
  // Wait a bit for Vite to be ready, then open browser
  await new Promise(resolve => setTimeout(resolve, 3000))
  try {
    const { default: open } = await import('open')
    await open('http://localhost:5173/influencers?g=male')
    console.log('✅ Browser opened!')
  } catch (err) {
    console.log('⚠️  Could not auto-open browser. Please visit: http://localhost:5173/influencers?g=male')
  }
}

async function main() {
  const backend = await startBackend()

  // Wait for backend to be ready using custom check
  console.log('➜ Waiting for backend to be ready...')
  const isReady = await checkBackendReady()
  
  if (!isReady) {
    console.error('❌ Backend failed to start within timeout')
    if (backend && !backend.killed) {
      backend.kill('SIGTERM')
    }
    process.exit(1)
  }
  
  console.log('✅ Backend is ready!')

  const frontend = startFrontend()
  
  // Open browser after a delay
  openBrowser()

  const cleanup = () => {
    console.log('\n🛑 Shutting down...')
    if (backend && !backend.killed) {
      backend.kill('SIGTERM')
    }
    if (frontend && !frontend.killed) {
      frontend.kill('SIGTERM')
    }
    setTimeout(() => {
      if (backend && !backend.killed) {
        backend.kill('SIGKILL')
      }
      if (frontend && !frontend.killed) {
        frontend.kill('SIGKILL')
      }
      process.exit(0)
    }, 2000)
  }
  
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

main().catch((err) => {
  console.error('❌ Failed to start dev environment:', err)
  process.exit(1)
})
