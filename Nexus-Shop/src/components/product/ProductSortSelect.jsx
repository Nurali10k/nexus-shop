export default function ProductSortSelect({ value, options, onChange, translate }) {
  return (
    <select aria-label="Сортировка товаров" value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
      {options.map((option) => <option key={option.id} value={option.id}>{translate(option.translationKey)}</option>)}
    </select>
  )
}
