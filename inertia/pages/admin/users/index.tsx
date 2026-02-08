import { Head, router } from '@inertiajs/react'
import { Layout, Table, Button, Space, Tag, Modal, Form, Input, Typography } from 'antd'
import {
  UserAddOutlined,
  DeleteOutlined,
  KeyOutlined,
  CrownOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import Header from '../../../components/layout/header'
import { dayjs } from '../../../lib/date_utils'
import type { User as UserType } from '../../../lib/types'

const { Title } = Typography

interface User {
  id: number
  email: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface AdminUsersPageProps {
  user?: UserType
  users: User[]
}

export default function AdminUsersIndex({ user, users }: AdminUsersPageProps) {
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  const handleDelete = (userToDelete: User) => {
    Modal.confirm({
      title: 'Supprimer cet utilisateur ?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Voulez-vous vraiment supprimer l'utilisateur <strong>{userToDelete.email}</strong> ?
          </p>
          <p style={{ color: '#ff4d4f', marginTop: '8px' }}>
            ⚠️ Toutes ses tâches et notes seront également supprimées.
          </p>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>
            Cette action est irréversible.
          </p>
        </div>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk() {
        router.delete(`/admin/users/${userToDelete.id}`, {
          preserveScroll: true,
        })
      },
    })
  }

  const handleToggleRole = (userToUpdate: User) => {
    const newRole = userToUpdate.role === 'admin' ? 'user' : 'admin'
    const action =
      newRole === 'admin' ? 'promouvoir en administrateur' : 'rétrograder en utilisateur'

    Modal.confirm({
      title: `Changer le rôle de ${userToUpdate.email} ?`,
      icon: <ExclamationCircleOutlined />,
      content: `Voulez-vous ${action} cet utilisateur ?`,
      okText: 'Confirmer',
      cancelText: 'Annuler',
      onOk() {
        router.patch(
          `/admin/users/${userToUpdate.id}/role`,
          { role: newRole },
          {
            preserveScroll: true,
          }
        )
      },
    })
  }

  const handleResetPassword = (userToReset: User) => {
    setSelectedUser(userToReset)
    setResetPasswordModalVisible(true)
    form.resetFields()
  }

  const handleResetPasswordSubmit = (values: any) => {
    if (selectedUser) {
      router.patch(
        `/admin/users/${selectedUser.id}/reset-password`,
        {
          newPassword: values.newPassword,
          newPasswordConfirmation: values.newPasswordConfirmation,
        },
        {
          preserveScroll: true,
          onSuccess: () => {
            setResetPasswordModalVisible(false)
            setSelectedUser(null)
            form.resetFields()
          },
        }
      )
    }
  }

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: User, b: User) => a.email.localeCompare(b.email),
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) =>
        role === 'admin' ? (
          <Tag icon={<CrownOutlined />} color="gold">
            Administrateur
          </Tag>
        ) : (
          <Tag icon={<UserOutlined />} color="blue">
            Utilisateur
          </Tag>
        ),
      filters: [
        { text: 'Administrateur', value: 'admin' },
        { text: 'Utilisateur', value: 'user' },
      ],
      onFilter: (value: any, record: User) => record.role === value,
    },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).locale('fr').format('DD MMMM YYYY à HH:mm'),
      sorter: (a: User, b: User) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="text"
            icon={record.role === 'admin' ? <UserOutlined /> : <CrownOutlined />}
            onClick={() => handleToggleRole(record)}
            disabled={record.id === user?.id}
            title={
              record.id === user?.id
                ? 'Vous ne pouvez pas modifier votre propre rôle'
                : record.role === 'admin'
                  ? 'Rétrograder en utilisateur'
                  : 'Promouvoir en admin'
            }
          >
            {record.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}
          </Button>
          <Button type="text" icon={<KeyOutlined />} onClick={() => handleResetPassword(record)}>
            Réinitialiser MDP
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            disabled={record.id === user?.id}
            title={
              record.id === user?.id
                ? 'Vous ne pouvez pas supprimer votre propre compte'
                : 'Supprimer'
            }
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Head title="Administration - Utilisateurs" />

      <Layout style={{ minHeight: '100vh' }}>
        <Header user={user} currentPath="/admin/users" />

        <Layout.Content style={{ padding: '24px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <Title level={2} style={{ margin: 0 }}>
                Gestion des utilisateurs
              </Title>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                size="large"
                onClick={() => router.visit('/admin/users/create')}
              >
                Créer un utilisateur
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total : ${total} utilisateurs`,
              }}
              style={{ background: '#fff', borderRadius: '8px' }}
            />
          </div>
        </Layout.Content>
      </Layout>

      {/* Modal pour réinitialiser le mot de passe */}
      <Modal
        title={`Réinitialiser le mot de passe de ${selectedUser?.email}`}
        open={resetPasswordModalVisible}
        onCancel={() => {
          setResetPasswordModalVisible(false)
          setSelectedUser(null)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleResetPasswordSubmit}>
          <Form.Item
            name="newPassword"
            label="Nouveau mot de passe"
            rules={[
              { required: true, message: 'Veuillez saisir un nouveau mot de passe' },
              { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' },
            ]}
          >
            <Input.Password placeholder="Minimum 8 caractères" />
          </Form.Item>

          <Form.Item
            name="newPasswordConfirmation"
            label="Confirmer le mot de passe"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Veuillez confirmer le mot de passe' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirmer le mot de passe" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setResetPasswordModalVisible(false)
                  setSelectedUser(null)
                  form.resetFields()
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                Réinitialiser
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
