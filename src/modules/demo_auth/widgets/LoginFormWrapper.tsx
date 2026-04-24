'use client'

import { useEffect, type ComponentType, type ReactNode } from 'react'

const DEFAULT_EMAIL = process.env.NEXT_PUBLIC_DEFAULT_LOGIN_EMAIL || ''
const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_DEFAULT_LOGIN_PASSWORD || ''

/** Delay before auto-submitting to let React process synthetic change events from prefilled inputs */
const AUTO_SUBMIT_DELAY_MS = 50

/** How long to keep the MutationObserver attached waiting for the login form to render */
const OBSERVER_FALLBACK_MS = 5000

/**
 * Use the native HTMLInputElement value setter so React's internal tracking
 * picks up the programmatic change and fires synthetic onChange handlers.
 */
function getNativeInputValueSetter(): ((v: string) => void) | undefined {
  try {
    if (typeof window !== 'undefined') {
      return Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    }
  } catch {
    // Fallback: direct assignment will be used instead
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
