import { useDispatch, useSelector } from 'react-redux'
import { setFilters } from '../../store/slices/productsSlice'
import { t } from '../../i18n/translations'

const categories = ['all', 'headphones', 'keyboards', 'mice', 'watches']

export default function FilterSidebar() {
  const dispatch = useDispatch()
  const { filters } = useSelector((state) => state.products)
  const language = useSelector((state) => state.ui.language)

  return (
    <aside className="card h-fit p-5">
      <h2 className="mb-4 text-lg font-semibold">{t('shop.filter', language)}</h2>
      <h3 className="mb-2 text-sm font-medium text-gray-500">{t('shop.category', language)}</h3>
      <div className="space-y-1">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            onClick={() => dispatch(setFilters({ category }))}
            className={`w-full rounded-lg px-3 py-2 text-left capitalize ${filters.category === category ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {category === 'all' ? t('shop.all', language) : category}
          </button>
        ))}
      </div>
      <label className="mt-5 block text-sm font-medium" htmlFor="min-rating">{t('shop.rating', language)}: {filters.rating}+</label>
      <input id="min-rating" type="range" min="0" max="5" step="0.5" value={filters.rating} onChange={(event) => dispatch(setFilters({ rating: Number(event.target.value) }))} className="mt-2 w-full accent-violet-600" />
      <label className="mt-5 block text-sm font-medium" htmlFor="max-price">{t('shop.price', language)}: до {filters.priceRange[1].toLocaleString('ru-RU')} ₽</label>
      <input id="max-price" type="range" min="10000" max="100000" step="5000" value={filters.priceRange[1]} onChange={(event) => dispatch(setFilters({ priceRange: [filters.priceRange[0], Number(event.target.value)] }))} className="mt-2 w-full accent-violet-600" />
    </aside>
  )
}