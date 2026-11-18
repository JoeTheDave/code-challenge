// Standalone page opened by "Launch Visualization": loads the problem's vis.ts through Vite (so
// saving it reloads this tab) and hands it a canvas plus the selected data set.
import { api } from './api'

const id = new URLSearchParams(location.search).get('id') ?? ''
const showError = (e: unknown) => {
  document.getElementById('error')!.textContent = e instanceof Error ? (e.stack ?? e.message) : String(e)
}

async function main() {
  const [detail, input] = await Promise.all([api.problem(id), api.data(id)])
  const name = detail.entry.name ? ` · ${detail.entry.name}` : ''
  document.title = `Vis · ${id}`
  document.getElementById('title')!.textContent = `${id}${name}`
  const mod = await import(/* @vite-ignore */ `/@fs${detail.visPath}`)
  if (typeof mod.visualize !== 'function') throw new Error('vis.ts does not export a visualize function')
  await mod.visualize(document.getElementById('canvas') as HTMLCanvasElement, input)
}

main().catch(showError)
