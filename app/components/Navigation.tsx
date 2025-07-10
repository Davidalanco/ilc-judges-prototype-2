'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Scale, Brain, FileText, Users, Target, AlertTriangle } from 'lucide-react'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Scale,
      description: 'Landing page with file upload'
    },
    {
      name: '10-Step Workflow',
      href: '/workflow',
      icon: Target,
      description: 'Complete brief creation process'
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
    }
  ]

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
              <span className="text-2xl">⚖️</span>
              <h1 className="ml-2 text-xl font-bold text-gray-900">Supreme Legal AI</h1>
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

      {/* Navigation Helper - Only show on homepage */}
      {pathname === '/' && (
        <div className="bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">
                    👆 Use the navigation above to explore different sections of the tool
                  </span>
                </div>
                <Link
                  href="/analysis/amish-vaccination-case"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                >
                  View Real Case Analysis
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