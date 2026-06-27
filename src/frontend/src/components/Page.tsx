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
      style={{ background: 'linear-gradient(165deg, #3b0764 0%, #6d28d9 45%, #5b21b6 100%)' }}
    >
      {children}
    </div>
  )
}
