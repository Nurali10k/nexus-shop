import { Link } from 'react-router-dom';

export default function SectionHeading({ eyebrow, title, linkLabel, to = '/shop' }) {
  return <div className="mb-6 flex items-end justify-between gap-4">
    <div><p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-500">{eyebrow}</p><h2 className="text-2xl font-bold tracking-tight text-gray-100 sm:text-3xl">{title}</h2></div>
    {linkLabel && <Link to={to} className="inline-flex items-center gap-2 pb-1 text-sm font-medium text-primary-500 transition hover:text-primary-600">{linkLabel}<span aria-hidden="true">↗</span></Link>}
  </div>;
}
