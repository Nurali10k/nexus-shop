import { Search, X } from 'lucide-react'

export default function ProductSearch({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-11 text-gray-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
      {value && <button type="button" aria-label="Очистить поиск" onClick={() => onChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={20} /></button>}
    </div>
  )
}
