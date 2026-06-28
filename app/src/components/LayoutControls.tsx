import { useGraphStore } from '../store/useGraphStore'

const SORTS: Array<{ key: 'tier' | 'age' | 'closeness'; label: string }> = [
  { key: 'tier', label: '세대' },
  { key: 'age', label: '나이' },
  { key: 'closeness', label: '중요도' },
]

/** Switch between the radial "cosmos" view and the layered "hierarchy" view. */
export default function LayoutControls() {
  const layoutMode = useGraphStore((s) => s.layoutMode)
  const hierarchySort = useGraphStore((s) => s.hierarchySort)
  const setLayoutMode = useGraphStore((s) => s.setLayoutMode)
  const setHierarchySort = useGraphStore((s) => s.setHierarchySort)

  return (
    <div className="glass-hud flex items-center gap-1 rounded-full p-1">
      <button
        onClick={() => setLayoutMode('cosmos')}
        className={`label-mono rounded-full px-3 py-1 text-[10px] uppercase tracking-wider transition-colors ${
          layoutMode === 'cosmos' ? 'bg-white/10 text-white' : 'text-on-surface-variant hover:text-white'
        }`}
      >
        우주
      </button>
      <button
        onClick={() => setLayoutMode('hierarchy')}
        className={`label-mono rounded-full px-3 py-1 text-[10px] uppercase tracking-wider transition-colors ${
          layoutMode === 'hierarchy' ? 'bg-white/10 text-white' : 'text-on-surface-variant hover:text-white'
        }`}
      >
        계층
      </button>

      {layoutMode === 'hierarchy' && (
        <div className="ml-1 flex items-center gap-0.5 border-l border-white/10 pl-1.5">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setHierarchySort(s.key)}
              className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                hierarchySort === s.key ? 'text-nebula-blue' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
