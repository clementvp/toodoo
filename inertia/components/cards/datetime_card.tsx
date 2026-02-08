import { useState, useEffect } from 'react'
import { Card } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

export default function DateTimeCard() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000) // Update every second

    return () => clearInterval(timer)
  }, [])

  const dateStr = currentTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const timeStr = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <Card
      title="Date & Heure"
      bordered={false}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{
        body: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <ClockCircleOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#1890ff' }} />
        <div
          style={{
            fontSize: '22px',
            fontWeight: 'bold',
            textTransform: 'capitalize',
            marginBottom: '8px',
          }}
        >
          {dateStr}
        </div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>{timeStr}</div>
      </div>
    </Card>
  )
}
