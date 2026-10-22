import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loadProductReviews, saveProductReview, voteReview } from '../../store/slices/reviewsSlice';
import { hasCompletedPurchase } from '../../services/reviews';
import ReviewFormModal from './ReviewFormModal';
import StarRating from '../ui/StarRating';

const timestamp = (value) => {
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value === 'number') return new Date(value);
  return value ? new Date(value) : null;
};

const reviewCopy = {
  ru: { title: 'Отзывы покупателей', write: 'Написать отзыв', edit: 'Изменить свой отзыв', login: 'Войдите', loginSuffix: ', чтобы оставить отзыв после покупки.', purchaseOnly: 'Оставить отзыв можно после завершённого заказа с этим товаром.', showing: 'Показываем отзывы покупателей', sort: 'Сортировка', newest: 'Сначала новые', helpful: 'Самые полезные', loading: 'Загружаем отзывы…', loadError: 'Не удалось загрузить отзывы:', empty: 'Пока отзывов нет.', buyer: 'Покупатель', verified: 'Подтверждённая покупка', useful: 'Полезно' },
  en: { title: 'Customer reviews', write: 'Write a review', edit: 'Edit your review', login: 'Sign in', loginSuffix: ' to review this product after purchase.', purchaseOnly: 'You can review this product after completing an order.', showing: 'Customer reviews', sort: 'Sort by', newest: 'Newest first', helpful: 'Most helpful', loading: 'Loading reviews…', loadError: 'Could not load reviews:', empty: 'No reviews yet.', buyer: 'Customer', verified: 'Verified purchase', useful: 'Helpful' },
  kg: { title: 'Кардарлардын пикирлери', write: 'Пикир жазуу', edit: 'Пикирди өзгөртүү', login: 'Кириңиз', loginSuffix: ', сатып алгандан кийин пикир калтыруу үчүн.', purchaseOnly: 'Бул товарга пикирди буйрутма аяктагандан кийин калтыра аласыз.', showing: 'Кардарлардын пикирлери', sort: 'Иреттөө', newest: 'Жаңылары биринчи', helpful: 'Эң пайдалуулары', loading: 'Пикирлер жүктөлүүдө…', loadError: 'Пикирлер жүктөлгөн жок:', empty: 'Азырынча пикирлер жок.', buyer: 'Кардар', verified: 'Сатып алуу тастыкталды', useful: 'Пайдалуу' },
};

