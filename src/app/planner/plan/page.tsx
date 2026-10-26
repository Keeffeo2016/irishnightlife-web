'use client'

import { Suspense } from 'react'
import PlanResultContent from './PlanResultContent'

export default function PlanResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col bg-gray-50">
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">✨</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading your plan...</h2>
            <p className="text-gray-600">Preparing your perfect night out</p>
          </div>
        </main>
      </div>
    }>
      <PlanResultContent />
    </Suspense>
  )
}
