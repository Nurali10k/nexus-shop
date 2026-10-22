import { motion } from 'framer-motion';

export default function CategoryFilter({ categories, selected, onSelect, translate, visible = true }) {
  return <nav aria-label="Категории товаров" className={`${visible ? 'block' : 'hidden'} mb-8 md:block`}>
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => <motion.button key={category.id} type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: .98 }} onClick={() => onSelect(category.id)} aria-pressed={selected === category.id} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${selected === category.id ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-900/20' : 'border border-gray-700 bg-gray-800 text-gray-300 hover:border-purple-500 hover:text-white'}`}>
        {category.Icon && <category.Icon size={16} strokeWidth={1.75} aria-hidden="true" />}{translate(category.translationKey)}
      </motion.button>)}
    </div>
  </nav>;
}
