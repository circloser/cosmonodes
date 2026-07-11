import type { GroupKind } from '../domain/types'

export const KIND_OPTIONS: Array<{ key: GroupKind; label: string }> = [
  { key: 'family', label: '가족' },
  { key: 'friend', label: '친구' },
  { key: 'work', label: '직장' },
  { key: 'acquaintance', label: '지인' },
  { key: 'general', label: '일반' },
]

export function kindLabel(k: GroupKind): string {
  return KIND_OPTIONS.find((o) => o.key === k)?.label ?? '일반'
}

/** Generational tiers used by the hierarchy view and the contact form. */
export const TIER_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 2, label: '조부모' },
  { value: 1, label: '부모' },
  { value: 0, label: '동년배' },
  { value: -1, label: '자녀' },
  { value: -2, label: '손주' },
]

export function tierLabel(t: number): string {
  return t >= 2 ? '조부모' : t === 1 ? '부모' : t === 0 ? '나·동년배' : t === -1 ? '자녀' : '손주'
}

/** Which detailed contact fields are relevant for a given group category. */
export interface KindFields {
  tier: boolean
  age: boolean
  birthday: boolean
  anniversary: boolean
  job: boolean
  company: boolean
  department: boolean
  role: boolean
  howWeMet: boolean
}

export function fieldsForKind(kind: GroupKind): KindFields {
  switch (kind) {
    case 'family':
      return { tier: true, age: true, birthday: true, anniversary: true, job: false, company: false, department: false, role: false, howWeMet: false }
    case 'work':
      return { tier: false, age: false, birthday: false, anniversary: false, job: true, company: true, department: true, role: true, howWeMet: true }
    case 'friend':
      return { tier: false, age: true, birthday: true, anniversary: true, job: true, company: false, department: false, role: false, howWeMet: true }
    case 'acquaintance':
      return { tier: false, age: false, birthday: false, anniversary: false, job: true, company: false, department: false, role: false, howWeMet: true }
    default: // general
      return { tier: false, age: true, birthday: true, anniversary: false, job: true, company: false, department: false, role: false, howWeMet: true }
  }
}
