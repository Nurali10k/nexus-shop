export default function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange, previousLabel = 'Назад', nextLabel = 'Вперёд' }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const page = Math.min(Math.max(currentPage, 1), totalPages)
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  if (totalItems <= itemsPerPage) return null

  return (
    <nav aria-label="Страницы списка" className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
        {previousLabel}
      </button>
      {pages.map((pageNumber) => (
        <button key={pageNumber} type="button" onClick={() => onPageChange(pageNumber)} aria-current={pageNumber === page ? 'page' : undefined} className={`min-w-10 rounded-lg border px-3 py-2 text-sm ${pageNumber === page ? 'border-blue-600 bg-blue-600 font-semibold text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'}`}>
          {pageNumber}
        </button>
      ))}
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
        {nextLabel}
      </button>
    </nav>
  )
}
