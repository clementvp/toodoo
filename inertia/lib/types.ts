export interface User {
  id: number
  email: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: 'Ne pas répéter',
  daily: 'Chaque jour',
  weekly: 'Chaque semaine',
  monthly: 'Chaque mois',
}

export interface Todo {
  id: number
  userId: number
  title: string
  description: string | null
  dueDate: string
  dueTime: string | null
  status: 'À faire' | 'Terminé'
  priority: 'Haute' | 'Moyenne' | 'Basse'
  recurrenceType: RecurrenceType
  recurrenceEndDate: string | null
  isRecurring: boolean
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: number
  userId: number
  title: string
  content: string
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface Bookmark {
  id: number
  userId: number
  url: string
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  id: number
  userId: number
  weatherCity: string | null
  showPrinterButton: boolean
  currentBalance: number
  createdAt: string
  updatedAt: string
}

export interface ExpenseCategory {
  id: number
  userId: number
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: number
  userId: number
  type: 'income' | 'expense' | 'adjustment'
  amount: number
  categoryId: number | null
  date: string
  isRecurring: boolean
  recurrenceType: RecurrenceType
  recurrenceEndDate: string | null
  occurrenceDate: string | null
  createdAt: string
  updatedAt: string
}

export interface WeatherData {
  city: string
  temperature: number
  description: string
  icon: string
  tempMin: number
  tempMax: number
  humidity: number
  windSpeed: number
}

export interface DashboardProps {
  user?: User
  todosToday: Todo[]
  notesToday: Note[]
  expensesToday: Expense[]
  derivedBalance: number
  weather: WeatherData | null
  userSettings: UserSettings
  categories: ExpenseCategory[]
}
