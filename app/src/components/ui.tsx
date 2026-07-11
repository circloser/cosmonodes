import type { ReactNode } from 'react'
import type { Group, GroupKind } from '../domain/types'
import { GROUP_PALETTE } from '../data/seed'
import { KIND_OPTIONS } from '../lib/kinds'

/* Shared UI primitives — single source of truth for the glass design language. */

/** Centered glass modal with dimmed backdrop. */
export function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-deep-void/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card animate-fade-up relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl p-7">
        <h3 className="mb-1 font-display text-2xl font-bold text-starlight-white">{title}</h3>
        {subtitle && <p className="mb-5 text-sm text-on-surface-variant">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}

/** Section heading inside forms/cards. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h5 className="label-mono mb-1 mt-3 border-t border-white/5 pt-3 text-[10px] uppercase tracking-widest text-nebula-blue/80 first:mt-0 first:border-t-0 first:pt-0">
      {children}
    </h5>
  )
}

/** Labelled form field wrapper. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="label-mono block text-[10px] uppercase tracking-wider text-on-surface-variant">
      {label}
      {children}
    </label>
  )
}

/** Definition-list row (label left, value right). */
export function Row({ label, value, valueClass }: { label: string; value: ReactNode; valueClass?: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-on-surface-variant">{label}</dt>
      <dd className={`truncate text-right ${valueClass ?? 'text-on-surface'}`}>{value}</dd>
    </div>
  )
}

/** Selectable pill button. */
export function Chip({
  active,
  onClick,
  children,
  size = 'sm',
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  size?: 'sm' | 'md'
}) {
  const pad = size === 'md' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border transition-colors ${pad} ${
        active ? 'border-white/60 text-white' : 'border-white/15 text-on-surface-variant hover:border-white/35 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

/** Tiny colored dot (group color swatch inside chips/rows). */
export function GroupDot({ color, className = 'h-2.5 w-2.5' }: { color: string; className?: string }) {
  return <span className={`shrink-0 rounded-full ${className}`} style={{ backgroundColor: color }} />
}

/** Group selector: "없음" + one chip per group (+ optional trailing extra). */
export function GroupChips({
  groups,
  value,
  onChange,
  size = 'md',
  extra,
}: {
  groups: Group[]
  value: string | null
  onChange: (id: string | null) => void
  size?: 'sm' | 'md'
  extra?: ReactNode
}) {
  return (
    <div className={`flex flex-wrap ${size === 'md' ? 'gap-2' : 'gap-1'}`}>
      <Chip active={value === null} onClick={() => onChange(null)} size={size}>
        없음
      </Chip>
      {groups.map((g) => (
        <Chip key={g.id} active={value === g.id} onClick={() => onChange(g.id)} size={size}>
          <GroupDot color={g.color} className={size === 'md' ? 'h-2.5 w-2.5' : 'h-2 w-2'} />
          {g.name}
        </Chip>
      ))}
      {extra}
    </div>
  )
}

/** Group-category selector (가족/친구/직장/지인/일반). */
export function KindChips({ value, onChange }: { value: GroupKind; onChange: (k: GroupKind) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {KIND_OPTIONS.map((k) => (
        <Chip key={k.key} active={value === k.key} onClick={() => onChange(k.key)}>
          {k.label}
        </Chip>
      ))}
    </div>
  )
}

/** Color palette picker for groups. */
export function ColorSwatches({ value, onChange, size = 'h-6 w-6' }: { value: string; onChange: (c: string) => void; size?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {GROUP_PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`${size} rounded-full transition-transform ${value === c ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'}`}
          style={{ backgroundColor: c }}
          aria-label={`색상 ${c}`}
        />
      ))}
    </div>
  )
}
