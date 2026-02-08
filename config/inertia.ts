import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',

  sharedData: {
    user: (ctx) => ctx.auth.user || null,
    errors: (ctx) => {
      const bag = ctx.session.flashMessages.get('errorsBag')
      return bag || ctx.session.flashMessages.get('errors')
    },
    success: (ctx) => ctx.session.flashMessages.get('success') || null,
    error: (ctx) => ctx.session.flashMessages.get('error') || null,
  },

  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
