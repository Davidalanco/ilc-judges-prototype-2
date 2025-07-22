'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Scale, Brain, FileText, Users, Target, AlertTriangle, Shield, ArrowLeft } from 'lucide-react'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Determine which app we're in
  const isWorkflowApp = pathname.startsWith('/workflow')
  
  // Workflow App Navigation (Brief Creation Tool)
  const workflowNavigationItems = [
    {
      name: 'Brief Workflow',
      href: '/workflow',
      icon: Shield,
      description: 'Complete brief creation process'
    },
    {
      name: '← Back to Platform',
      href: '/',
      icon: ArrowLeft,
      description: 'Return to main platform'
    }
  ]

  // Platform Showcase Navigation (Demo/Marketing)
  const platformNavigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Scale,
      description: 'Landing page with file upload'
    },
    {
      name: 'Real Case Analysis',
      href: '/analysis/amish-vaccination-case',
      icon: Brain,
      description: 'Live analysis of Amish vaccination case'
    },
    {
      name: 'Sample Cases',
      href: '/samples',
      icon: FileText,
      description: 'View different case types and analyses'
    },
    {
      name: 'Justice Profiles',
      href: '/justices',
      icon: Users,
      description: 'Detailed Supreme Court justice analysis'
    },
    {
      name: 'Strategy Workshop',
      href: '/strategy',
      icon: Target,
      description: 'Argument framing and strategy tools'
    },
    {
      name: 'Risk Assessment',
      href: '/risks',
      icon: AlertTriangle,
      description: 'Case risk factors and mitigation'
    },
    {
      name: '📝 Working Tool',
      href: '/workflow',
      icon: Shield,
      description: 'Go to actual brief creation workflow'
    }
  ]

  // Choose navigation items based on current app
  const navigationItems = isWorkflowApp ? workflowNavigationItems : platformNavigationItems

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl">{isWorkflowApp ? '📝' : '⚖️'}</span>
              <h1 className="ml-2 text-xl font-bold text-gray-900">
                {isWorkflowApp ? 'Brief Workflow Tool' : 'Supreme Legal AI'}
              </h1>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Navigation Helper */}
      {pathname === '/' && (
        <div className="bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">
                    Choose between the Working Tool or Platform Showcase below
                  </span>
                </div>
                <Link
                  href="/workflow"
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
                >
                  Start Working Tool
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Workflow Tool Helper */}
      {isWorkflowApp && (
        <div className="bg-green-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900">
                    📝 Brief Creation Workflow - Working with Miller v. McDonald case
                  </span>
                </div>
                <Link
                  href="/"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                >
                  ← Back to Platform
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navigation 