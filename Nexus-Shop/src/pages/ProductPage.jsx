import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../components/ui/Button';
import StarRating from '../components/ui/StarRating';
import ReviewsSection from '../components/reviews/ReviewsSection';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { addToast } from '../store/slices/uiSlice';
import { productDescription, t } from '../i18n/translations';

export default function ProductPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector((state) => state.products.items.find((item) => String(item.id) === id));
  const language = useSelector((state) => state.ui.language);
  const isInWishlist = useSelector((state) => state.wishlist.items.some((item) => String(item.id) === String(product?.id)));
  const [quantity, setQuantity] = useState(1);

  if (!product) return <section className="bg-gray-900 px-4 py-20 text-center text-white"><h1 className="text-3xl font-bold">{t('noProducts', language)}</h1><Link to="/shop" className="mt-4 inline-block text-purple-400 hover:text-purple-300">{t('shop.title', language)} →</Link></section>;

  const addProduct = () => {
    dispatch(addToCart({ ...product, quantity }));
    dispatch(addToast({ message: `${product.name} × ${quantity} ${t('addedToCart', language)}`, type: 'success' }));
  };
  const stock = Math.max(0, Number(product.stock) || 0);
  const category = product.category ? t(product.category, language) : t('noCategory', language);
  const description = productDescription(product, language);

  return (
    <section className="bg-gray-900 py-8 text-gray-100 sm:py-12">
      <div className="container mx-auto px-4">
        <Link to="/shop" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-purple-400 transition hover:text-purple-300">← {t('shop.title', language)}</Link>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="grid min-h-[320px] place-items-center overflow-hidden rounded-2xl bg-gray-800 p-5 shadow-xl shadow-black/10 sm:min-h-[480px] sm:p-8">
            <img src={product.image} alt={product.name} loading="lazy" className="max-h-[560px] w-full rounded-xl object-contain" />
          </div>

          <div className="flex flex-col justify-center py-2 sm:py-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">{category}</p>
            <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">{product.name}</h1>
            <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-400">
              <StarRating rating={Number(product.avgRating || 0)} size={16} />
              <span>({Number(product.reviewCount || 0)} {t('product.reviews', language).toLowerCase()})</span>
            </div>
            {description && <p className="mb-6 max-w-xl text-base leading-7 text-gray-300">{description}</p>}
            <p className="mb-3 text-3xl font-bold text-white">{Number(product.price || 0).toLocaleString('ru-RU')} сом</p>
            <p className="mb-6 text-sm text-gray-400">{t('product.inStock', language)}: {stock}</p>

            <div className="mb-6 flex flex-wrap items-center gap-4">
              <span className="font-medium text-gray-200">{t('quantity', language)}</span>
              <div className="inline-flex items-center overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
                <button type="button" aria-label={t('decreaseQuantity', language)} onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1} className="p-3 text-gray-300 transition hover:text-purple-400 disabled:opacity-40"><Minus size={16} /></button>
                <output className="min-w-10 text-center font-semibold" aria-live="polite">{quantity}</output>
                <button type="button" aria-label={t('increaseQuantity', language)} onClick={() => setQuantity((current) => Math.min(stock || 1, current + 1))} disabled={quantity >= stock} className="p-3 text-gray-300 transition hover:text-purple-400 disabled:opacity-40"><Plus size={16} /></button>
              </div>
              <span className="text-sm text-gray-500">{t('available', language)}: {stock}</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={addProduct} disabled={stock < 1}><ShoppingCart className="mr-2 inline" size={18} />{t('product.addToCart', language)}</Button>
              <Button variant="secondary" onClick={() => dispatch(toggleWishlist(product))}><Heart className={`mr-2 inline ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} size={18} />{t(isInWishlist ? 'removeFromWishlist' : 'addToWishlist', language)}</Button>
            </div>
          </div>
        </div>
        <div className="mt-12 sm:mt-16"><ReviewsSection productId={product.id} product={product} /></div>
      </div>
    </section>
  );
}
