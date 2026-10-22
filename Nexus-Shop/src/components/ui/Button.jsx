import { motion } from 'framer-motion'

const variants = {
  primary: 'rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md shadow-purple-900/20 hover:shadow-lg',
  secondary: 'rounded-lg border border-gray-600 bg-gray-800 text-white hover:bg-gray-700',
  danger: 'rounded-lg bg-red-600 text-white hover:bg-red-700',
}

export default function Button({ variant = 'primary', children, className = '', type = 'button', ...props }) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`px-5 py-3 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
