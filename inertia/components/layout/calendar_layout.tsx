import { Layout } from 'antd'
import { ReactNode } from 'react'

const { Content } = Layout

interface CalendarLayoutProps {
  calendarSlot: ReactNode
  sidePanel: ReactNode
}

export default function CalendarLayout({ calendarSlot, sidePanel }: CalendarLayoutProps) {
  return (
    <Content
      style={{
        padding: '24px',
        height: 'calc(100vh - 64px)',
        background: '#F8FAFC',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          height: '100%',
        }}
        className="calendar-layout"
      >
        {calendarSlot}

        <div
          style={{
            flex: '0 0 calc(30% - 16px)',
            minWidth: '300px',
            height: '100%',
          }}
          className="side-panel"
        >
          {sidePanel}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .calendar-layout {
            flex-direction: column;
          }
          .calendar-section,
          .side-panel {
            flex: 1 1 100% !important;
          }
        }
      `}</style>
    </Content>
  )
}
