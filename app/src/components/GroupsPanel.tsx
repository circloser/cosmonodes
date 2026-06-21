import { useGraphStore } from '../store/useGraphStore'

interface Props {
  onClose: () => void
}

export default function GroupsPanel({ onClose }: Props) {
  const { groups, hiddenGroupIds, toggleGroup, graph } = useGraphStore()

  // count degree-1 nodes per group from the current graph
  const counts = new Map<string, number>()
  for (const n of graph.nodes) {
    if (n.degree === 1 && n.groupId) counts.set(n.groupId, (counts.get(n.groupId) ?? 0) + 1)
  }

  return (
    <div className="glass-card animate-fade-up w-64 rounded-2xl p-5 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-starlight-white">그룹</h3>
        <button onClick={onClose} className="text-on-surface-variant hover:text-white" aria-label="닫기">
          ✕
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-on-surface-variant">아직 그룹이 없습니다. 별을 추가할 때 그룹을 만들 수 있어요.</p>
      ) : (
        <ul className="space-y-1">
          {groups.map((g) => {
            const hidden = hiddenGroupIds.includes(g.id)
            return (
              <li key={g.id}>
                <button
                  onClick={() => toggleGroup(g.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5 ${
                    hidden ? 'opacity-40' : ''
                  }`}
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: g.color }} />
                  <span className="flex-1 text-sm text-on-surface">{g.name}</span>
                  <span className="label-mono text-[11px] text-on-surface-variant">{counts.get(g.id) ?? 0}</span>
                  <span className="text-on-surface-variant">{hidden ? '🚫' : '👁'}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-on-surface-variant/70">
        그룹을 눌러 우주에서 켜고 끌 수 있어요. 별을 추가할 때 그룹을 지정하거나 새로 만들 수 있습니다.
      </p>
    </div>
  )
}
