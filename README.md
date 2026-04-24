# @fullstackhouse/open-mercato-demo-auth

Auto-fill and auto-submit the login form on your dev and preview deployments so you don't have to retype `admin / secret` a hundred times a day.

> **Dev only.** The server reads `DEMO_AUTH_LOGIN_EMAIL` / `DEMO_AUTH_LOGIN_PASSWORD` at request time and inlines them into the HTML. **Leave both unset in production** — that's the only safety gate, and it's by design.

## Install

```bash
npm install --save-dev @fullstackhouse/open-mercato-demo-auth
# or
yarn add -D @fullstackhouse/open-mercato-demo-auth
```

## Usage

Drop both components into your root layout. The server component injects the credentials into the HTML; the client component watches for the login form, fills it in, and submits it:

```tsx
// app/layout.tsx
import { DemoAuthAutofill } from '@fullstackhouse/open-mercato-demo-auth/DemoAuthAutofill'
import { DemoAuthScript } from '@fullstackhouse/open-mercato-demo-auth/DemoAuthScript'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <DemoAuthScript />
      </head>
      <body>
        <DemoAuthAutofill />
        {children}
      </body>
    </html>
  )
}
```

Both components short-circuit to nothing when the env vars aren't set, so they're safe to always mount.

Import from subpaths — not from the package root — so Next.js / Turbopack reliably detects the server/client boundary on `DemoAuthAutofill`'s `'use client'` directive.

## Env vars

```bash
DEMO_AUTH_LOGIN_EMAIL=admin@acme.com
DEMO_AUTH_LOGIN_PASSWORD=secret
```

- With **both** set, the form auto-fills and auto-submits.
- With **only the email** set, just the email field is prefilled — no submit.
- With **neither** set, nothing runs. Use this on prod.

## Kubernetes example

Put the two keys in the dev/preview ConfigMap and leave them out of prod:

```yaml
# configmap-dev.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-app-config
data:
  DEMO_AUTH_LOGIN_EMAIL: admin@acme.com
  DEMO_AUTH_LOGIN_PASSWORD: secret
  # ... other env vars
```

```yaml
# configmap-prod.yaml — same ConfigMap, without the two demo keys
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-app-config
data:
  # ... other env vars, no DEMO_AUTH_* here
```

## Why not `NEXT_PUBLIC_*`?

`NEXT_PUBLIC_*` values are inlined into the client bundle at build time. If you ship a single Docker image across dev/preview/prod — the common pattern — any value you bake in for dev leaks to prod. This package reads ordinary server-side env vars at request time and writes them into the HTML that's served, so one image + per-environment ConfigMaps gives you per-environment behavior.

## Form shape it targets

`DemoAuthAutofill` looks for:

```html
<form data-auth-ready="1">
  <input name="email" />
  <input name="password" />
</form>
```

Open Mercato's core login form already exposes `data-auth-ready="1"` once hydrated; this package was designed against that, but any form following the same convention works.

## Security

- The JSON payload is HTML-escaped (`<`, `>`, `&`, U+2028, U+2029) before being inlined into the `<script>` tag. Injection-hardened against adversarial values, but **don't pipe untrusted input into these env vars** — they execute on every page load.
- There is deliberately no `NODE_ENV === 'production'` kill-switch. Many setups (including Open Mercato) set `NODE_ENV=production` on every environment, which would defeat the purpose. **Keep prod safe by leaving the env vars unset there** — the server component emits nothing and the client component short-circuits.
- Zero runtime dependencies.

## Migrating from 0.2.x

1. Delete any `src/modules/demo_auth/` re-export shim you created.
2. Remove `{ id: 'demo_auth', from: '@app' | '@fullstackhouse/open-mercato-demo-auth' }` from `src/modules.ts`.
3. Add `<DemoAuthAutofill />` to your root layout next to `<DemoAuthScript />`.

The env-var names (`DEMO_AUTH_LOGIN_EMAIL` / `DEMO_AUTH_LOGIN_PASSWORD`) are unchanged.

## Peer dependencies

- `react >= 18`
- `react-dom >= 18`

## License

MIT — Full Stack House.
