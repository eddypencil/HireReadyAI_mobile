import { Search, Plus } from "lucide-react";

export default function Navbar({ searchQuery, setSearchQuery, onAddJobClick }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white border-b border-gray-100 px-4 sm:px-8 py-4 font-sans gap-4">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs by title or department..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-dark-amethyst-400 focus:bg-white transition-all"
                />
            </div>

            <div className="flex items-center justify-end w-full md:w-auto shrink-0">
                <button
                    onClick={onAddJobClick}
                    className="flex items-center justify-center gap-2 bg-dark-amethyst-950 text-white px-5 py-2.5 md:py-2 rounded-lg text-sm font-medium hover:bg-dark-amethyst-900 transition-colors cursor-pointer w-full md:w-auto shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    Add Job
                </button>
            </div>
        </div>
    );
}