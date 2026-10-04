const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
})[character])

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  const environment = globalThis.process?.env ?? {}
  const token = environment.TELEGRAM_BOT_TOKEN
  const chatId = environment.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    return response.status(503).json({ error: 'Telegram notifications are not configured on the server.' })
  }

  const order = request.body
  if (
    !order ||
    !Number.isSafeInteger(order.id) ||
    typeof order.name !== 'string' ||
    typeof order.phone !== 'string' ||
    typeof order.address !== 'string' ||
    !Array.isArray(order.items) ||
    order.items.length === 0 ||
    order.items.length > 50 ||
    !Number.isFinite(order.total) ||
    order.total < 0
  ) {
    return response.status(400).json({ error: 'Invalid order data.' })
  }

  const lines = []
  let calculatedTotal = 0
  for (const item of order.items) {
    if (
      typeof item.name !== 'string' ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      !Number.isFinite(item.price) ||
      item.price < 0
    ) {
      return response.status(400).json({ error: 'Invalid order item.' })
    }
    calculatedTotal += item.price * item.quantity
    lines.push(`• ${escapeHtml(item.name.slice(0, 120))} × ${item.quantity} — ${(item.price * item.quantity).toLocaleString('ru-RU')} ₽`)
  }
  if (!Number.isFinite(calculatedTotal) || Math.abs(calculatedTotal - order.total) > 0.01) {
    return response.status(400).json({ error: 'Order total does not match its items.' })
  }

  const payment = order.payment === 'cash' ? 'Наличные' : 'Банковская карта'
  const message = [
    `<b>Новый заказ NEXUS #${order.id}</b>`,
    '',
    `<b>Клиент:</b> ${escapeHtml(order.name.slice(0, 100))}`,
    `<b>Телефон:</b> ${escapeHtml(order.phone.slice(0, 40))}`,
    `<b>Адрес:</b> ${escapeHtml(order.address.slice(0, 300))}`,
    '',
    '<b>Товары:</b>',
    ...lines,
    '',
    `<b>Итого:</b> ${calculatedTotal.toLocaleString('ru-RU')} ₽`,
    `<b>Оплата:</b> ${payment}`,
    '<b>Статус:</b> Новый',
  ].join('\n')

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    })
    if (!telegramResponse.ok) {
      return response.status(502).json({ error: 'Telegram did not accept the order notification.' })
    }
    return response.status(200).json({ ok: true })
  } catch {
    return response.status(502).json({ error: 'Unable to reach Telegram.' })
  }
}
