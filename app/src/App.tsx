import { useEffect, useMemo, useState } from 'react'
import type { GraphNode } from './domain/types'
import { useGraphStore } from './store/useGraphStore'
import { filterGraphByGroups } from './lib/graphFilter'
import { reminderState } from './lib/datetime'
import { downloadUniverseSnapshot } from './lib/snapshot'
import CosmicBackground from './components/CosmicBackground'
import GraphView from './components/GraphView'
import NodeCard from './components/NodeCard'
import AddStarModal from './components/AddStarModal'
import QuickAddModal from './components/QuickAddModal'
import ProfilePanel from './components/ProfilePanel'
import GroupsPanel from './components/GroupsPanel'
import LayoutControls from './components/LayoutControls'
import Supernova from './components/Supernova'
import FpsOverlay from './components/FpsOverlay'
import AppShell from './components/AppShell'

export default function App() {
  const {
    load,
    loading,
    graph,
    profile,
    nodes,
    matches,
    groups,
    hiddenGroupIds,
    searchQuery,
    layoutMode,
    hierarchySort,
    perfMode,
    togglePerfMode,
  } = useGraphStore()
  const [selected, setSelected] = useState<GraphNode | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showGroups, setShowGroups] = useState(false)

  useEffect(() => {
    void load()
  }, [load])

  const visibleGraph = useMemo(() => filterGraphByGroups(graph, hiddenGroupIds), [graph, hiddenGroupIds])

  // search: match by node label or its group name; null = search inactive
  const highlightIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return null
    const groupName = new Map(groups.map((g) => [g.id, g.name.toLowerCase()]))
    const ids = new Set<string>()
    for (const n of visibleGraph.nodes) {
      if (n.degree !== 1) continue
      const inLabel = n.label.toLowerCase().includes(q)
      const inGroup = n.groupId ? (groupName.get(n.groupId) ?? '').includes(q) : false
      if (inLabel || inGroup) ids.add(n.id)
    }
    return ids
  }, [searchQuery, visibleGraph, groups])

  // reminder-due contacts → amber attention dots + side count
  const attentionIds = useMemo(() => {
    const ids = new Set<string>()
    for (const n of nodes) {
      if (reminderState(n.nextReminderAt)?.due) ids.add(n.id)
    }
    return ids
  }, [nodes])

  const matchedCount = matches.filter((m) => m.status === 'accepted').length

  const snapshot = () => {
    const canvas = document.querySelector<HTMLCanvasElement>('.force-graph-container canvas')
    if (!canvas) return
    downloadUniverseSnapshot(canvas, {
      title: `${profile?.displayName ?? '나'}의 우주`,
      subtitle: `별 ${nodes.length}개 · ${new Date().toLocaleDateString('ko-KR')}`,
    })
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <CosmicBackground />

      {!loading && (
        <GraphView
          graph={visibleGraph}
          highlightIds={highlightIds}
          attentionIds={attentionIds}
          layoutMode={layoutMode}
          hierarchySort={hierarchySort}
          onSelect={(n) => setSelected(n)}
        />
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="label-mono animate-pulse text-on-surface-variant">우주를 그리는 중…</div>
        </div>
      )}

      <AppShell
        profileName={profile?.displayName ?? '나'}
        starCount={nodes.length}
        matchedCount={matchedCount}
        reminderCount={attentionIds.size}
        perfMode={perfMode}
        onAddStar={() => setShowAdd(true)}
        onQuickAdd={() => setShowQuickAdd(true)}
        onSnapshot={snapshot}
        onOpenProfile={() => setShowProfile(true)}
        onOpenGroups={() => setShowGroups((v) => !v)}
        onTogglePerf={togglePerfMode}
      />

      <div className="fixed left-1/2 top-16 z-[60] -translate-x-1/2">
        <LayoutControls />
      </div>

      {searchQuery.trim() && highlightIds && (
        <div className="label-mono fixed left-1/2 top-28 z-[60] -translate-x-1/2 rounded-full bg-deep-void/70 px-4 py-1.5 text-[11px] text-on-surface-variant backdrop-blur">
          “{searchQuery}” · {highlightIds.size}개 일치
        </div>
      )}

      {selected && (
        <aside className="glass-hud animate-slide-in-left fixed bottom-0 left-0 top-14 z-[60] w-80 max-w-[88vw] overflow-hidden border-r border-white/10">
          <NodeCard key={selected.id} node={selected} onClose={() => setSelected(null)} />
        </aside>
      )}

      {showGroups && (
        <div className="fixed right-4 top-20 z-[70]">
          <GroupsPanel onClose={() => setShowGroups(false)} />
        </div>
      )}

      {showAdd && <AddStarModal onClose={() => setShowAdd(false)} />}
      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
      {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}

      <Supernova />
      {perfMode && <FpsOverlay nodeCount={visibleGraph.nodes.length} />}
    </div>
  )
}
