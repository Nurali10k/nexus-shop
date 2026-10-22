import { useEffect, useState } from 'react';
import { Star, X } from 'lucide-react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, storage } from '../../firebase';

export default function ReviewFormModal({ open, onClose, onSubmit, saving, initialReview }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setRating(Number(initialReview?.rating) || 5);
    setText(initialReview?.comment || initialReview?.text || '');
    setFiles([]);
    setError('');
  }, [open, initialReview]);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (!text.trim()) { setError('Напишите пару слов о товаре.'); return; }
    setError('');
    setBusy(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Войдите в аккаунт, чтобы оставить отзыв.');
      const uploadedImages = await Promise.all(files.map(async (file) => {
        const imageRef = ref(storage, `review-images/${uid}/${crypto.randomUUID()}-${file.name}`);
        await uploadBytes(imageRef, file, { contentType: file.type });
        return getDownloadURL(imageRef);
      }));
      await onSubmit({ rating, comment: text.trim(), images: [...(initialReview?.images || []), ...uploadedImages] });
      setText('');
      setFiles([]);
      setRating(5);
      onClose();
    } catch (submitError) {
      setError(submitError.message || 'Не удалось сохранить отзыв.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="review-form-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="review-form-title" className="text-xl font-bold">Оставить отзыв</h2>
          <button type="button" onClick={onClose} aria-label="Закрыть форму отзыва" className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Оценка</legend>
            <div className="flex gap-1" role="radiogroup" aria-label="Оценка от 1 до 5" onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); setRating((current) => Math.min(5, current + 1)); }
              if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); setRating((current) => Math.max(1, current - 1)); }
            }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} из 5`} onClick={() => setRating(value)} className="rounded p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500">
                  <Star size={27} className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500" aria-live="polite">Выбрано: {rating} из 5</p>
          </fieldset>
          <label className="block text-sm font-medium" htmlFor="review-comment">Комментарий</label>
          <textarea id="review-comment" value={text} onChange={(event) => setText(event.target.value)} maxLength={1000} required rows={5} placeholder="Поделитесь впечатлениями о покупке" className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm dark:border-gray-600 dark:bg-gray-900" />
          <p className="text-right text-xs text-gray-500">{text.length}/1000</p>
          <label className="block text-sm font-medium">Фото товара (необязательно)
            <input type="file" accept="image/*" multiple onChange={(event) => {
              const selectedFiles = Array.from(event.target.files || []);
              const imageLimit = Math.max(0, 3 - (initialReview?.images?.length || 0));
              const validFiles = selectedFiles.filter((file) => file.type.startsWith('image/') && file.size < 5 * 1024 * 1024).slice(0, imageLimit);
              setFiles(validFiles);
              setError(selectedFiles.length > validFiles.length ? 'Можно прикрепить до 3 изображений размером до 5 МБ каждое.' : '');
            }} className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-purple-100 file:px-3 file:py-2 file:font-medium file:text-purple-700" />
          </label>
          {files.length > 0 && <p className="text-xs text-gray-500">Выбрано файлов: {files.length}</p>}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving || busy} className="w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50">{saving || busy ? 'Сохраняем…' : 'Опубликовать отзыв'}</button>
        </form>
      </section>
    </div>
  );
}
