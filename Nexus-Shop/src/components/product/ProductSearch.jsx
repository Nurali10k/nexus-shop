import { Search, X } from 'lucide-react'

export default function ProductSearch({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 pl-11 pr-11 text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30" />
      {value && <button type="button" aria-label="Очистить поиск" onClick={() => onChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><X size={18} /></button>}
    </div>
  )
}
