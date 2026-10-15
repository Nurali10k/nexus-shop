import { ShieldCheck, Truck, Zap } from 'lucide-react'
import { useSelector } from 'react-redux'
import { t } from '../../i18n/translations'
import BenefitCard from './BenefitCard'

const benefits = [
  { icon: Zap, title: 'fastDelivery', description: 'fastDeliveryDesc' },
  { icon: ShieldCheck, title: 'officialWarranty', description: 'officialWarrantyDesc' },
  { icon: Truck, title: 'freeDelivery', description: 'freeDeliveryDesc' },
]

export default function BenefitsSection() {
  const language = useSelector((state) => state.ui.language)
  return <section className="bg-gray-100 py-8 dark:bg-gray-800">
    <div className="container mx-auto grid gap-5 px-4 sm:grid-cols-3">
      {benefits.map((benefit) => <BenefitCard key={benefit.title} icon={benefit.icon} title={t(benefit.title, language)} description={t(benefit.description, language)} />)}
    </div>
  </section>
}
