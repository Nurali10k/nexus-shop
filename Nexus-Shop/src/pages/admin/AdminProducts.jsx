import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Image } from 'lucide-react';
import { addProduct, updateProduct, deleteProduct } from '../../store/slices/productsSlice';
import { addToast } from '../../store/slices/uiSlice';

export default function AdminProducts() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    rating: '',
    image: '',
    description: '',
    stock: ''
  });

  const resetForm = () => {
    setForm({ name: '', category: '', price: '', rating: '', image: '', description: '', stock: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      rating: product.rating.toString(),
      image: product.image,
      description: product.description,
      stock: product.stock?.toString() || '0'
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const productData = {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      rating: parseFloat(form.rating),
      image: form.image,
      description: form.description,
      stock: parseInt(form.stock) || 0
    };

    if (editingId) {
      dispatch(updateProduct({ ...productData, id: editingId }));
      dispatch(addToast({ message: 'Товар обновлён!', type: 'success', id: Date.now() }));
    } else {
      dispatch(addProduct({ ...productData, id: Date.now() }));
      dispatch(addToast({ message: 'Товар добавлен!', type: 'success', id: Date.now() }));
    }

    resetForm();
  };

  const handleDelete = (id) => {
    if (confirm('Удалить этот товар?')) {
      dispatch(deleteProduct(id));
      dispatch(addToast({ message: 'Товар удалён', type: 'info', id: Date.now() }));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Товары ({products.length})</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Добавить товар
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6 mb-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingId ? 'Редактировать товар' : 'Новый товар'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-red-500">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Название"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="Категория (headphones, keyboards, mice, watches)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="number"
                placeholder="Цена"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
                required
                min="0"
              />
              <input
                type="number"
                placeholder="Рейтинг (1-5)"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="input-field"
                required
                min="1"
                max="5"
                step="0.1"
              />
              <input
                type="number"
                placeholder="Количество на складе"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="input-field"
                required
                min="0"
              />
              <input
                type="url"
                placeholder="URL изображения"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="input-field"
                required
              />
              <textarea
                placeholder="Описание"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field md:col-span-2"
                rows="3"
                required
              />
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save size={18} />
                  {editingId ? 'Сохранить' : 'Добавить'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Отмена
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <motion.div
            key={product.id}
            layout
            className="card p-4"
          >
            <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-3" />
            <h3 className="font-bold truncate">{product.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{product.category}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="font-bold text-purple-500">{product.price.toLocaleString()} ₽</span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                ⭐ {product.rating}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">На складе: {product.stock || 0} шт.</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(product)}
                className="flex-1 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center gap-1"
              >
                <Edit2 size={14} /> Изменить
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="py-2 px-3 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}