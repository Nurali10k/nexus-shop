export default function ProductSortSelect({ value, options, onChange, translate }) {
  return (
    <select aria-label="Сортировка товаров" value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30">
      {options.map((option) => <option key={option.id} value={option.id}>{translate(option.translationKey)}</option>)}
    </select>
  )
}
