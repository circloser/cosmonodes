import type { ReactNode } from 'react'
import SearchBar from './SearchBar'

interface Props {
  profileName: string
  starCount: number
  matchedCount: number
  reminderCount: number
  perfMode: boolean
  onAddStar: () => void
  onQuickAdd: () => void
  onSnapshot: () => void
  onOpenProfile: () => void
  onOpenGroups: () => void
  onTogglePerf: () => void
  children?: ReactNode
}

export default function AppShell({
  profileName,
  starCount,
  matchedCount,
  reminderCount,
  perfMode,
  onAddStar,
  onQuickAdd,
  onSnapshot,
  onOpenProfile,
  onOpenGroups,
  onTogglePerf,
}: Props) {
  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 z-50 w-full">
        <nav className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-4 md:px-10">
          <div className="font-display text-xl font-bold tracking-tight text-primary md:text-2xl">
            Cosmonodes
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <SearchBar />
            </div>
            <button
              onClick={onOpenGroups}
              className="label-mono rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider text-on-surface-variant transition-colors hover:text-white"
              title="그룹 색상 / 켜고 끄기"
            >
              그룹
            </button>
            <button
              onClick={onTogglePerf}
              className={`label-mono rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${
                perfMode ? 'bg-nebula-blue/20 text-nebula-blue' : 'text-on-surface-variant hover:text-white'
              }`}
              title="성능 데모: 300개 노드"
            >
              {perfMode ? '300 노드' : '성능 데모'}
            </button>
            <button
              onClick={onOpenProfile}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-bold text-white transition-transform active:scale-95"
              title={profileName}
            >
              {profileName.slice(0, 1)}
            </button>
          </div>
        </nav>
      </header>

      {/* Desktop side HUD */}
      <aside className="glass-hud fixed left-0 top-0 z-40 hidden h-full w-60 flex-col gap-6 p-8 pt-24 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-nova-violet/30 bg-nova-violet/20">
            <span className="text-nova-violet">✦</span>
          </div>
          <div>
            <h3 className="font-bold text-on-surface">{profileName}</h3>
            <p className="label-mono text-[11px] text-on-surface-variant">Cartographer</p>
          </div>
        </div>
        <div className="space-y-1 border-y border-white/5 py-4 text-sm text-on-surface-variant">
          <div className="flex justify-between">
            <span>나의 별</span>
            <span className="text-on-surface">{starCount}</span>
          </div>
          <div className="flex justify-between">
            <span>매칭된 우주</span>
            <span className="text-nebula-blue">{matchedCount}</span>
          </div>
          <div className="flex justify-between">
            <span>연락할 별</span>
            <span className={reminderCount > 0 ? 'text-amber-300' : 'text-on-surface'}>{reminderCount}</span>
          </div>
        </div>
        <button onClick={onAddStar} className="btn-star flex items-center justify-center gap-2 py-3">
          <span>＋</span> 별 추가
        </button>
        <button onClick={onQuickAdd} className="btn-ghost flex items-center justify-center gap-2 py-2.5 text-sm">
          여러 명 빠르게
        </button>
        <button onClick={onSnapshot} className="btn-ghost flex items-center justify-center gap-2 py-2.5 text-sm" title="내 우주를 이미지로 저장">
          ✦ 우주 스냅샷
        </button>
        <p className="mt-auto text-xs leading-relaxed text-on-surface-variant/70">
          노드를 드래그해 우주를 펼쳐보세요. 별을 클릭하면 관계를 관리할 수 있어요.
        </p>
      </aside>

      {/* Center FAB (mobile + desktop) */}
      <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
        <button
          onClick={onAddStar}
          className="group flex items-center gap-3 rounded-full border border-nova-violet/40 bg-deep-void/40 px-7 py-3.5 font-bold text-starlight-white shadow-[0_0_30px_rgba(129,140,248,0.2)] backdrop-blur-md transition-all hover:border-nova-violet hover:bg-nova-violet hover:text-deep-void"
        >
          <span className="transition-transform duration-500 group-hover:rotate-90">＋</span>
          <span className="label-mono text-xs uppercase tracking-widest">Add Star</span>
        </button>
      </div>

      {/* Mobile bottom area: search (very small screens) + nav */}
      <div className="fixed bottom-0 z-40 w-full lg:hidden">
        <div className="flex justify-center px-4 pb-2 sm:hidden">
          <SearchBar />
        </div>
        <nav className="glass-hud flex w-full items-center justify-around py-3">
          <button onClick={onQuickAdd} className="label-mono text-[11px] text-on-surface-variant">
            빠른추가
          </button>
          <button onClick={onSnapshot} className="label-mono text-[11px] text-on-surface-variant">
            스냅샷
          </button>
          <button onClick={onOpenProfile} className="label-mono text-[11px] text-on-surface-variant">
            프로필
          </button>
          <button onClick={onOpenGroups} className="label-mono text-[11px] text-on-surface-variant">
            그룹
          </button>
          <button onClick={onTogglePerf} className="label-mono text-[11px] text-on-surface-variant">
            {perfMode ? '일반' : '성능'}
          </button>
        </nav>
      </div>
    </>
  )
}
