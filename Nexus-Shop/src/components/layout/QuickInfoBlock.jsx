import { CreditCard, Headphones, ShieldCheck, Truck } from 'lucide-react';

const content = {
  ru: [
    ['Официальная гарантия', 'Поддержка и сервис от NEXUS.', ShieldCheck],
    ['Быстрая доставка', 'Доставка по Бишкеку и регионам.', Truck],
    ['Безопасная оплата', 'Удобные и защищённые способы оплаты.', CreditCard],
    ['Поддержка каждый день', 'Поможем выбрать и настроить технику.', Headphones],
  ],
  en: [
    ['Official warranty', 'Support and service from NEXUS.', ShieldCheck],
    ['Fast delivery', 'Delivery in Bishkek and beyond.', Truck],
    ['Secure payment', 'Convenient and protected payment options.', CreditCard],
    ['Here to help', 'Get help choosing and setting up your tech.', Headphones],
  ],
  kg: [
    ['Расмий кепилдик', 'NEXUS колдоосу жана тейлөөсү.', ShieldCheck],
    ['Тез жеткирүү', 'Бишкекке жана аймактарга жеткирүү.', Truck],
    ['Коопсуз төлөм', 'Ыңгайлуу жана корголгон төлөм ыкмалары.', CreditCard],
    ['Күн сайын колдоо', 'Техника тандоого жардам беребиз.', Headphones],
  ],
};

export default function QuickInfoBlock({ language = 'en' }) {
  const items = content[language] || content.en;
  return (
    <section aria-label={language === 'ru' ? 'Преимущества магазина' : 'Store benefits'} className="border-y-2 border-line bg-base">
      <div className="container mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-8 sm:px-6 md:grid-cols-4 md:gap-4 lg:px-8">
        {items.map(([title, description, Icon]) => <article key={title} className="flex items-start gap-3 border-2 border-line bg-surface p-4 transition-all hover:-translate-y-1 hover:border-primary-500 sm:gap-4 sm:p-5">
          <Icon size={28} strokeWidth={1.7} className="mt-0.5 shrink-0 text-accent-500" aria-hidden="true" />
          <div className="min-w-0"><h2 className="mb-1 text-sm font-semibold text-white sm:text-base">{title}</h2><p className="line-clamp-2 text-xs leading-5 text-muted sm:text-sm">{description}</p></div>
        </article>)}
      </div>
    </section>
  );
}
