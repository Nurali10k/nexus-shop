// Отправка уведомления через Resend. Секреты задаются только в окружении Vercel/локально.
export default async function emailOrderHandler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const { RESEND_API_KEY: apiKey, ORDER_NOTIFICATION_EMAIL: to, RESEND_FROM_EMAIL: from } = globalThis.process?.env ?? {};
  if (!apiKey || !to || !from) return response.status(503).json({ error: 'Email notification is not configured' });

  const order = request.body;
  if (!order || !Array.isArray(order.items) || !order.items.length) return response.status(400).json({ error: 'Invalid order payload' });

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const rows = order.items.map((item) => `<li>${escapeHtml(item.name)} × ${Number(item.quantity) || 1} — ${Number(item.price || 0).toLocaleString('ru-RU')} сом</li>`).join('');
  const html = `<h2>Новый заказ NEXUS</h2><p>Заказ: ${escapeHtml(order.id)}</p><p>Клиент: ${escapeHtml(order.name)}</p><p>Телефон: ${escapeHtml(order.phone)}</p><p>Адрес: ${escapeHtml(order.address)}</p><p>Оплата: ${escapeHtml(order.payment)}</p><ul>${rows}</ul><strong>Итого: ${Number(order.total || 0).toLocaleString('ru-RU')} сом</strong>`;

  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: `Новый заказ NEXUS ${order.id || ''}`, html }),
    });
    const data = await result.json().catch(() => ({}));
    if (!result.ok) {
      console.error('[Email] Resend rejected notification:', data.message || result.status);
      return response.status(502).json({ error: 'Email provider rejected notification' });
    }
    return response.status(200).json({ ok: true, id: data.id });
  } catch (error) {
    console.error('[Email] Failed to send notification:', error);
    return response.status(502).json({ error: 'Email provider is unavailable' });
  }
}
