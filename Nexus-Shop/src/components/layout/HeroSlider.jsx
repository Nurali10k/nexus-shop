import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const copy = {
  ru: { eyebrow: 'Подборка недели', title: 'Техника, созданная для повседневной жизни.', description: 'Надёжные устройства, продуманные детали и сервис, на который можно положиться.', action: 'Смотреть подборку', fallback: 'Найдите технику для своих задач.' },
  en: { eyebrow: 'Weekly selection', title: 'Technology made for everyday life.', description: 'Reliable devices, thoughtful details and service you can count on.', action: 'Explore selection', fallback: 'Find the right technology for you.' },
  kg: { eyebrow: 'Аптанын тандоосу', title: 'Күнүмдүк жашоо үчүн технология.', description: 'Ишенимдүү түзмөктөр, ойлонулган деталдар жана сапаттуу тейлөө.', action: 'Тандоону көрүү', fallback: 'Өзүңүзгө ылайыктуу техниканы табыңыз.' },
};

export default function HeroSlider({ products = [] }) {
  const language = useSelector((state) => state.ui.language);
  const reduceMotion = useReducedMotion();
  const slides = products.filter((product) => product?.image).slice(0, 4);
  const [activeIndex, setActiveIndex] = useState(0);
  const text = copy[language] || copy.en;
  const activeProduct = slides[activeIndex];

  useEffect(() => {
    if (reduceMotion || slides.length < 2) return undefined;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [reduceMotion, slides.length]);

  const move = (direction) => setActiveIndex((index) => (index + direction + Math.max(slides.length, 1)) % Math.max(slides.length, 1));

  return (
    <section aria-roledescription="carousel" aria-label={text.eyebrow} className="blueprint-grid overflow-hidden bg-base text-white">
      <div className="container mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
        <div className="relative z-10">
          <p className="technical-kicker mb-4">{text.eyebrow}</p>
          <AnimatePresence mode="wait">
            <motion.div key={activeProduct?.id ?? 'featured-copy'} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: .22 }}>
              <h1 className="glitch-text max-w-xl font-display text-4xl font-bold uppercase leading-tight tracking-tight text-white sm:text-5xl">{activeProduct?.name || text.title}</h1>
              <p className="mt-4 max-w-lg border-l-2 border-accent-500 pl-4 font-mono text-sm leading-7 text-muted sm:text-base">{text.description || text.fallback}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={activeProduct ? `/product/${activeProduct.id}` : '/shop'} className="inline-flex min-h-12 items-center gap-2 border-2 border-primary-500 bg-primary-500 px-6 py-3 font-display font-bold uppercase text-black shadow-lg transition hover:bg-black hover:text-primary-500">{text.action}<ArrowRight size={17} /></Link>
            <Link to="/shop" className="inline-flex min-h-12 items-center border-2 border-line px-6 py-3 font-medium text-zinc-300 transition hover:border-white hover:bg-white hover:text-black">{language === 'ru' ? 'Весь каталог' : language === 'kg' ? 'Бардык каталог' : 'View all products'}</Link>
          </div>
        </div>

        <div className="product-glow relative mx-auto w-full max-w-xl">
          <div className="relative z-10 aspect-[1.2/1] min-h-[260px] overflow-hidden border-2 border-line bg-surface shadow-xl shadow-black/20">
            <AnimatePresence mode="wait">
              {activeProduct?.image ? <motion.img key={activeProduct.id} src={activeProduct.image} alt={activeProduct.name || 'Featured product'} loading="eager" initial={reduceMotion ? false : { opacity: 0, scale: .985 }} animate={{ opacity: 1, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, scale: .985 }} transition={{ duration: .3 }} className="h-full w-full object-contain p-8 sm:p-12" /> : <div className="grid h-full place-items-center px-8 text-center text-zinc-400">{text.fallback}</div>}
            </AnimatePresence>
            {activeProduct && <div className="absolute bottom-4 left-4 border-2 border-black bg-primary-500 px-3 py-1.5 font-mono text-sm font-bold tabular-nums text-black">{Number(activeProduct.price || 0).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')} сом</div>}
            {slides.length > 1 && <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
              {slides.map((product, index) => <button key={product.id} type="button" aria-label={`${language === 'ru' ? 'Слайд' : 'Slide'} ${index + 1}`} aria-current={index === activeIndex} onClick={() => setActiveIndex(index)} className={`h-2 transition-all ${index === activeIndex ? 'w-6 bg-primary-500' : 'w-2 bg-zinc-500/70 hover:bg-zinc-300'}`} />)}
            </div>}
          </div>
          {slides.length > 1 && <div className="absolute -bottom-6 right-1 z-20 flex gap-2">
            <button type="button" aria-label={language === 'ru' ? 'Предыдущий товар' : 'Previous slide'} onClick={() => move(-1)} className="border-2 border-line bg-surface p-2 text-zinc-300 transition hover:border-primary-500 hover:text-primary-500"><ChevronLeft size={18} /></button>
            <button type="button" aria-label={language === 'ru' ? 'Следующий товар' : 'Next slide'} onClick={() => move(1)} className="border-2 border-line bg-surface p-2 text-zinc-300 transition hover:border-primary-500 hover:text-primary-500"><ChevronRight size={18} /></button>
          </div>}
        </div>
      </div>
    </section>
  );
}

