import '../css/app.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { ConfigProvider } from 'antd'
import frFR from 'antd/locale/fr_FR'
import ErrorBoundary from '../components/error_boundary'

const appName = import.meta.env.VITE_APP_NAME || 'Toudoux'

const theme = {
  token: {
    colorPrimary: '#1a1a1a',
    colorPrimaryHover: '#333333',
    colorPrimaryActive: '#000000',

    colorSuccess: '#3b82f6',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#0ea5e9',

    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#fafafa',
    colorBgElevated: '#FFFFFF',

    colorText: '#1a1a1a',
    colorTextSecondary: '#666666',
    colorTextTertiary: '#999999',

    colorBorder: '#e5e5e5',
    colorBorderSecondary: '#f0f0f0',

    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontWeightStrong: 600,

    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  components: {
    Button: {
      primaryColor: '#ffffff',
      fontWeight: 500,
    },
    Card: {
      boxShadowTertiary: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    },
    Calendar: {
      itemActiveBg: '#f0f0f0',
      controlItemBgActive: '#e5e5e5',
    },
  },
}

createInertiaApp({
  progress: { color: '#1a1a1a' },

  title: (title) => `${title} - ${appName}`,

  resolve: (name) => {
    return resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx'))
  },

  setup({ el, App, props }) {
    createRoot(el).render(
      <ErrorBoundary>
        <ConfigProvider theme={theme} locale={frFR}>
          <App {...props} />
        </ConfigProvider>
      </ErrorBoundary>
    )
  },
}).then()
