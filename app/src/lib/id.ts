export function uid(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${Date.now().toString(36)}${rand}`
}

/** High-entropy, single-use invite token. */
export function inviteToken(): string {
  const a = Math.random().toString(36).slice(2)
  const b = Math.random().toString(36).slice(2)
  const c = Date.now().toString(36)
  return `cn-${a}${b}${c}`.slice(0, 40)
}
