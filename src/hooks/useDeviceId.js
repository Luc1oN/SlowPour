// Stable per-device identity — two guests named "Dave" no longer
// overwrite each other's ratings. Name stays display-only.
const KEY = 'slowpour_device_id'

export function getDeviceId() {
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2))
    localStorage.setItem(KEY, id)
  }
  return id
}
