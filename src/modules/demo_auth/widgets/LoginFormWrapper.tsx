'use client'

import { useEffect, type ComponentType, type ReactNode } from 'react'

/** Delay before auto-submitting so React processes synthetic change events from prefilled inputs */
const AUTO_SUBMIT_DELAY_MS = 50
/** Max time to wait for the form to mount via MutationObserver */
const OBSERVER_FALLBACK_MS = 5000
/** Global injected by DemoAuthScript on the server */
const GLOBAL_KEY = '__DEMO_AUTH__'

type DemoAuthPayload = { email?: string; password?: string }

function readPayload(): { email: string; password: string } {
  if (typeof window === 'undefined') return { email: '', password: '' }
  const payload = (window as unknown as Record<string, DemoAuthPayload | undefined>)[GLOBAL_KEY]
  return {
    email: payload?.email ?? '',
    password: payload?.password ?? '',
  }
}

function getNativeInputValueSetter(): ((v: string) => void) | undefined {
  try {
    if (typeof window !== 'undefined') {
      return Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    }
  } catch {
    // fall through
  }
  return undefined
}

function setInputValue(input: HTMLInputElement, value: string) {
  const nativeInputValueSetter = getNativeInputValueSetter()
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value)
  } else {
    input.value = value
  }
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

export interface LoginFormWrapperProps {
  Original: ComponentType<{ children?: ReactNode }>
  children?: ReactNode
}

export default function LoginFormWrapper({ Original, children }: LoginFormWrapperProps) {
  useEffect(() => {
    const { email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD } = readPayload()
    if (!DEFAULT_EMAIL && !DEFAULT_PASSWORD) return

    function tryPrefill(): boolean {
      const form = document.querySelector<HTMLFormElement>('form[data-auth-ready="1"]')
      if (!form) return false

      let filled = false

      if (DEFAULT_EMAIL) {
        const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]')
        if (emailInput && !emailInput.value) {
          setInputValue(emailInput, DEFAULT_EMAIL)
          filled = true
        }
      }

      if (DEFAULT_PASSWORD) {
        const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]')
        if (passwordInput && !passwordInput.value) {
          setInputValue(passwordInput, DEFAULT_PASSWORD)
          filled = true
        }
      }

      if (filled && DEFAULT_EMAIL && DEFAULT_PASSWORD) {
        setTimeout(() => form.requestSubmit(), AUTO_SUBMIT_DELAY_MS)
      }

      return true
    }

    if (tryPrefill()) return

    const observer = new MutationObserver(() => {
      if (tryPrefill()) {
        observer.disconnect()
        clearTimeout(fallback)
      }
    })

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-auth-ready'],
    })

    const fallback = setTimeout(() => {
      observer.disconnect()
      tryPrefill()
    }, OBSERVER_FALLBACK_MS)

    return () => {
      observer.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  return <Original>{children}</Original>
}
