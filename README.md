# @fullstackhouse/open-mercato-demo-auth

Dev-only login form prefill + auto-submit widget for [Open Mercato](https://github.com/open-mercato/open-mercato) applications. Skips the "type email, type password, click submit" ritual on every hot-reload.

> **⚠️ Dev only.** Credentials are read from `NEXT_PUBLIC_*` env vars and **bundled into the client-side JavaScript**. Leave both env vars empty in production builds. The override is also disabled automatically when `NODE_ENV === 'production'` as a safety net.

## What it does

When both `NEXT_PUBLIC_DEFAULT_LOGIN_EMAIL` and `NEXT_PUBLIC_DEFAULT_LOGIN_PASSWORD` are set, the widget:

1. Wraps the core `section:auth.login.form` component.
2. Waits for the login form to render (watches for `form[data-auth-ready="1"]` via `MutationObserver`).
3. Writes the values into `input[name="email"]` and `input[name="password"]` using the native `HTMLInputElement` value setter so React's synthetic `onChange` handlers fire.
4. Calls `form.requestSubmit()` after a 50 ms delay.

With only one of the two set, it prefills that field and skips auto-submit. With neither set, it's a no-op.

## Installation

```bash
yarn add -D @fullstackhouse/open-mercato-demo-auth
# or
npm install --save-dev @fullstackhouse/open-mercato-demo-auth
```

## Usage

### 1. Register the module

In your Open Mercato app's `src/modules.ts`:

```ts
export const enabledModules: ModuleEntry[] = [
  // ...existing modules
  { id: 'demo_auth', from: '@fullstackhouse/open-mercato-demo-auth' },
]
```

### 2. Set the env vars (dev/local only)

```bash
# .env (or .env.local, or your app's .env.schema-generated .env)
NEXT_PUBLIC_DEFAULT_LOGIN_EMAIL=superadmin@example.com
NEXT_PUBLIC_DEFAULT_LOGIN_PASSWORD=your-dev-password
```

Restart `yarn dev`. Visit `/backend/login` — the form fills and submits automatically.

### 3. Production

Leave both env vars **empty** (or unset) in any environment that isn't local dev. The package exports an empty `componentOverrides` array under `NODE_ENV === 'production'`, so accidental inclusion in a prod build tree-shakes to nothing.

## How it works

- `src/modules/demo_auth/widgets/components.ts` registers a `ComponentOverride` targeting `section:auth.login.form` at priority 10, wrapping the original component in a React Suspense boundary that lazy-loads `LoginFormWrapper`.
- `LoginFormWrapper.tsx` is the client-side logic: it mounts a `MutationObserver` watching for `data-auth-ready="1"` (Open Mercato's core auth form exposes this attribute once the form is interactive), fills inputs via the native value setter to trigger React's onChange tracking, and calls `requestSubmit` after a 50 ms delay.
- A 5 s fallback timeout detaches the observer if the form never renders (no leaks).

## Peer dependencies

- `react >= 18`, `react-dom >= 18`
- `@open-mercato/shared` (for the `ComponentOverride` type)

All peers are marked optional; the package does nothing until it's registered in a mercato app.

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
