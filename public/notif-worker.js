let lastChecked = Date.now()
let intervalId = null

self.onmessage = function (e) {
  if (e.data === 'start') {
    poll()
    intervalId = setInterval(poll, 30000)
  } else if (e.data === 'stop') {
    if (intervalId) clearInterval(intervalId)
  }
}

async function poll() {
  try {
    const res = await fetch('/api/notifications?since=' + lastChecked, {
      credentials: 'same-origin',
    })
    if (res.ok) {
      const data = await res.json()
      if (data.notifications && data.notifications.length > 0) {
        self.postMessage({ type: 'new', notifications: data.notifications, unreadCount: data.unreadCount })
      }
    }
  } catch (_) {
    // network error — ignore silently
  } finally {
    lastChecked = Date.now()
  }
}
