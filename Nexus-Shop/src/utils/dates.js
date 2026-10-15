const PROJECT_TIME_ZONE = 'Asia/Bishkek'

function asDate(value) {
  if (value?.toDate) return value.toDate()
  if (value instanceof Date) return value
  return new Date(value)
}

// Приводит Firestore Timestamp и обычные даты к одному формату проекта.
export function formatProjectDate(value, locale = 'ru-RU') {
  const date = asDate(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: PROJECT_TIME_ZONE,
  }).format(date)
}

export function formatProjectTime(value, locale = 'ru-RU') {
  const date = asDate(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: PROJECT_TIME_ZONE,
  }).format(date)
}
