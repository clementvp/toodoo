import '../css/app.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { ConfigProvider } from 'antd'
import frFR from 'antd/locale/fr_FR'
import ErrorBoundary from '../components/error_boundary'

const appName = import.meta.env.VITE_APP_NAME || 'Toudoux'

// Monochrome Elegant theme configuration
const theme = {
  token: {
    // Primary colors - Monochrome black
    colorPrimary: '#1a1a1a', // Deep black - Primary actions
    colorPrimaryHover: '#333333', // Charcoal - Hover state
    colorPrimaryActive: '#000000', // Pure black - Active state

    // Status colors - Modern and vibrant
    colorSuccess: '#22c55e', // Modern green
    colorWarning: '#f59e0b', // Sophisticated orange
    colorError: '#ef4444', // Elegant red
    colorInfo: '#0ea5e9', // Sky blue

    // Background colors
    colorBgContainer: '#FFFFFF', // White - Cards
    colorBgLayout: '#fafafa', // Very light grey - Background
    colorBgElevated: '#FFFFFF', // White - Modals

    // Text colors
    colorText: '#1a1a1a', // Deep black - Primary text
    colorTextSecondary: '#666666', // Medium grey - Secondary text
    colorTextTertiary: '#999999', // Light grey - Tertiary text

    // Border
    colorBorder: '#e5e5e5', // Light border
    colorBorderSecondary: '#f0f0f0', // Very light border

    // Typography
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontWeightStrong: 600,

    // Layout
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // Shadow - More subtle for elegant look
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  components: {
    Button: {
      primaryColor: '#ffffff', // White text on black buttons
      fontWeight: 500,
    },
    Card: {
      boxShadowTertiary: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
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
