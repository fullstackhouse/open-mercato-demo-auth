# @fullstackhouse/open-mercato-demo-auth

Dev-only login form prefill + auto-submit widget for [Open Mercato](https://github.com/open-mercato/open-mercato) applications. Skips the "type email, type password, click submit" ritual on every hot-reload.

> **⚠️ Dev only.** Configured via server-side env vars and injected into the client as an inline `<script>` — the values never get baked into the production bundle. **Keep `DEMO_AUTH_LOGIN_EMAIL` / `DEMO_AUTH_LOGIN_PASSWORD` unset on any environment you don't want this to run on.** That is the only gate: the `<DemoAuthScript />` server component emits nothing when both vars are empty.

## What it does

When both `DEMO_AUTH_LOGIN_EMAIL` and `DEMO_AUTH_LOGIN_PASSWORD` are set, the widget:

1. Wraps the core `section:auth.login.form` component.
2. Reads the credentials from `window.__DEMO_AUTH__`, which the `<DemoAuthScript />` server component injects into the root layout at request time.
3. Waits for the login form to render (`MutationObserver` on `form[data-auth-ready="1"]`).
4. Writes values into `input[name="email"]` and `input[name="password"]` via the native `HTMLInputElement` value setter so React's synthetic `onChange` handlers fire.
5. Calls `form.requestSubmit()` after 50 ms.

With only one env var set, it prefills that field and skips auto-submit. With neither set, nothing renders and nothing runs.

## Why server env, not `NEXT_PUBLIC_*`

`NEXT_PUBLIC_*` values are inlined into the client bundle at build time. If you run a single Docker image across dev/preview/prod (the common pattern), you can't enable the widget on dev without shipping its credentials to prod too. This package reads ordinary server-side env vars (`DEMO_AUTH_LOGIN_*`) at request time and writes them into the HTML the browser receives — so a single image + per-environment ConfigMaps Just Works.

## Installation

```bash
yarn add -D @fullstackhouse/open-mercato-demo-auth
# or
npm install --save-dev @fullstackhouse/open-mercato-demo-auth
```

## Usage

### 1. Register the module

In your app's `src/modules.ts`:

```ts
export const enabledModules: ModuleEntry[] = [
  // ...existing modules
  { id: 'demo_auth', from: '@fullstackhouse/open-mercato-demo-auth' },
]
```

If your mercato CLI rejects third-party scoped packages (it whitelists `@app` and `@open-mercato/*` in newer versions), use a thin re-export in `src/modules/demo_auth/`:

```ts
// src/modules/demo_auth/index.ts
export { metadata } from '@fullstackhouse/open-mercato-demo-auth'

// src/modules/demo_auth/widgets/components.ts
export { componentOverrides } from '@fullstackhouse/open-mercato-demo-auth'
```

Then register as `{ id: 'demo_auth', from: '@app' }`.

### 2. Render `<DemoAuthScript />` in your root layout

`src/app/layout.tsx`:

```tsx
import { DemoAuthScript } from '@fullstackhouse/open-mercato-demo-auth'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <DemoAuthScript />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

The component renders an inline `<script>` when its env vars are set, and `null` otherwise (including always in production builds).

### 3. Set env vars on the environments where you want prefill

```bash
# .env (local dev)
DEMO_AUTH_LOGIN_EMAIL=superadmin@example.com
DEMO_AUTH_LOGIN_PASSWORD=your-dev-password
```

On Kubernetes, add them to the dev/preview ConfigMap only — leave them unset in production.

## Security notes

- Values are rendered into HTML as JSON inside an inline `<script>`, with `<`, `>`, `&`, U+2028, U+2029 escaped to prevent HTML/JS injection. Never pass untrusted input as the env values.
- Production builds are a strict no-op regardless of env vars (double safety: the server component returns `null`, and `componentOverrides` is an empty array).
- The package has no runtime dependencies.

## Peer dependencies

- `react >= 18`, `react-dom >= 18`
- `@open-mercato/shared` (for the `ComponentOverride` type)

## Development

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

## License

MIT — Full Stack House.
