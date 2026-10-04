import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { removeToast } from '../../store/slices/uiSlice'

function ToastMessage({ toast, onDismiss }) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, 3500)
    return () => window.clearTimeout(timeoutId)
  }, [onDismiss])

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-white shadow-lg ${toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'}`}
    >
      <span>{toast.message}</span>
      <button type="button" aria-label="Закрыть уведомление" onClick={onDismiss}><X size={16} /></button>
    </motion.div>
  )
}

export default function Toast() {
  const toasts = useSelector((state) => state.ui.toasts)
  const dispatch = useDispatch()

  return (
    <div className="fixed right-4 top-20 z-[60] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} toast={toast} onDismiss={() => dispatch(removeToast(toast.id))} />
        ))}
      </AnimatePresence>
    </div>
  )
}