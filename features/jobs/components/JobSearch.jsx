export default function JobSearch({ search, setSearch }) {
  return (
    <div className="bg-white rounded-2xl border border-dark-amethyst-100 shadow-sm p-4 flex items-center gap-3">
      <div className="flex items-center gap-2 flex-1">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-dark-amethyst-400 shrink-0">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search job title or keyword..."
          className="w-full text-sm text-dark-amethyst-900 placeholder:text-dark-amethyst-300 outline-none bg-transparent"
        />
      </div>

      <button
        className="px-5 py-2.5 rounded-xl bg-dark-amethyst-600 text-white text-sm font-semibold hover:bg-dark-amethyst-700 transition shrink-0"
        style={{ boxShadow: '0 2px 12px rgba(132,0,255,0.2)' }}
      >
        Find Jobs
      </button>

    </div>
  );
}