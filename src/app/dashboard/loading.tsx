export default function DashboardLoading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">Loading venue dashboard</p>
      <div className="space-y-6">
        <div className="h-8 w-56 rounded-lg bg-card" />
        <div className="h-4 w-40 rounded-lg bg-card/80" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-28 rounded-xl border border-border bg-card" />
          <div className="h-28 rounded-xl border border-border bg-card" />
          <div className="h-28 rounded-xl border border-border bg-card" />
          <div className="h-28 rounded-xl border border-border bg-card" />
        </div>
        <div className="h-64 rounded-xl border border-border bg-card" />
      </div>
    </div>
  )
}
