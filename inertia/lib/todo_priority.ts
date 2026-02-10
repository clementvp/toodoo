export type Priority = 'Haute' | 'Moyenne' | 'Basse'

export const PRIORITY_OPTIONS = [
  { value: 'Haute', label: 'Haute' },
  { value: 'Moyenne', label: 'Moyenne' },
  { value: 'Basse', label: 'Basse' },
]

export const PRIORITY_COLOR: Record<Priority, string> = {
  Haute: '#ef4444',
  Moyenne: '#f59e0b',
  Basse: '#22c55e',
}
