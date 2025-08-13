'use client';

import React from 'react';
import SavedDocuments from '../components/SavedDocuments';

export default function SavedDocumentsDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Saved Legal Documents
          </h1>
          <p className="text-gray-600">
            View and manage your saved legal research documents with AI analysis and notes.
          </p>
        </div>

        <SavedDocuments 
          caseId="0ff75224-0d61-497d-ac1b-ffefdb63dba1" 
          userId="a2871219-533b-485e-9ac6-effcda36a88d" 
        />
      </div>
    </div>
  );
}
