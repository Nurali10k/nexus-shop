import { Component } from 'react'

// Классовая граница перехватывает ошибки рендера дочерних компонентов.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Ошибка интерфейса NEXUS:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-900">
          <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
            <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Что-то пошло не так</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">Обновите страницу. Если ошибка повторится, обратитесь в поддержку.</p>
            <button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
              Обновить страницу
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
