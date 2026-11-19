import { useEffect, useState } from 'react'

export type ToastMessage = { kind: 'ok' | 'error'; text: string; ms?: number }

/** Fixed bottom-right notice that never moves the layout. Successes fade; errors wait to be dismissed. */
export function Toast({ toast, onDismiss }: { toast: ToastMessage | null; onDismiss: () => void }) {
  useEffect(() => {
    if (toast?.kind !== 'ok') return
    const t = setTimeout(onDismiss, toast.ms ?? 4000)
    return () => clearTimeout(t)
  }, [toast, onDismiss])
  if (!toast) return null
  return (
    <div className={`toast ${toast.kind}`} role="status">
      <span>{toast.text}</span>
      <button className="icon" onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [dismiss] = useState(() => () => setToast(null))
  return { toast, setToast, dismiss }
}
