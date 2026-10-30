import { AWAITING_APPROVAL_MESSAGE } from '@/lib/dashboard-validation'

export { AWAITING_APPROVAL_MESSAGE }

export function AwaitingApprovalNotice({
  className = 'text-sm text-amber-200',
}: {
  className?: string
}) {
  return <p className={className}>{AWAITING_APPROVAL_MESSAGE}</p>
}
