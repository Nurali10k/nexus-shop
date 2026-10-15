import { Link } from 'react-router-dom'

export default function SectionHeading({ eyebrow, title, linkLabel, to = '/shop' }) {
  return <div className="mb-6 flex items-end justify-between gap-4">
    <div><p className="mb-2 text-sm uppercase tracking-widest text-primary-600">{eyebrow}</p><h2 className="text-3xl font-bold">{title}</h2></div>
    {linkLabel && <Link to={to} className="text-sm font-semibold text-primary-600 hover:underline">{linkLabel}</Link>}
  </div>
}
