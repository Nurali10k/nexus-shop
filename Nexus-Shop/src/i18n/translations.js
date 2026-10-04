export const translations = {
  ru: {
    nav: { home: 'Главная', shop: 'Магазин', cart: 'Корзина', wishlist: 'Избранное', profile: 'Профиль', admin: 'Админ', login: 'Войти', logout: 'Выйти' },
    home: { hero: 'Технологии будущего', subtitle: 'Откройте для себя NEXUS', cta: 'Перейти в каталог', featured: 'Популярные товары' },
    shop: { title: 'Каталог', search: 'Поиск товаров...', filter: 'Фильтры', price: 'Цена', category: 'Категория', rating: 'Рейтинг', sort: 'Сортировка', all: 'Все' },
    product: { addToCart: 'В корзину', buyNow: 'Купить сейчас', reviews: 'Отзывы', description: 'Описание', inStock: 'В наличии' },
    cart: { title: 'Корзина', empty: 'Корзина пуста', total: 'Итого', checkout: 'Оформить заказ', remove: 'Удалить' },
    auth: { login: 'Вход', register: 'Регистрация', email: 'Email', password: 'Пароль', name: 'Имя', submit: 'Продолжить', noAccount: 'Нет аккаунта?', haveAccount: 'Уже есть аккаунт?' },
    admin: { dashboard: 'Панель управления', products: 'Товары', orders: 'Заказы', addProduct: 'Добавить товар', edit: 'Редактировать', delete: 'Удалить', save: 'Сохранить' },
    common: { loading: 'Загрузка...', error: 'Ошибка', success: 'Успешно', cancel: 'Отмена', confirm: 'Подтвердить' },
  },
  en: {
    nav: { home: 'Home', shop: 'Shop', cart: 'Cart', wishlist: 'Wishlist', profile: 'Profile', admin: 'Admin', login: 'Sign in', logout: 'Sign out' },
    home: { hero: 'Technology of tomorrow', subtitle: 'Discover NEXUS', cta: 'Explore the catalog', featured: 'Featured products' },
    shop: { title: 'Catalog', search: 'Search products...', filter: 'Filters', price: 'Price', category: 'Category', rating: 'Rating', sort: 'Sort', all: 'All' },
    product: { addToCart: 'Add to cart', buyNow: 'Buy now', reviews: 'Reviews', description: 'Description', inStock: 'In stock' },
    cart: { title: 'Cart', empty: 'Your cart is empty', total: 'Total', checkout: 'Checkout', remove: 'Remove' },
    auth: { login: 'Sign in', register: 'Create account', email: 'Email', password: 'Password', name: 'Name', submit: 'Continue', noAccount: "Don't have an account?", haveAccount: 'Already have an account?' },
    admin: { dashboard: 'Dashboard', products: 'Products', orders: 'Orders', addProduct: 'Add product', edit: 'Edit', delete: 'Delete', save: 'Save' },
    common: { loading: 'Loading...', error: 'Error', success: 'Success', cancel: 'Cancel', confirm: 'Confirm' },
  },
  kg: {
    nav: { home: 'Башкы бет', shop: 'Дүкөн', cart: 'Себет', wishlist: 'Тандалмалар', profile: 'Профиль', admin: 'Админ', login: 'Кирүү', logout: 'Чыгуу' },
    home: { hero: 'Келечектин технологиясы', subtitle: 'NEXUS менен таанышыңыз', cta: 'Каталогго өтүү', featured: 'Популярдуу товарлар' },
    shop: { title: 'Каталог', search: 'Товар издөө...', filter: 'Чыпкалар', price: 'Баасы', category: 'Категория', rating: 'Рейтинг', sort: 'Иреттөө', all: 'Баары' },
    product: { addToCart: 'Себетке кошуу', buyNow: 'Сатып алуу', reviews: 'Пикирлер', description: 'Сүрөттөмө', inStock: 'Бар' },
    cart: { title: 'Себет', empty: 'Себет бош', total: 'Жалпы', checkout: 'Буйрутма берүү', remove: 'Өчүрүү' },
    auth: { login: 'Кирүү', register: 'Катталуу', email: 'Email', password: 'Сыр сөз', name: 'Аты', submit: 'Улантуу', noAccount: 'Аккаунтуңуз жокпу?', haveAccount: 'Аккаунтуңуз барбы?' },
    admin: { dashboard: 'Башкаруу панели', products: 'Товарлар', orders: 'Буйрутмалар', addProduct: 'Товар кошуу', edit: 'Өзгөртүү', delete: 'Өчүрүү', save: 'Сактоо' },
    common: { loading: 'Жүктөлүүдө...', error: 'Ката', success: 'Ийгиликтүү', cancel: 'Жокко чыгаруу', confirm: 'Ырастоо' },
  },
}

export function t(key, language = window.localStorage.getItem('language') || 'ru') {
  const value = key.split('.').reduce((result, part) => result?.[part], translations[language] ?? translations.ru)
  return typeof value === 'string' ? value : key
}