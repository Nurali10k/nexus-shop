export default function Input({ as: Element = 'input', className = '', ...props }) {
  return (
    <Element
      {...props}
      className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${className}`}
    />
  )
}
