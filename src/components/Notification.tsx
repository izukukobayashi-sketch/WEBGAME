import { useUIStore } from '@/store/uiStore'

export function Notification() {
  const notification = useUIStore((s) => s.notification)
  if (!notification) return null

  const colors = {
    info: 'bg-blue-800 border-blue-600',
    success: 'bg-green-800 border-green-600',
    error: 'bg-red-800 border-red-600',
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg border text-sm shadow-lg ${colors[notification.type]}`}>
      {notification.message}
    </div>
  )
}
