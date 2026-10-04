import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, useReducedMotion } from 'framer-motion'
import { Search } from 'lucide-react'
import FilterSidebar from '../components/product/FilterSidebar'
import ProductGrid from '../components/product/ProductGrid'
import useDebounce from '../hooks/useDebounce'
import { setSearchQuery, setSortBy } from '../store/slices/productsSlice'
import { t } from '../i18n/translations'

export default function Shop() {
  const dispatch = useDispatch()
  const { items, filters, searchQuery, sortBy } = useSelector((state) => state.products)
  const language = useSelector((state) => state.ui.language)
  const reduceMotion = useReducedMotion()
  const [searchInput, setSearchInput] = useState(searchQuery)
  const debouncedSearch = useDebounce(searchInput)

  useEffect(() => { dispatch(setSearchQuery(debouncedSearch)) }, [debouncedSearch, dispatch])

  const filteredProducts = useMemo(() => {
    const result = items.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filters.category === 'all' || product.category === filters.category
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      return matchesSearch && matchesCategory && matchesPrice && product.rating >= filters.rating
    })
    return result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'rating') return b.rating - a.rating
      return a.name.localeCompare(b.name)
    })
  }, [items, filters, searchQuery, sortBy])

  return (
    <section className="page-shell">
      <div className="mb-8"><p className="mb-2 text-sm uppercase tracking-widest text-primary-600">NEXUS / STORE</p><h1 className="text-4xl font-bold">{t('shop.title', language)}</h1></div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">{t('shop.search', language)}</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder={t('shop.search', language)} className="input-field pl-10" />
        </label>
        <label><span className="sr-only">{t('shop.sort', language)}</span>
          <select value={sortBy} onChange={(event) => dispatch(setSortBy(event.target.value))} className="input-field sm:w-60">
            <option value="name">По названию</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option><option value="rating">По рейтингу</option>
          </select>
        </label>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <FilterSidebar />
        <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}><p className="mb-4 text-sm text-gray-500">Найдено товаров: {filteredProducts.length}</p><ProductGrid products={filteredProducts} /></motion.div>
      </div>
    </section>
  )
}