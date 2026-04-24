// Server component. Reads DEMO_AUTH_LOGIN_EMAIL / DEMO_AUTH_LOGIN_PASSWORD at
// request/render time and emits an inline <script> that populates
// window.__DEMO_AUTH__ before client components hydrate. Returns null when
// neither env var is set — which is how you keep production safe: leave
// them unset on prod, set them on dev/preview.
//
// Consumers: render <DemoAuthScript /> inside the <head> of the root layout.

const DEMO_AUTH_GLOBAL_KEY = '__DEMO_AUTH__'
const ENV_EMAIL_KEY = 'DEMO_AUTH_LOGIN_EMAIL'
const ENV_PASSWORD_KEY = 'DEMO_AUTH_LOGIN_PASSWORD'

function encodeForInlineScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(new RegExp(String.fromCharCode(0x2028), 'g'), '\\u2028')
    .replace(new RegExp(String.fromCharCode(0x2029), 'g'), '\\u2029')
}

export function DemoAuthScript() {
  const email = process.env[ENV_EMAIL_KEY] ?? ''
  const password = process.env[ENV_PASSWORD_KEY] ?? ''
  if (!email && !password) return null
  const payload = encodeForInlineScript({ email, password })
  return (
    <script
      // Synchronous inline script so the global exists before the React tree hydrates.
      dangerouslySetInnerHTML={{
        __html: `window.${DEMO_AUTH_GLOBAL_KEY}=${payload};`,
      }}
    />
  )
}
