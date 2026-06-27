import type { PropsWithChildren } from 'react'
import { Link } from '@tanstack/react-router'

function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

export const authInputCls =
  'w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500'

export const authLabelCls = 'text-sm font-medium text-gray-700'

export const authButtonCls =
  'w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer border-0 text-center no-underline inline-block'

export const authSecondaryButtonCls =
  'w-full py-2.5 px-4 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors cursor-pointer text-center no-underline inline-block'

export const authLinkCls = 'text-sm text-blue-600 hover:text-blue-800 font-medium no-underline'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f2] font-sans">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-blue-700 no-underline hover:text-blue-800">
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
        'w-full max-w-md bg-white rounded-lg shadow-[0_2px_16px_rgba(0,0,0,0.08)] border border-gray-100 px-8 py-8',
        className,
      )}
    >
      {children}
    </div>
  )
}