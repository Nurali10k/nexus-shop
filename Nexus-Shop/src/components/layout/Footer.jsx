import { Link } from 'react-router-dom';
import { Globe, Mail, Headphones } from 'lucide-react';

const navigation = [
  { to: '/shop', label: 'Shop' },
  { to: '/my-orders', label: 'My orders' },
  { to: '/support', label: 'Support' },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-base">
      <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto_auto] md:items-center lg:px-8">
        <div>
          <Link to="/" className="font-display text-xl font-bold tracking-tight text-white">NEXUS</Link>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Technology selected with care, backed by service you can trust.</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
          {navigation.map(({ to, label }) => <Link key={to} to={to} className="transition-colors hover:text-primary-500">{label}</Link>)}
        </nav>
        <div className="flex gap-3">
          {[
            { Icon: Globe, label: 'GitHub' },
            { Icon: Mail, label: 'Email' },
            { Icon: Headphones, label: 'Support' },
          ].map(({ Icon, label }) => <a key={label} href="#" aria-label={label} className="border-2 border-line p-2.5 text-muted transition hover:border-primary-500/50 hover:text-primary-500"><Icon size={17} strokeWidth={1.75} /></a>)}
        </div>
        <p className="border-t border-line pt-5 text-xs text-muted md:col-span-3">© {new Date().getFullYear()} NEXUS Shop. All rights reserved.</p>
      </div>
    </footer>
  );
}



