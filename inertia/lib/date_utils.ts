import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import 'dayjs/locale/fr'

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

// Note: French locale is imported but not set globally to avoid parsing issues
// Use .locale('fr') when needed for display

/**
 * Format date for display
 */
export function formatDate(date: string | Date | Dayjs, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

/**
 * Format time for display
 */
export function formatTime(time: string | null): string {
  if (!time) return ''
  return time // Already in HH:mm format
}

/**
 * Get current date
 */
export function now(): Dayjs {
  return dayjs()
}

/**
 * Parse date string to Dayjs
 */
export function parseDate(date: string): Dayjs {
  return dayjs(date)
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: string | Date | Dayjs, date2: string | Date | Dayjs): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'day')
}

/**
 * Get start of month
 */
export function startOfMonth(date?: string | Date | Dayjs): Dayjs {
  return dayjs(date).startOf('month')
}

/**
 * Get end of month
 */
export function endOfMonth(date?: string | Date | Dayjs): Dayjs {
  return dayjs(date).endOf('month')
}

/**
 * Convert to ISO date string (YYYY-MM-DD)
 */
export function toISODate(date: string | Date | Dayjs): string {
  const dayjsDate = dayjs(date)
  // Ensure we use the ISO format regardless of locale
  return dayjsDate.isValid() ? dayjsDate.format('YYYY-MM-DD') : ''
}

/**
 * Get current date as ISO string
 */
export function todayISO(): string {
  return dayjs().format('YYYY-MM-DD')
}

export { dayjs }
