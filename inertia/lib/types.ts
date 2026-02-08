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
  dueDate: string
  dueTime: string | null
  status: 'À faire' | 'Terminé'
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: number
  userId: number
  title: string
  content: string
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
  weather: WeatherData | null
  userSettings: UserSettings
}
