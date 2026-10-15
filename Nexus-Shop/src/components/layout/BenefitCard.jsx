export default function BenefitCard({ icon: Icon, title, description }) {
  return <article className="flex items-center gap-4 rounded-2xl bg-white p-5 dark:bg-gray-900">
    <Icon className="shrink-0 text-primary-600" size={30} />
    <div><h2 className="font-semibold">{title}</h2><p className="text-sm text-gray-500">{description}</p></div>
  </article>
}
