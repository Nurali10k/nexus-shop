import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import ProductGrid from '../components/product/ProductGrid'
import BenefitsSection from '../components/layout/BenefitsSection'
import SectionHeading from '../components/layout/SectionHeading'
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
      <BenefitsSection />
      <section className="page-shell">
        <SectionHeading eyebrow={t('whyNexus', language)} title={t('home.featured', language)} linkLabel={t('shopAll', language)} />
        <ProductGrid products={products.slice(0, 4)} />
      </section>
    </>
  )
}
