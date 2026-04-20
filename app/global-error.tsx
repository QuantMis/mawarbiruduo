'use client'

import { useEffect, useRef } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function GlobalError({
  error,
  unstable_retry,
}: GlobalErrorProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    console.error(error)
  }, [error])

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <html lang="ms">
      <body
        style={{
          margin: 0,
          fontFamily: 'Inter, system-ui, sans-serif',
          backgroundColor: '#EBDED4',
          color: '#07203F',
        }}
      >
        <main
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '28rem',
              borderRadius: '0.75rem',
              backgroundColor: '#FFFFFF',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow:
                '0 10px 15px -3px rgba(2, 0, 13, 0.1), 0 4px 6px -2px rgba(2, 0, 13, 0.05)',
            }}
          >
            <h1
              ref={headingRef}
              tabIndex={-1}
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#07203F',
                margin: 0,
                outline: 'none',
              }}
            >
              Maaf, sesuatu telah berlaku
            </h1>

            <p
              style={{
                marginTop: '1rem',
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'rgba(7, 32, 63, 0.8)',
              }}
            >
              Kami mohon maaf atas kesulitan ini. Sila cuba semula.
            </p>

            {error.digest && (
              <p
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'rgba(7, 32, 63, 0.5)',
                }}
              >
                Rujukan ralat: {error.digest}
              </p>
            )}

            <div style={{ marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => unstable_retry()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.5rem',
                  backgroundColor: '#07203F',
                  color: '#EBDED4',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Cuba Semula
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
