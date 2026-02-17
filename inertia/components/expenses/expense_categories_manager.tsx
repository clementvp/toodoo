import { useState } from 'react'
import {
  List,
  Button,
  Form,
  Input,
  ColorPicker,
  Typography,
  Modal,
  Empty,
  Space,
  Card,
  Row,
  Col,
} from 'antd'
import { DeleteOutlined, PlusOutlined, TagOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { ExpenseCategory } from '~/lib/types'
import type { Color } from 'antd/es/color-picker'

const { Text } = Typography

interface ExpenseCategoriesManagerProps {
  categories: ExpenseCategory[]
  onCategoriesChange: (categories: ExpenseCategory[]) => void
}

export default function ExpenseCategoriesManager({
  categories,
  onCategoriesChange,
}: ExpenseCategoriesManagerProps) {
  const [form] = Form.useForm()
  const [colorValue, setColorValue] = useState<string>('#6b7280')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (values: { name: string }) => {
    setLoading(true)
    try {
      const res = await fetch('/expense-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ name: values.name, color: colorValue }),
      })
      if (res.ok) {
        const newCat = await res.json()
        onCategoriesChange([...categories, newCat])
        form.resetFields()
        setColorValue('#6b7280')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (category: ExpenseCategory) => {
    Modal.confirm({
      title: 'Supprimer cette catégorie ?',
      content: `Les transactions associées à "${category.name}" perdront leur catégorie.`,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        const res = await fetch(`/expense-categories/${category.id}`, {
          method: 'DELETE',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
        })
        if (res.ok) {
          onCategoriesChange(categories.filter((c) => c.id !== category.id))
          router.reload({ only: ['expenses'] })
        }
      },
    })
  }

  const handleColorChange = (_: Color, hex: string) => {
    setColorValue(hex)
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '32px 24px',
        background: '#F8FAFC',
        minHeight: '100%',
      }}
    >
      <Card
        title={
          <span>
            <TagOutlined style={{ marginRight: 8 }} />
            Catégories de dépenses
          </span>
        }
        variant="borderless"
        style={{ width: '100%', maxWidth: 560 }}
      >
        {/* Formulaire d'ajout */}
        <Form form={form} onFinish={handleCreate} style={{ marginBottom: 24 }}>
          <Row gutter={8} align="middle">
            <Col flex={1}>
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Le nom est requis' }]}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="Nom de la catégorie" maxLength={100} />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item style={{ marginBottom: 0 }}>
                <ColorPicker
                  value={colorValue}
                  onChange={handleColorChange}
                  format="hex"
                  disabledAlpha
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={loading}>
                  Ajouter
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Liste */}
        {categories.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Aucune catégorie. Ajoutez-en une ci-dessus."
          />
        ) : (
          <List
            dataSource={categories}
            rowKey="id"
            renderItem={(cat) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(cat)}
                  >
                    Supprimer
                  </Button>,
                ]}
              >
                <Space>
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: cat.color,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <Text>{cat.name}</Text>
                </Space>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}
