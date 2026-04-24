/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import type { ComponentType, ReactNode } from 'react'

const Original: ComponentType<{ children?: ReactNode }> = ({ children }) => (
  <div data-testid="original">{children}</div>
)

function mountLoginForm(ready = true) {
  const form = document.createElement('form')
  form.setAttribute('data-auth-ready', ready ? '1' : '0')
  const email = document.createElement('input')
  email.name = 'email'
  const password = document.createElement('input')
  password.name = 'password'
  form.append(email, password)
  document.body.append(form)
  return { form, email, password }
}

async function importWrapper() {
  vi.resetModules()
  const mod = await import('./LoginFormWrapper')
  return mod.default
}

describe('LoginFormWrapper', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    cleanup()
    document.body.innerHTML = ''
  })

  it('prefills both inputs and auto-submits when both env vars set', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LOGIN_EMAIL', 'demo@example.com')
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LOGIN_PASSWORD', 'secret-123')
    const { form, email, password } = mountLoginForm(true)
    const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {})

    const Wrapper = await importWrapper()
    render(<Wrapper Original={Original} />)

    // useEffect runs synchronously enough for the initial tryPrefill
    await vi.advanceTimersByTimeAsync(0)
    expect(email.value).toBe('demo@example.com')
    expect(password.value).toBe('secret-123')

    await vi.advanceTimersByTimeAsync(50)
    expect(requestSubmit).toHaveBeenCalledTimes(1)
  })

  it('prefills only email when password is not set and does not auto-submit', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LOGIN_EMAIL', 'demo@example.com')
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LOGIN_PASSWORD', '')
    const { form, email, password } = mountLoginForm(true)
    const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {})

    const Wrapper = await importWrapper()
    render(<Wrapper Original={Original} />)
    await vi.advanceTimersByTimeAsync(100)

    expect(email.value).toBe('demo@example.com')
    expect(password.value).toBe('')
    expect(requestSubmit).not.toHaveBeenCalled()
  })

  it('is a no-op when neither env var is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LOGIN_EMAIL', '')
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LOGIN_PASSWORD', '')
    const { form, email, password } = mountLoginForm(true)
    const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {})

    const Wrapper = await importWrapper()
    render(<Wrapper Original={Original} />)
    await vi.advanceTimersByTimeAsync(6000)

    expect(email.value).toBe('')
    expect(password.value).toBe('')
    expect(requestSubmit).not.toHaveBeenCalled()
  })

  it('waits for the form to become ready via MutationObserver', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LOGIN_EMAIL', 'demo@example.com')
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LOGIN_PASSWORD', 'secret-123')

    const Wrapper = await importWrapper()
    render(<Wrapper Original={Original} />)

    const { form, email, password } = mountLoginForm(false)
    const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {})

    await vi.advanceTimersByTimeAsync(0)
    expect(email.value).toBe('')

    form.setAttribute('data-auth-ready', '1')
    await vi.advanceTimersByTimeAsync(0)
    expect(email.value).toBe('demo@example.com')
    expect(password.value).toBe('secret-123')

    await vi.advanceTimersByTimeAsync(50)
    expect(requestSubmit).toHaveBeenCalledTimes(1)
  })

  it('disconnects the observer after the fallback timeout without errors', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LOGIN_EMAIL', 'demo@example.com')
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LOGIN_PASSWORD', 'secret-123')

    const Wrapper = await importWrapper()
    const { unmount } = render(<Wrapper Original={Original} />)
    await vi.advanceTimersByTimeAsync(6000)
    expect(() => unmount()).not.toThrow()
  })
})
