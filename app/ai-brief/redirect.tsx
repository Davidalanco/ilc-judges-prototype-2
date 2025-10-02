'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BriefRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if there's a section parameter in the URL
    const section = searchParams.get('section');
    
    if (section) {
      // If there's a section, redirect to the new URL structure
      // For now, we'll create a default case ID
      const defaultCaseId = 'default-case';
      router.replace(`/ai-brief/${defaultCaseId}/${section}`);
    } else {
      // Otherwise, redirect to the main brief builder
      router.replace('/ai-brief');
    }
  }, [router, searchParams]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to new URL structure...</p>
      </div>
    </div>
  );
}
