const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character])

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = globalThis.process?.env ?? {}
  if (!token || !chatId) {
    return response.status(503).json({ error: 'Telegram notifications are not configured on the server.' })
  }

  const order = request.body
  if (
    !order ||
    !(typeof order.id === 'string' || Number.isSafeInteger(order.id)) ||
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

  const message = `🚀 <b>НОВЫЙ ЗАКАЗ NEXUS #${escapeHtml(order.id)}</b>\n\n` +
    `👤 <b>Клиент:</b> ${escapeHtml(order.name.slice(0, 100))}\n` +
    `📞 <b>Телефон:</b> ${escapeHtml(order.phone.slice(0, 40))}\n` +
    `📍 <b>Адрес:</b> ${escapeHtml(order.address.slice(0, 300))}\n\n` +
    `🛒 <b>Товары:</b>\n${lines.join('\n')}\n\n` +
    `💰 <b>ИТОГО:</b> ${calculatedTotal.toLocaleString('ru-RU')} ₽\n` +
    `💳 <b>Оплата:</b> ${order.payment === 'card' ? 'Картой' : 'Наличными'}\n` +
    '📊 <b>Статус:</b> Новый'

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    })
    const telegramResult = await telegramResponse.json().catch(() => null)
    if (!telegramResponse.ok || !telegramResult?.ok) {
      console.error('[Telegram] sendMessage failed', telegramResult?.description || telegramResponse.status)
      return response.status(502).json({ error: 'Telegram did not accept the order notification.' })
    }
    return response.status(200).json({ ok: true })
  } catch (error) {
    console.error('[Telegram] Unable to reach Telegram', error)
    return response.status(502).json({ error: 'Unable to reach Telegram.' })
  }
}
