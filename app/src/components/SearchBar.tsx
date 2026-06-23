import { useGraphStore } from '../store/useGraphStore'

/** Search by name or group — highlights matches and dims the rest of the universe. */
export default function SearchBar() {
  const searchQuery = useGraphStore((s) => s.searchQuery)
  const setSearch = useGraphStore((s) => s.setSearch)

  return (
    <div className="relative">
      <input
        value={searchQuery}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="이름·그룹 검색…"
        className="label-mono w-40 rounded-full border border-white/10 bg-surface-container-highest/30 px-4 py-1.5 text-[11px] text-on-surface outline-none transition-all focus:w-56 focus:border-nebula-blue sm:w-48"
      />
      {searchQuery && (
        <button
          onClick={() => setSearch('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
          aria-label="검색 지우기"
        >
          ✕
        </button>
      )}
    </div>
  )
}
