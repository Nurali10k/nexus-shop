import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BurgerMenu({ open, onToggle, onNavigate, links }) {
  return (
    <>
      <button type="button" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} onClick={onToggle} className="p-2 text-slate-300 md:hidden">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="absolute left-0 right-0 top-full overflow-hidden border-t border-slate-800 bg-slate-900 md:hidden">
            <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
              {links.filter((link) => link.visible !== false).map((link) => (
                <Link key={link.to} to={link.to} onClick={onNavigate} className="rounded-lg px-4 py-2 text-slate-300 hover:bg-slate-800">
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
