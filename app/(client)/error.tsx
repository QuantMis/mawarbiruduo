'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function Error({ error, unstable_retry }: ErrorProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    console.error(error)
  }, [error])

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-elevated text-center sm:p-10">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-serif text-2xl font-bold text-navy outline-none sm:text-3xl"
        >
          Maaf, sesuatu telah berlaku
        </h1>

        <p className="mt-4 font-sans text-base text-navy/80">
          Kami mohon maaf atas kesulitan ini. Sila cuba semula atau kembali ke
          laman utama.
        </p>

        {error.digest && (
          <p className="mt-2 font-sans text-xs text-navy/50">
            Rujukan ralat: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex items-center justify-center rounded-lg bg-navy px-6 py-3 font-sans text-sm font-medium text-cream transition-colors hover:bg-navy-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Cuba Semula
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-navy px-6 py-3 font-sans text-sm font-medium text-navy transition-colors hover:bg-navy-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Kembali ke Laman Utama
          </Link>
        </div>
      </div>
    </main>
  )
}
