'use client'

import { Suspense } from 'react'
import PlanResultContent, { PlannerLoading } from './PlanResultContent'

export default function PlanResultPage() {
  return (
    <Suspense fallback={<PlannerLoading />}>
      <PlanResultContent />
    </Suspense>
  )
}
