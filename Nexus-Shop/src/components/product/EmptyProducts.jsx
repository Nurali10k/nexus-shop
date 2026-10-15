import { motion } from 'framer-motion'

export default function EmptyProducts({ title, hint }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
    <div aria-hidden="true" className="mb-4 text-6xl">🔎</div>
    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-500">{hint}</p>
  </motion.div>
}
