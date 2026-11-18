import type { Detail, Overview, PublicSettings, ServerMessage } from './types'

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${url}`, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `${method} ${url} failed (${res.status})`)
  return res.headers.get('content-type')?.includes('json') ? res.json() : (res.text() as T)
}

const p = (id: string) => `/problems/${encodeURIComponent(id)}`

type WithWarning = { detail: Detail; warning?: string }

export const api = {
  overview: () => request<Overview>('GET', '/overview'),
  fetchYearNames: (year: number) => request('POST', `/aoc/${year}/names`),
  problem: (id: string) => request<Detail>('GET', p(id)),
  start: (id: string) => request<WithWarning>('POST', `${p(id)}/start`),
  update: (id: string, patch: object) => request<WithWarning>('PATCH', p(id), patch),
  fetchAnswers: (id: string) => request<WithWarning>('POST', `${p(id)}/answers/fetch`),
  fetchInput: (id: string) => request<WithWarning>('POST', `${p(id)}/input/fetch`),
  addTest: (id: string) => request<{ detail: Detail }>('POST', `${p(id)}/tests`),
  saveTest: (id: string, testId: string, patch: { name?: string; content?: string }) =>
    request('PUT', `${p(id)}/tests/${testId}`, patch),
  deleteTest: (id: string, testId: string) => request<{ detail: Detail }>('DELETE', `${p(id)}/tests/${testId}`),
  createVis: (id: string) => request<{ detail: Detail }>('POST', `${p(id)}/vis`),
  data: (id: string) => request<string>('GET', `${p(id)}/data`),
  openEditor: (id: string, file: 'solution' | 'vis' = 'solution') => request('POST', `${p(id)}/open`, { file }),
  run: (id: string) => request('POST', `${p(id)}/run`),
  stop: (id: string) => request('POST', `${p(id)}/stop`),
  settings: () => request<PublicSettings>('GET', '/settings'),
  saveSettings: (patch: object) => request<PublicSettings>('PUT', '/settings', patch),
}

// ---- WebSocket ----------------------------------------------------------------

type Handler = (msg: ServerMessage) => void

let socket: WebSocket | null = null
const handlers = new Set<Handler>()
const subscriptions = new Map<string, number>()

function connect() {
  socket = new WebSocket(`ws://${location.host}/ws`)
  socket.onopen = () => subscriptions.forEach((_, id) => socket!.send(JSON.stringify({ type: 'subscribe', id })))
  socket.onmessage = e => handlers.forEach(h => h(JSON.parse(e.data)))
  socket.onclose = () => setTimeout(connect, 1000)
}

const sendWs = (msg: object) => socket?.readyState === WebSocket.OPEN && socket.send(JSON.stringify(msg))

export function onMessage(handler: Handler) {
  if (!socket) connect()
  handlers.add(handler)
  return () => void handlers.delete(handler)
}

/** Watch a problem: the server runs it on file changes and streams the output here. */
export function subscribeProblem(id: string) {
  if (!socket) connect()
  subscriptions.set(id, (subscriptions.get(id) ?? 0) + 1)
  sendWs({ type: 'subscribe', id })
  return () => {
    const n = (subscriptions.get(id) ?? 1) - 1
    if (n > 0) return void subscriptions.set(id, n)
    subscriptions.delete(id)
    sendWs({ type: 'unsubscribe', id })
  }
}
