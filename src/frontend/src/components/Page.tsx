type PageProps = React.PropsWithChildren<{
  variant?: 'default' | 'workspace'
}>

export const Page = ({ children, variant = 'default' }: PageProps) => {
  if (variant === 'workspace') {
    return (
      <div className="w-full h-screen overflow-hidden">
        {children}
      </div>
    )
  }

  return (
    <div
      className="w-full min-h-screen overflow-auto"
      style={{ background: 'linear-gradient(165deg, #1e40af 0%, #2563eb 45%, #1d4ed8 100%)' }}
    >
      {children}
    </div>
  )
}
