import { useEffect } from 'react'
import { Card, Empty, Button, Alert } from 'antd'
import { SettingOutlined, CloudOutlined } from '@ant-design/icons'
import { Link, router } from '@inertiajs/react'
import type { WeatherData } from '~/lib/types'

interface WeatherCardProps {
  weather: WeatherData | null
  hasCity: boolean
}

export default function WeatherCard({ weather, hasCity }: WeatherCardProps) {
  // Rafraîchissement automatique toutes les 30 minutes
  useEffect(() => {
    if (!hasCity) return

    const intervalId = setInterval(
      () => {
        router.reload({ only: ['weather'] })
      },
      30 * 60 * 1000
    ) // 30 minutes en millisecondes

    return () => clearInterval(intervalId)
  }, [hasCity])
  const renderContent = () => {
    // No city configured
    if (!hasCity) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Configurez votre ville pour voir la météo"
        >
          <Link href="/settings">
            <Button type="primary">Configurer</Button>
          </Link>
        </Empty>
      )
    }

    // API error or unavailable
    if (!weather) {
      return (
        <Alert
          title="Météo indisponible"
          description="Impossible de récupérer les données météo. Veuillez réessayer plus tard."
          type="warning"
          showIcon
        />
      )
    }

    // Display weather data
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
          {weather.city}
        </div>
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
          style={{ width: '80px', height: '80px' }}
        />
        <div
          style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}
        >
          {weather.temperature}°C
        </div>
        <div
          style={{
            fontSize: '20px',
            textTransform: 'capitalize',
            marginBottom: '16px',
            fontWeight: 500,
          }}
        >
          {weather.description}
        </div>
        <div style={{ fontSize: '16px', color: '#555', lineHeight: '1.8' }}>
          <div>
            Min: {weather.tempMin}°C | Max: {weather.tempMax}°C
          </div>
          <div>Humidité: {weather.humidity}%</div>
          <div>Vent: {weather.windSpeed} km/h</div>
        </div>
      </div>
    )
  }

  return (
    <Card
      title={
        <span>
          <CloudOutlined /> Météo
        </span>
      }
      extra={
        <Link href="/settings">
          <SettingOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
        </Link>
      }
      variant="borderless"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{
        body: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
      }}
    >
      {renderContent()}
    </Card>
  )
}
