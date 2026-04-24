import { lazy, type ComponentType, createElement, type ReactNode, Suspense } from 'react'
import type { ComponentOverride } from '@open-mercato/shared/modules/widgets/component-registry'

const LoginFormWrapper = lazy(() => import('./LoginFormWrapper'))

// The client-side wrapper is always registered. It is a no-op when
// window.__DEMO_AUTH__ is absent — which is the case on production, because
// the DemoAuthScript server component only injects that global when the
// DEMO_AUTH_LOGIN_EMAIL / DEMO_AUTH_LOGIN_PASSWORD env vars are set.
// Keeping this module env-agnostic lets the same Docker image serve dev,
// preview, and prod (mercato sets NODE_ENV=production in all of them).
export const componentOverrides: ComponentOverride[] = [
  {
    target: { componentId: 'section:auth.login.form' },
    priority: 10,
    metadata: { module: 'demo_auth' },
    wrapper: (Original: ComponentType<unknown>) => {
      const OriginalTyped = Original as ComponentType<{ children?: ReactNode }>
      const Wrapped = (props: unknown) => {
        const p = (props ?? {}) as { children?: ReactNode }
        return createElement(
          Suspense,
          { fallback: createElement(OriginalTyped, p) },
          createElement(LoginFormWrapper, { Original: OriginalTyped, ...p }),
        )
      }
      Wrapped.displayName = 'DemoAuthLoginFormWrapper'
      return Wrapped as ComponentType<unknown>
    },
  },
]
