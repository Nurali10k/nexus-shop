import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react'
import ProductGrid from '../components/product/ProductGrid'
import { t } from '../i18n/translations'

export default function Home() {
  const products = useSelector((state) => state.products.items)
  const language = useSelector((state) => state.ui.language)
  const reduceMotion = useReducedMotion()

  return (
    <>
      <section className="relative isolate overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900 via-gray-950 to-gray-950" />
        <div className="container mx-auto grid min-h-[480px] items-center gap-10 px-4 py-20 md:grid-cols-2">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">{t('brandTagline', language)}</p>
            <h1 className="mb-5 text-5xl font-black leading-tight md:text-7xl">{t('home.hero', language)}</h1>
            <p className="mb-8 max-w-lg text-lg text-gray-300">{t('home.subtitle', language)}</p>
            <Link to="/shop" className="inline-flex items-center rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 px-5 py-3 font-semibold text-white transition hover:shadow-lg">{t('home.cta', language)} <ArrowRight className="ml-2" size={18} /></Link>
          </motion.div>
          <div className="relative hidden md:block">
            <div className="absolute inset-10 rounded-full bg-primary-600/30 blur-3xl" />
            <motion.img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000" alt={t('headphones', language)} animate={reduceMotion ? undefined : { y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="relative mx-auto max-h-[360px] rounded-3xl object-cover shadow-2xl shadow-primary-950/50" />
          </div>
        </div>
      </section>
      <section className="bg-gray-100 py-8 dark:bg-gray-800">
        <div className="container mx-auto grid gap-5 px-4 sm:grid-cols-3">
          {[{ icon: Zap, title: 'fastDelivery', detail: 'fastDeliveryDesc' }, { icon: ShieldCheck, title: 'officialWarranty', detail: 'officialWarrantyDesc' }, { icon: Truck, title: 'freeDelivery', detail: 'freeDeliveryDesc' }].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="flex items-center gap-4 rounded-2xl bg-white p-5 dark:bg-gray-900"><Icon className="text-primary-600" size={30} /><div><h2 className="font-semibold">{t(title, language)}</h2><p className="text-sm text-gray-500">{t(detail, language)}</p></div></div>
          ))}
        </div>
      </section>
      <section className="page-shell">
        <div className="mb-6 flex items-end justify-between gap-4"><div><p className="mb-2 text-sm uppercase tracking-widest text-primary-600">{t('whyNexus', language)}</p><h2 className="text-3xl font-bold">{t('home.featured', language)}</h2></div><Link to="/shop" className="text-sm font-semibold text-primary-600 hover:underline">{t('shopAll', language)}</Link></div>
        <ProductGrid products={products.slice(0, 4)} />
      </section>
    </>
  )
}