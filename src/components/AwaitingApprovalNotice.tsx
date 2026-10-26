export const AWAITING_APPROVAL_MESSAGE =
  'Awaiting approval. Once completed, you can continue creating events.'

export function AwaitingApprovalNotice({
  className = 'text-sm text-amber-900',
}: {
  className?: string
}) {
  return <p className={className}>{AWAITING_APPROVAL_MESSAGE}</p>
}
