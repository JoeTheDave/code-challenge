import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { localDir, settingsFile } from './paths.ts'

export interface Settings {
  aocSession: string
  eulerCookie: string
  contact: string
}

const defaults: Settings = { aocSession: '', eulerCookie: '', contact: '' }

let settings: Settings = load()

function load(): Settings {
  if (!existsSync(settingsFile)) return { ...defaults }
  try {
    return { ...defaults, ...JSON.parse(readFileSync(settingsFile, 'utf8')) }
  } catch {
    return { ...defaults }
  }
}

export const getSettings = () => settings

export function updateSettings(patch: Partial<Settings>) {
  settings = { ...settings, ...patch }
  mkdirSync(localDir, { recursive: true })
  writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + '\n')
}

/** What the browser is allowed to see: whether secrets are set, never their values. */
export const publicSettings = () => ({
  hasAocSession: settings.aocSession !== '',
  hasEulerCookie: settings.eulerCookie !== '',
  contact: settings.contact,
})
