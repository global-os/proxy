export const Page = ({ children }: React.PropsWithChildren) => (
  <div className="w-full h-screen overflow-auto" style={{ background: '#1e1250' }}>
    {children}
  </div>
)
