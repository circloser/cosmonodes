const DAY = 86_400_000

/** Local YYYY-MM-DD for <input type="date"> binding. */
export function toDateInput(ts: number | null): string {
  if (ts == null) return ''
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function fromDateInput(value: string): number | null {
  if (!value) return null
  const ts = new Date(`${value}T12:00:00`).getTime()
  return Number.isNaN(ts) ? null : ts
}

/** "오늘 / 어제 / N일 전" for a past contact timestamp. */
export function sinceLabel(ts: number | null): string {
  if (ts == null) return '기록 없음'
  const days = Math.floor((Date.now() - ts) / DAY)
  if (days <= 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 30) return `${days}일 전`
  const months = Math.floor(days / 30)
  return `${months}개월 전`
}

export interface ReminderState {
  label: string
  overdue: boolean
  due: boolean // overdue or within 1 day
}

export function reminderState(ts: number | null): ReminderState | null {
  if (ts == null) return null
  const diff = ts - Date.now()
  const days = Math.ceil(diff / DAY)
  if (days < 0) return { label: `${-days}일 지남`, overdue: true, due: true }
  if (days === 0) return { label: '오늘', overdue: false, due: true }
  if (days <= 1) return { label: '내일', overdue: false, due: true }
  return { label: `D-${days}`, overdue: false, due: false }
}

/** A contact is "stale" if not contacted within the threshold (default 30d). */
export function isStale(lastContactAt: number | null, thresholdDays = 30): boolean {
  if (lastContactAt == null) return false
  return Date.now() - lastContactAt > thresholdDays * DAY
}
