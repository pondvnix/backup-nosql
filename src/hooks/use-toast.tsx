
import {
  type ReactNode,
  createContext,
  useContext,
  useState,
} from 'react'

interface Toast {
  id: string
  title?: string
  description?: ReactNode
  action?: ReactNode
  variant?: 'default' | 'destructive'
  duration?: number
  onOpenChange?: (open: boolean) => void
}

interface ToasterContextProps {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  updateToast: (id: string, toast: Partial<Toast>) => void
}

const ToasterContext = createContext<ToasterContextProps>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  updateToast: () => {},
})

interface ToasterProviderProps {
  children: ReactNode
}

function ToasterProvider({ children }: ToasterProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = String(Math.random())
    setToasts([...toasts, { id, ...toast }])
  }

  const removeToast = (id: string) => {
    setToasts(toasts.filter((toast) => toast.id !== id))
  }

  const updateToast = (id: string, toast: Partial<Toast>) => {
    setToasts(
      toasts.map((t) => (t.id === id ? { ...t, ...toast } : t))
    )
  }

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
    </ToasterContext.Provider>
  )
}

function useToast() {
  const context = useContext(ToasterContext)
  if (!context) {
    throw new Error("useToast must be used within a ToasterProvider")
  }
  
  // Add toast function to make it similar to other toast libraries
  const toast = (props: Omit<Toast, "id">) => {
    context.addToast(props)
  }
  
  return {
    ...context,
    toast
  }
}

export {
  ToasterProvider,
  useToast,
  type Toast,
}
