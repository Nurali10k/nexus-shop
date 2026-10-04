import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { addProduct, deleteProduct, updateProduct } from '../../store/slices/productsSlice'
import { addToast } from '../../store/slices/uiSlice'

const emptyProduct = { name: '', category: 'headphones', price: '', rating: '4.5', image: '', description: '', stock: '1' }

export default function AdminProducts() {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.products.items)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const closeModal = useCallback(() => setIsOpen(false), [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyProduct)
    setIsOpen(true)
  }

  const openEdit = (product) => {
    setEditingId(product.id)
    setForm({ ...product, price: String(product.price), rating: String(product.rating), stock: String(product.stock) })
    setIsOpen(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const product = { ...form, price: Number(form.price), rating: Number(form.rating), stock: Number(form.stock) }
    if (editingId) dispatch(updateProduct({ ...product, id: editingId }))
    else dispatch(addProduct({ ...product, id: Date.now() }))
    dispatch(addToast({ id: Date.now(), message: editingId ? 'Товар обновлён' : 'Товар добавлен', type: 'success' }))
    closeModal()
  }

  const handleDelete = (product) => {
    if (!window.confirm(`Удалить товар «${product.name}»?`)) return
    dispatch(deleteProduct(product.id))
    dispatch(addToast({ id: Date.now(), message: 'Товар удалён', type: 'success' }))
  }

  return (
    <section className="page-shell">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-sm uppercase tracking-widest text-primary-600">NEXUS / ADMIN</p><h1 className="text-4xl font-bold">Товары</h1></div><Button onClick={openCreate}><Plus className="mr-1 inline" size={18} />Добавить товар</Button></div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-700"><tr><th className="p-4">Товар</th><th className="p-4">Категория</th><th className="p-4">Цена</th><th className="p-4">Остаток</th><th className="p-4">Действия</th></tr></thead>
          <tbody>{products.map((product) => <tr key={product.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800"><td className="p-4 font-medium">{product.name}</td><td className="p-4 capitalize">{product.category}</td><td className="p-4">{product.price.toLocaleString('ru-RU')} ₽</td><td className="p-4">{product.stock}</td><td className="p-4"><div className="flex gap-3"><button type="button" aria-label={`Изменить ${product.name}`} onClick={() => openEdit(product)} className="text-primary-600"><Pencil size={17} /></button><button type="button" aria-label={`Удалить ${product.name}`} onClick={() => handleDelete(product)} className="text-red-500"><Trash2 size={17} /></button></div></td></tr>)}</tbody>
        </table>
      </div>
      <Modal open={isOpen} onClose={closeModal} title={editingId ? 'Редактировать товар' : 'Новый товар'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">Название<input className="input-field mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label className="block text-sm">Категория<select className="input-field mt-1" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="headphones">Наушники</option><option value="keyboards">Клавиатуры</option><option value="mice">Мыши</option><option value="watches">Часы</option></select></label>
          <div className="grid grid-cols-3 gap-3"><label className="text-sm">Цена<input type="number" min="1" className="input-field mt-1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label><label className="text-sm">Рейтинг<input type="number" min="0" max="5" step="0.1" className="input-field mt-1" value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} required /></label><label className="text-sm">Остаток<input type="number" min="0" className="input-field mt-1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required /></label></div>
          <label className="block text-sm">Ссылка на изображение<input type="url" className="input-field mt-1" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} required /></label>
          <label className="block text-sm">Описание<textarea className="input-field mt-1" rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
          <Button type="submit" className="w-full">Сохранить</Button>
        </form>
      </Modal>
    </section>
  )
}