export default function ReviewsSection({ productId, product }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const language = useSelector((state) => state.ui.language);
  const copy = reviewCopy[language] || reviewCopy.ru;
  const reviews = useSelector((state) => state.reviews.byProduct[String(productId)] || []);
  const loading = useSelector((state) => state.reviews.loading[String(productId)]);
  const reviewsError = useSelector((state) => state.reviews.error);
  const saving = useSelector((state) => state.reviews.saving);
  const voting = useSelector((state) => state.reviews.voting);
  const [purchased, setPurchased] = useState(false);
  const [purchaseChecked, setPurchaseChecked] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [sort, setSort] = useState('newest');

  useEffect(() => { dispatch(loadProductReviews(productId)); }, [dispatch, productId]);
  useEffect(() => {
    let active = true;
    setPurchaseChecked(false);
    hasCompletedPurchase(productId).then((result) => {
      if (active) { setPurchased(result); setPurchaseChecked(true); }
    }).catch(() => { if (active) setPurchaseChecked(true); });
    return () => { active = false; };
  }, [productId, user?.id]);

  const average = useMemo(() => Number(product?.reviewCount) > 0
    ? Number(product.avgRating || 0)
    : reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 0,
  [reviews, product?.avgRating, product?.reviewCount]);
  const reviewCount = Number(product?.reviewCount ?? reviews.length);
  const sortedReviews = useMemo(() => [...reviews].sort((a, b) => {
    if (sort === 'helpful') return Number(b.helpfulVotes || 0) - Number(a.helpfulVotes || 0);
    return (timestamp(b.createdAt)?.getTime() || 0) - (timestamp(a.createdAt)?.getTime() || 0);
  }), [reviews, sort]);
  const ownReview = reviews.find((review) => review.userId === user?.id);

  const submit = async (review) => {
    await dispatch(saveProductReview({ productId: String(productId), ...review })).unwrap();
    await dispatch(loadProductReviews(productId));
  };

  const vote = async (reviewId, value) => {
    await dispatch(voteReview({ productId: String(productId), reviewId, value })).unwrap();
  };

  return (
    <section className="mt-12" aria-labelledby="reviews-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="reviews-title" className="text-2xl font-bold">{copy.title}</h2>
          <div className="mt-2 flex items-center gap-3"><StarRating rating={average} /><span className="text-sm text-gray-500">{average ? average.toFixed(1) : '—'} · {reviewCount} отзывов</span></div>
        </div>
        {user && purchased && purchaseChecked && <button type="button" onClick={() => setFormOpen(true)} className="rounded-xl bg-purple-600 px-4 py-2.5 font-semibold text-white hover:bg-purple-700">{ownReview ? copy.edit : copy.write}</button>}
      </div>
      {!user && <p className="mb-4 text-sm text-gray-500"><Link className="text-purple-600 underline" to="/login">{copy.login}</Link>{copy.loginSuffix}</p>}
      {user && purchaseChecked && !purchased && <p className="mb-4 text-sm text-gray-500">{copy.purchaseOnly}</p>}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{copy.showing}</p>
        <label className="flex items-center gap-2 text-sm">{copy.sort}
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800">
            <option value="newest">{copy.newest}</option><option value="helpful">{copy.helpful}</option>
          </select>
        </label>
      </div>
      {loading && !reviews.length && <p className="py-8 text-center text-sm text-gray-500">{copy.loading}</p>}
      {!loading && reviewsError && !reviews.length && <p role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{copy.loadError} {reviewsError}</p>}
      {!loading && !reviewsError && !reviews.length && <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700">{copy.empty}</p>}
      <div className="space-y-3">
        {sortedReviews.map((review) => {
          const date = timestamp(review.createdAt);
          return (
            <article key={review.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {review.userPhotoURL ? <img src={review.userPhotoURL} alt="" loading="lazy" className="h-10 w-10 rounded-full object-cover" /> : <div aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-purple-100 font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">{String(review.userName || copy.buyer).slice(0, 1).toUpperCase()}</div>}
                  <div><p className="font-semibold">{review.userName || copy.buyer}</p>{date && <time className="text-xs text-gray-500" dateTime={date.toISOString()}>{date.toLocaleDateString(language === 'kg' ? 'ky-KG' : language === 'en' ? 'en-US' : 'ru-RU')}</time>}</div>
                </div>
                <div className="flex items-center gap-2"><StarRating rating={Number(review.rating)} /><span className="text-sm font-semibold">{review.rating}/5</span></div>
              </div>
              {review.verifiedPurchase && <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">{copy.verified}</span>}
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">{review.comment || review.text}</p>
              {Array.isArray(review.images) && review.images.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{review.images.slice(0, 3).map((imageUrl) => <a key={imageUrl} href={imageUrl} target="_blank" rel="noreferrer" aria-label="Открыть фото из отзыва"><img src={imageUrl} alt="Фото товара из отзыва" loading="lazy" className="h-20 w-20 rounded-lg object-cover" /></a>)}</div>}
              {user && user.id !== review.userId && <div className="mt-4 flex items-center gap-2">
                <button type="button" aria-label={copy.useful} disabled={Boolean(voting[review.id])} onClick={() => vote(review.id, 1)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-700"><ThumbsUp size={14} /> {copy.useful} <span>{review.helpfulVotes || 0}</span></button>
                <button type="button" aria-label="Отметить отзыв как бесполезный" disabled={Boolean(voting[review.id])} onClick={() => vote(review.id, -1)} className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-700"><ThumbsDown size={14} /></button>
              </div>}
            </article>
          );
        })}
      </div>
      <ReviewFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} saving={saving} initialReview={ownReview} />
    </section>
  );
}
