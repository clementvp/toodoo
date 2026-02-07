export interface User {
  id: number
  email: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

export interface Todo {
  id: number
  userId: number
  title: string
  description: string | null
  dueDate: string // ISO date string
  dueTime: string | null // HH:mm format
  status: 'À faire' | 'Terminé'
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: number
  userId: number
  title: string
  content: string
  createdAt: string // ISO date string (date association)
  updatedAt: string
}

export interface Bookmark {
  id: number
  userId: number
  url: string
  createdAt: string // ISO date string
  updatedAt: string
}

export interface PageProps<T = Record<string, unknown>> {
  user?: User
}
