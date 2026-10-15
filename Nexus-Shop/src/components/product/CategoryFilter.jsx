import { motion } from 'framer-motion'

export default function CategoryFilter({ categories, selected, onSelect, translate, visible = true }) {
  return (
    <nav aria-label="Категории товаров" className={`${visible ? 'block' : 'hidden'} mb-8 md:block`}>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => <motion.button key={category.id} type="button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => onSelect(category.id)} aria-pressed={selected === category.id} className={`rounded-xl px-4 py-2 font-medium transition-all ${selected === category.id ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg' : 'border border-gray-200 bg-white text-gray-700 hover:border-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
          <span className="mr-2">{category.icon}</span>{translate(category.translationKey)}
        </motion.button>)}
      </div>
    </nav>
  )
}
