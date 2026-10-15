export default function ProductResultsCount({ label, count }) {
  return <p className="mb-4 text-gray-500 dark:text-gray-400">{label} <span className="font-bold text-purple-600">{count}</span></p>
}
