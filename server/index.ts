import http from 'node:http'
import { spawn } from 'node:child_process'
import express from 'express'
import { createServer as createViteServer } from 'vite'
import { WebSocketServer, type WebSocket } from 'ws'
import { api } from './api.ts'
import { flush, onProgressChange } from './progress.ts'
import { isStarted, parseId } from './problems.ts'
import { getRun, onRunEvent, run } from './runner.ts'
import { startWatcher, subscribe, unsubscribe } from './watcher.ts'
import { rootDir } from './paths.ts'
import { onGitChange, startGitMonitor } from './git.ts'

const host = '127.0.0.1'
const port = Number(process.env.PORT ?? 5180)

const app = express()
const server = http.createServer(app)

app.use('/api', api)

const vite = await createViteServer({
  configFile: `${rootDir}/vite.config.ts`,
  server: { middlewareMode: true, ws: { server } },
  appType: 'spa',
})
app.use(vite.middlewares)

// ---- Live updates -----------------------------------------------------------

const wss = new WebSocketServer({ noServer: true })
const socketSubs = new Map<WebSocket, Set<string>>()

server.on('upgrade', (req, socket, head) => {
  // Vite's HMR socket shares this server; only take ours.
  if (req.url !== '/ws') return
  wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws))
})

const send = (ws: WebSocket, msg: object) => ws.readyState === ws.OPEN && ws.send(JSON.stringify(msg))

wss.on('connection', ws => {
  const subs = new Set<string>()
  socketSubs.set(ws, subs)
  ws.on('message', raw => {
    let msg: { type: string; id: string }
    try {
      msg = JSON.parse(String(raw))
    } catch {
      return
    }
    if (!parseId(msg.id)) return
    if (msg.type === 'subscribe' && !subs.has(msg.id)) {
      subs.add(msg.id)
      subscribe(msg.id)
      // Join a run in progress; otherwise run fresh, since files may have changed while nobody watched.
      const existing = getRun(msg.id)
      if (existing?.status === 'running') send(ws, { type: 'run-snapshot', id: msg.id, run: existing })
      else if (isStarted(msg.id)) run(msg.id)
    } else if (msg.type === 'unsubscribe' && subs.delete(msg.id)) {
      unsubscribe(msg.id)
    }
  })
  ws.on('close', () => {
    subs.forEach(unsubscribe)
    socketSubs.delete(ws)
  })
})

onRunEvent(event => {
  for (const [ws, subs] of socketSubs) if (subs.has(event.id)) send(ws, event)
})

let progressTimer: NodeJS.Timeout | null = null
onProgressChange(() => {
  progressTimer ??= setTimeout(() => {
    progressTimer = null
    for (const ws of socketSubs.keys()) send(ws, { type: 'progress' })
  }, 250)
})

onGitChange(status => {
  for (const ws of socketSubs.keys()) send(ws, { type: 'git', status })
})

// ---- Start ------------------------------------------------------------------

startWatcher()
startGitMonitor(() => socketSubs.size > 0)
server.listen(port, host, () => {
  const url = `http://localhost:${port}`
  console.log(`code-challenge running at ${url}`)
  // Open a browser tab unless one reconnects first (tsx watch restarts the server when its code changes).
  if (process.env.NO_OPEN) return
  setTimeout(() => {
    if (socketSubs.size === 0) spawn('open', [url], { stdio: 'ignore', detached: true }).unref()
  }, 1500)
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    flush()
    process.exit(0)
  })
}
