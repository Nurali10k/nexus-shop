import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { addToCart } from '../store/slices/cartSlice';
import { clearWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { addToast } from '../store/slices/uiSlice';
import { t } from '../i18n/translations';

export default function Wishlist() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.wishlist.items);
  const language = useSelector((state) => state.ui.language);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Heart size={80} className="mx-auto mb-4 text-gray-300" />
          <h1 className="mb-4 text-3xl font-bold">{t('emptyWishlist', language)}</h1>
          <p className="mb-6 text-gray-500">{t('addWishlistFromCatalog', language)}</p>
          <Link to="/shop" className="btn-primary inline-block">
            {t('goToShop', language)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-bold">{t('wishlist', language)} ({items.length})</h1>
          <button
            type="button"
            onClick={() => dispatch(clearWishlist())}
            className="text-sm text-red-500 hover:text-red-600"
          >
            {t('clearWishlist', language)}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="card overflow-hidden">
              <Link to={`/product/${item.id}`}>
                <img src={item.image} alt={item.name} className="h-52 w-full object-cover" />
              </Link>
              <div className="p-4">
                <p className="mb-1 text-xs uppercase tracking-wider text-primary-600">{item.category ? t(item.category, language) : t('noCategory', language)}</p>
                <Link to={`/product/${item.id}`} className="font-semibold hover:text-primary-600">
                  {item.name}
                </Link>
                <p className="my-3 text-lg font-bold">{item.price.toLocaleString('ru-RU')} ₽</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={item.stock < 1}
                    onClick={() => {
                      dispatch(addToCart(item));
                      dispatch(addToast({ id: Date.now(), message: `${item.name} ${t('addedToCart', language)}`, type: 'success' }));
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart size={16} />
                    {t('addToCartShort', language)}
                  </button>
                  <button
                    type="button"
                    aria-label={`${t('removeFromWishlist', language)}: ${item.name}`}
                    onClick={() => dispatch(removeFromWishlist(item.id))}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
