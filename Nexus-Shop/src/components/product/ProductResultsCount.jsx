export default function ProductResultsCount({ label, count }) {
  return <p className="mb-4 text-sm text-gray-400">{label} <span className="font-semibold text-purple-400">{count}</span></p>
}
