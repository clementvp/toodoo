import { Typography, List, Tag } from 'antd'
import {
  BankOutlined,
  LineChartOutlined,
  HomeOutlined,
  SafetyOutlined,
  GlobalOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

const { Text, Title } = Typography

interface Suggestion {
  icon: ReactNode
  name: string
  description: string
  yield: string
  tag: string
  tagColor: string
  minBalance: number
}

const ALL_SUGGESTIONS: Suggestion[] = [
  {
    icon: <BankOutlined />,
    name: 'Livret A',
    description: "Épargne de précaution, disponible immédiatement, garantie par l'État.",
    yield: '3 %',
    tag: 'Sans risque',
    tagColor: 'blue',
    minBalance: 10,
  },
  {
    icon: <BankOutlined />,
    name: 'LDDS',
    description: 'Complémentaire au Livret A, mêmes avantages, plafond séparé.',
    yield: '3 %',
    tag: 'Sans risque',
    tagColor: 'blue',
    minBalance: 15,
  },
  {
    icon: <SafetyOutlined />,
    name: 'LEP (sous conditions)',
    description: 'Meilleur taux du marché pour les revenus modestes (plafond fiscal).',
    yield: '4 %',
    tag: 'Sans risque',
    tagColor: 'blue',
    minBalance: 30,
  },
  {
    icon: <SafetyOutlined />,
    name: 'Assurance-vie (fonds euros)',
    description: 'Capital garanti, fiscalité avantageuse après 8 ans, rendement stable.',
    yield: '~2,5–4 %',
    tag: 'Faible risque',
    tagColor: 'cyan',
    minBalance: 3000,
  },
  {
    icon: <LineChartOutlined />,
    name: 'PEA',
    description: "Actions européennes, exonération d'impôt sur les plus-values après 5 ans.",
    yield: 'Variable',
    tag: 'Risque modéré',
    tagColor: 'orange',
    minBalance: 5000,
  },
  {
    icon: <GlobalOutlined />,
    name: 'ETF World / S&P 500',
    description: 'Diversification mondiale low-cost via PEA ou CTO. Rendement historique ~8 %/an.',
    yield: '~7–10 %*',
    tag: 'Risque modéré',
    tagColor: 'orange',
    minBalance: 10000,
  },
  {
    icon: <HomeOutlined />,
    name: 'SCPI',
    description: 'Immobilier locatif mutualisé sans gestion, revenus réguliers.',
    yield: '~4–5 %',
    tag: 'Risque modéré',
    tagColor: 'orange',
    minBalance: 15000,
  },
]

interface PlacementSuggestionsProps {
  balance: number
}

export default function PlacementSuggestions({ balance }: PlacementSuggestionsProps) {
  if (balance <= 0) {
    return (
      <div style={{ width: 320, padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <WarningOutlined style={{ color: '#ef4444' }} />
          <Text strong style={{ color: '#ef4444' }}>
            Solde négatif ou nul
          </Text>
        </div>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Concentrez-vous sur l'équilibre de votre budget avant d'investir.
        </Text>
      </div>
    )
  }

  const available = ALL_SUGGESTIONS.filter((s) => balance >= s.minBalance)

  return (
    <div style={{ width: 340 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <CheckCircleOutlined style={{ color: '#3b82f6' }} />
        <Title level={5} style={{ margin: 0 }}>
          Suggestions de placements
        </Title>
      </div>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
        Basé sur votre solde de <Text strong>€{balance.toFixed(2)}</Text>
      </Text>

      <List
        dataSource={available}
        rowKey="name"
        size="small"
        renderItem={(s) => (
          <List.Item style={{ padding: '8px 0', alignItems: 'flex-start' }}>
            <div style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 2,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#3b82f6' }}>{s.icon}</span>
                  <Text strong style={{ fontSize: 13 }}>
                    {s.name}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 12, color: '#1a1a1a', fontWeight: 600 }}>{s.yield}</Text>
                  <Tag color={s.tagColor} style={{ fontSize: 10, margin: 0 }}>
                    {s.tag}
                  </Tag>
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {s.description}
              </Text>
            </div>
          </List.Item>
        )}
      />
      <Text type="secondary" style={{ fontSize: 11, marginTop: 8, display: 'block' }}>
        * Performances passées ne préjugent pas des performances futures.
      </Text>
    </div>
  )
}
