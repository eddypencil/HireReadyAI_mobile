import { SENIORITY_LEVEL } from "@/shared/constants/enums";

export default function JobFilters({
  level, setLevel,
  jobType, setJobType,
  workLocation, setWorkLocation,
  datePosted, setDatePosted,
  salaryMin, setSalaryMin,
  salaryMax, setSalaryMax,
  onClear,
}) {
  return (
    <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-5 space-y-6">


      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-dark-amethyst-950">Filter</h3>
        <button
          onClick={onClear}
          className="text-xs text-dark-amethyst-500 hover:text-dark-amethyst-700 hover:underline font-medium"
        >
          Clear all
        </button>
      </div>


      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-dark-amethyst-800 uppercase tracking-wide">Date Posted</h4>
        <select
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
          className="w-full h-9 px-3 rounded-lg text-sm text-dark-amethyst-800 border border-dark-amethyst-100 bg-dark-amethyst-50 outline-none focus:border-dark-amethyst-400 transition"
        >
          <option value="">Anytime</option>
          <option value="24h">Last 24 hours</option>
          <option value="week">Last week</option>
          <option value="month">Last month</option>
        </select>
      </div>

      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-dark-amethyst-800 uppercase tracking-wide">Salary Range (EGP)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="Min"
            className="w-full h-9 px-3 rounded-lg text-sm text-dark-amethyst-800 border border-dark-amethyst-100 bg-dark-amethyst-50 outline-none focus:border-dark-amethyst-400 transition placeholder:text-dark-amethyst-300"
          />
          <span className="text-dark-amethyst-300 text-sm shrink-0">to</span>
          <input
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="Max"
            className="w-full h-9 px-3 rounded-lg text-sm text-dark-amethyst-800 border border-dark-amethyst-100 bg-dark-amethyst-50 outline-none focus:border-dark-amethyst-400 transition placeholder:text-dark-amethyst-300"
          />
        </div>
      </div>


      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-dark-amethyst-800 uppercase tracking-wide">Job Type</h4>
        <div className="space-y-2">
          {[
            { label: 'Full Time', value: 'full_time' },
            { label: 'Part Time', value: 'part_time' },
          ].map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={jobType === value}
                onChange={() => setJobType(jobType === value ? '' : value)}
                className="w-4 h-4 rounded border-dark-amethyst-200 accent-dark-amethyst-600 cursor-pointer"
              />
              <span className="text-sm text-dark-amethyst-700 group-hover:text-dark-amethyst-900 transition">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>


      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-dark-amethyst-800 uppercase tracking-wide">On-site / Remote</h4>
        <div className="space-y-2">
          {[
            { label: 'On-site', value: 'on_site' },
            { label: 'Remote', value: 'remote' },
            { label: 'Hybrid', value: 'hybrid' },
          ].map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={workLocation === value}
                onChange={() => setWorkLocation(workLocation === value ? '' : value)}
                className="w-4 h-4 rounded border-dark-amethyst-200 accent-dark-amethyst-600 cursor-pointer"
              />
              <span className="text-sm text-dark-amethyst-700 group-hover:text-dark-amethyst-900 transition">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>


      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-dark-amethyst-800 uppercase tracking-wide">Seniority Level</h4>
        <div className="space-y-2">
          {Object.values(SENIORITY_LEVEL).map((lvl) => (
            <label key={lvl} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={level === lvl}
                onChange={() => setLevel(level === lvl ? '' : lvl)}
                className="w-4 h-4 rounded border-dark-amethyst-200 accent-dark-amethyst-600 cursor-pointer"
              />
              <span className="text-sm text-dark-amethyst-700 group-hover:text-dark-amethyst-900 transition capitalize">
                {lvl}
              </span>
            </label>
          ))}
        </div>
      </div>

      

    </div>
  );
}