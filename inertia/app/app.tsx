/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { ConfigProvider } from 'antd'
import frFR from 'antd/locale/fr_FR'
import ErrorBoundary from '../components/error_boundary'

const appName = import.meta.env.VITE_APP_NAME || 'Tâches & Notes'

// Modern Productivity theme configuration
const theme = {
  token: {
    colorPrimary: '#4F46E5', // Indigo - Primary/Action/Focus
    colorBgContainer: '#FFFFFF', // White - Cards & Calendar
    colorBgLayout: '#F8FAFC', // Light blue-grey - Background
    colorText: '#1E293B', // Dark slate - Primary text
    borderRadius: 8,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
}

createInertiaApp({
  progress: { color: '#4F46E5' },

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
})
