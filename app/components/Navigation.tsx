'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/workflow', label: 'Workflow (Real)' },
    { href: '/transcriptions', label: 'Transcriptions' },
    { href: '/ai-brief', label: 'AI Brief Builder', className: 'bg-blue-100 text-blue-800' },
    { href: '/prototype', label: 'Prototype (Visual Reference)', className: 'bg-yellow-100 text-yellow-800' },
    { href: '/analysis/amish-vaccination-case', label: 'Analysis' },
    { href: '/justices', label: 'Justices' },
    { href: '/samples', label: 'Samples' },
    { href: '/strategy', label: 'Strategy' },
    { href: '/risks', label: 'Risks' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">Supreme Legal AI</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${item.className || ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 