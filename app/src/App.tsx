import { useEffect, useState } from 'react'
import type { GraphNode } from './domain/types'
import { useGraphStore } from './store/useGraphStore'
import CosmicBackground from './components/CosmicBackground'
import GraphView from './components/GraphView'
import NodeCard from './components/NodeCard'
import AddStarModal from './components/AddStarModal'
import ProfilePanel from './components/ProfilePanel'
import Supernova from './components/Supernova'
import FpsOverlay from './components/FpsOverlay'
import AppShell from './components/AppShell'

export default function App() {
  const { load, loading, graph, profile, nodes, matches, perfMode, togglePerfMode } = useGraphStore()
  const [selected, setSelected] = useState<GraphNode | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    void load()
  }, [load])

  const matchedCount = matches.filter((m) => m.status === 'accepted').length

  return (
    <div className="relative h-full w-full overflow-hidden">
      <CosmicBackground />

      {!loading && <GraphView graph={graph} onSelect={(n) => setSelected(n)} />}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="label-mono animate-pulse text-on-surface-variant">우주를 그리는 중…</div>
        </div>
      )}

      <AppShell
        profileName={profile?.displayName ?? '나'}
        starCount={nodes.length}
        matchedCount={matchedCount}
        perfMode={perfMode}
        onAddStar={() => setShowAdd(true)}
        onOpenProfile={() => setShowProfile(true)}
        onTogglePerf={togglePerfMode}
      />

      {selected && (
        <div className="fixed right-5 top-20 z-[70] lg:right-10">
          <NodeCard node={selected} onClose={() => setSelected(null)} />
        </div>
      )}

      {showAdd && <AddStarModal onClose={() => setShowAdd(false)} />}
      {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}

      <Supernova />
      {perfMode && <FpsOverlay nodeCount={graph.nodes.length} />}
    </div>
  )
}
