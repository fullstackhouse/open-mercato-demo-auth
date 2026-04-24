import { lazy, type ComponentType, createElement, type ReactNode, Suspense } from 'react'
import type { ComponentOverride } from '@open-mercato/shared/modules/widgets/component-registry'

const LoginFormWrapper = lazy(() => import('./LoginFormWrapper'))

const enabled =
  typeof process === 'undefined' || process.env.NODE_ENV !== 'production'

export const componentOverrides: ComponentOverride[] = enabled
  ? [
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
  : []
