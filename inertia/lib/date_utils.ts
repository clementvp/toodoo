import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import 'dayjs/locale/fr'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

export function formatDate(date: string | Date | Dayjs, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

export function formatTime(time: string | null): string {
  if (!time) return ''
  return time
}

export function now(): Dayjs {
  return dayjs()
}

export function parseDate(date: string): Dayjs {
  return dayjs(date)
}

export function isSameDay(date1: string | Date | Dayjs, date2: string | Date | Dayjs): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'day')
}

export function startOfMonth(date?: string | Date | Dayjs): Dayjs {
  return dayjs(date).startOf('month')
}

export function endOfMonth(date?: string | Date | Dayjs): Dayjs {
  return dayjs(date).endOf('month')
}

export function toISODate(date: string | Date | Dayjs): string {
  const dayjsDate = dayjs(date)
  return dayjsDate.isValid() ? dayjsDate.format('YYYY-MM-DD') : ''
}

export function todayISO(): string {
  return dayjs().format('YYYY-MM-DD')
}

export { dayjs }
