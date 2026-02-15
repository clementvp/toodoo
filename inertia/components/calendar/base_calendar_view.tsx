import { Calendar, Typography, Select, theme } from 'antd'
import type { Dayjs } from 'dayjs'
import { dayjs } from '../../lib/date_utils'
import type { ReactNode } from 'react'

interface BaseCalendarViewProps<T> {
  items: T[]
  selectedDate: Dayjs
  onSelect: (date: Dayjs) => void
  getItemDate: (item: T) => string | Date
  renderItem: (item: T, token: any) => ReactNode
  headerExtra?: ReactNode
}

export default function BaseCalendarView<T extends { id: number | string }>({
  items,
  selectedDate,
  onSelect,
  getItemDate,
  renderItem,
  headerExtra,
}: BaseCalendarViewProps<T>) {
  const { token } = theme.useToken()

  const getItemsForDate = (date: Dayjs): T[] => {
    return items.filter((item) => dayjs(getItemDate(item)).isSame(date, 'day'))
  }

  const dateCellRender = (value: Dayjs) => {
    const listData = getItemsForDate(value)

    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item) => (
          <li key={item.id}>{renderItem(item, token)}</li>
        ))}
      </ul>
    )
  }

  return (
    <div
      style={{
        flex: '0 0 70%',
        background: token.colorBgContainer,
        padding: '24px',
        borderRadius: token.borderRadiusLG,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <Calendar
        value={selectedDate}
        onSelect={onSelect}
        cellRender={(current, info) =>
          info.type === 'date' ? dateCellRender(current) : info.originNode
        }
        headerRender={({ value, onChange }) => {
          const year = value.year()
          const month = value.month()
          const yearOptions = Array.from({ length: 10 }, (_, i) => ({
            label: `${year - 2 + i}`,
            value: year - 2 + i,
          }))
          const monthOptions = Array.from({ length: 12 }, (_, i) => ({
            label: dayjs().locale('fr').month(i).format('MMMM'),
            value: i,
          }))

          return (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Typography.Title level={4} style={{ margin: 0, textTransform: 'capitalize' }}>
                  {value.locale('fr').format('MMMM YYYY')}
                </Typography.Title>
                {headerExtra}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Select
                  value={year}
                  options={yearOptions}
                  onChange={(y) => onChange(value.clone().year(y))}
                />
                <Select
                  value={month}
                  style={{ minWidth: '120px', textTransform: 'capitalize' }}
                  options={monthOptions}
                  onChange={(m) => onChange(value.clone().month(m))}
                />
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}
