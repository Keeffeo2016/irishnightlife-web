'use client'

import { Suspense } from 'react'
import PlanResultContent from './PlanResultContent'

export default function PlanResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="text-2xl font-bold text-emerald-600">IrishNightlife</a>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
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
