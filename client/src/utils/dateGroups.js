export function groupSessionsByDate(sessions) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const startOfLast7Days = new Date(startOfToday)
  startOfLast7Days.setDate(startOfLast7Days.getDate() - 7)

  const groups = {
    today: { key: 'today', label: 'Hari Ini', items: [] },
    yesterday: { key: 'yesterday', label: 'Kemarin', items: [] },
    week: { key: 'week', label: '7 Hari Terakhir', items: [] },
    older: { key: 'older', label: 'Lebih Lama', items: [] },
  }

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

  for (const session of sorted) {
    const updated = new Date(session.updatedAt)
    if (updated >= startOfToday) {
      groups.today.items.push(session)
    } else if (updated >= startOfYesterday) {
      groups.yesterday.items.push(session)
    } else if (updated >= startOfLast7Days) {
      groups.week.items.push(session)
    } else {
      groups.older.items.push(session)
    }
  }

  return Object.values(groups).filter((group) => group.items.length > 0)
}

export function formatMessageTime(isoString) {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return ''
  }
}

export function extractDomain(url) {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
