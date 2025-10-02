import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Brief Builder - Supreme Legal AI',
  description: 'Create AI-powered amicus briefs for Supreme Court cases',
}

export default function AIBriefLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
