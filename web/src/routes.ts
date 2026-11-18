/** `aoc/2024/03` → `/aoc/2024/3`, `euler/007` → `/euler/7` */
export function problemPath(id: string) {
  const [kind, ...rest] = id.split('/')
  return `/${kind}/${rest.map(Number).join('/')}`
}

export function problemLabel(id: string) {
  const [kind, a, b] = id.split('/')
  return kind === 'aoc' ? `AoC ${a} · Day ${Number(b)}` : `Euler ${Number(a)}`
}
