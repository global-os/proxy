import type { PropsWithChildren } from 'react'
import { Link } from '@tanstack/react-router'

function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

export const authInputCls =
  'w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500'

export const authLabelCls = 'text-sm font-medium text-gray-700'

export const authButtonCls =
  'w-full py-2.5 px-4 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-md transition-colors cursor-pointer border-0 text-center no-underline inline-block'

export const authSecondaryButtonCls =
  'w-full py-2.5 px-4 text-sm font-semibold text-violet-700 bg-white border border-violet-200 hover:bg-violet-50 rounded-md transition-colors cursor-pointer text-center no-underline inline-block'

export const authLinkCls = 'text-sm text-violet-600 hover:text-violet-800 font-medium no-underline'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-violet-50 font-sans">
      <header className="bg-white border-b border-violet-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-violet-700 no-underline hover:text-violet-900">
            GlobalOS
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  )
}

export function AuthCard({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        'w-full max-w-md bg-white rounded-lg shadow-[0_2px_16px_rgba(91,33,182,0.08)] border border-violet-100 px-8 py-8',
        className,
      )}
    >
      {children}
    </div>
  )
}