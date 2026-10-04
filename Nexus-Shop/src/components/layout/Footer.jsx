import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { t } from '../../i18n/translations'

export default function Footer() {
  const language = useSelector((state) => state.ui.language)

  return (
    <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-gray-500 sm:flex-row">
        <Link to="/" className="font-black tracking-wider text-gray-900 dark:text-white">NEXUS</Link>
        <p>© {new Date().getFullYear()} NEXUS. Demo storefront.</p>
        <Link to="/shop" className="hover:text-primary-500">{t('nav.shop', language)}</Link>
      </div>
    </footer>
  )
}