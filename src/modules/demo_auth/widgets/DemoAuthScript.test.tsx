/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

async function importScript() {
  vi.resetModules()
  const mod = await import('./DemoAuthScript')
  return mod.DemoAuthScript
}

describe('DemoAuthScript', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('DEMO_AUTH_LOGIN_EMAIL', '')
    vi.stubEnv('DEMO_AUTH_LOGIN_PASSWORD', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('renders an inline script populating window.__DEMO_AUTH__ when both env vars are set', async () => {
    vi.stubEnv('DEMO_AUTH_LOGIN_EMAIL', 'demo@example.com')
    vi.stubEnv('DEMO_AUTH_LOGIN_PASSWORD', 'secret-123')
    const DemoAuthScript = await importScript()
    const html = renderToStaticMarkup(<DemoAuthScript />)
    expect(html).toContain('window.__DEMO_AUTH__=')
    expect(html).toContain('"email":"demo@example.com"')
    expect(html).toContain('"password":"secret-123"')
  })

  it('returns null when both env vars are absent', async () => {
    const DemoAuthScript = await importScript()
    const html = renderToStaticMarkup(<DemoAuthScript />)
    expect(html).toBe('')
  })

  it('escapes </script> sequences to prevent HTML breakout', async () => {
    vi.stubEnv('DEMO_AUTH_LOGIN_EMAIL', '</script><script>alert(1)</script>')
    vi.stubEnv('DEMO_AUTH_LOGIN_PASSWORD', 'pw')
    const DemoAuthScript = await importScript()
    const html = renderToStaticMarkup(<DemoAuthScript />)
    expect(html).not.toContain('</script><script>')
    expect(html).toContain('\\u003c/script\\u003e')
  })
})
