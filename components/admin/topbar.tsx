"use client";

import { logoutAction } from "@/lib/actions/auth";

interface TopbarProps {
  readonly nama: string;
  readonly email: string;
  readonly onMenuToggle: () => void;
}

export function Topbar({ nama, email, onMenuToggle }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-navy/10 bg-white px-4 lg:px-6">
      {/* Mobile menu toggle */}
      <button
        type="button"
        className="text-navy/60 hover:text-navy lg:hidden"
        onClick={onMenuToggle}
        aria-label="Buka menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User info + logout */}
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-navy">{nama}</p>
          <p className="text-xs text-navy/60">{email}</p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-navy/70 transition-colors hover:bg-navy/5 hover:text-navy"
          >
            Log Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
