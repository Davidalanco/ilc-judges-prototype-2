'use client';

import { useState } from 'react';

export interface InterestOfAmicusData {
  case: {
    caption: string;
    question_presented: string;
    party_supported: 'Petitioner' | 'Respondent';
    posture: string;
  };
  amicus: {
    name: string;
    type: 'individual' | 'nonprofit' | 'trade_association' | 'academic_coalition' | 'state' | 'business';
    mission_or_purpose: string;
    size_scope: {
      members: number;
      footprint: 'national' | 'state' | 'local';
    };
    credentials: string[];
    empirical_assets: string[];
    related_litigation: string[];
    direct_stake: string;
    unique_perspective: string;
    counsel_of_record: string;
  };
  rule37: {
    authorship: string;
    funding: string;
    consent: 'all parties consented' | 'one party withheld' | 'not required';
  };
}

interface InterestOfAmicusFormProps {
  onDataChange: (data: InterestOfAmicusData) => void;
  initialData?: Partial<InterestOfAmicusData>;
  onSubmit?: () => void;
}

export default function InterestOfAmicusForm({ onDataChange, initialData, onSubmit }: InterestOfAmicusFormProps) {
  const [data, setData] = useState<InterestOfAmicusData>({
    case: {
      caption: initialData?.case?.caption || 'Miller v. McDonald',
      question_presented: initialData?.case?.question_presented || '',
      party_supported: initialData?.case?.party_supported || 'Petitioner',
      posture: initialData?.case?.posture || 'On writ of certiorari to the United States Court of Appeals for the Ninth Circuit'
    },
    amicus: {
      name: initialData?.amicus?.name || '',
      type: initialData?.amicus?.type || 'nonprofit',
      mission_or_purpose: initialData?.amicus?.mission_or_purpose || '',
      size_scope: {
        members: initialData?.amicus?.size_scope?.members || 0,
        footprint: initialData?.amicus?.size_scope?.footprint || 'national'
      },
      credentials: initialData?.amicus?.credentials || [],
      empirical_assets: initialData?.amicus?.empirical_assets || [],
      related_litigation: initialData?.amicus?.related_litigation || [],
      direct_stake: initialData?.amicus?.direct_stake || '',
      unique_perspective: initialData?.amicus?.unique_perspective || '',
      counsel_of_record: initialData?.amicus?.counsel_of_record || ''
    },
    rule37: {
      authorship: initialData?.rule37?.authorship || 'No party\'s counsel authored this brief in whole or in part',
      funding: initialData?.rule37?.funding || 'No person other than amicus and its counsel made a monetary contribution intended to fund the preparation or submission of this brief',
      consent: initialData?.rule37?.consent || 'all parties consented'
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateData = (section: keyof InterestOfAmicusData, field: string, value: any) => {
    const newData = {
      ...data,
      [section]: {
        ...data[section],
        [field]: value
      }
    };
    setData(newData);
    onDataChange(newData);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateNestedData = (section: keyof InterestOfAmicusData, field: string, subField: string, value: any) => {
    const newData = {
      ...data,
      [section]: {
        ...data[section],
        [field]: {
          ...(data[section] as any)[field],
          [subField]: value
        }
      }
    };
    setData(newData);
    onDataChange(newData);
  };

  const addArrayItem = (section: keyof InterestOfAmicusData, field: string, value: string) => {
    if (!value.trim()) return;
    
    const newData = {
      ...data,
      [section]: {
        ...data[section],
        [field]: [...(data[section] as any)[field], value.trim()]
      }
    };
    setData(newData);
    onDataChange(newData);
  };

  const removeArrayItem = (section: keyof InterestOfAmicusData, field: string, index: number) => {
    const newData = {
      ...data,
      [section]: {
        ...data[section],
        [field]: (data[section] as any)[field].filter((_: any, i: number) => i !== index)
      }
    };
    setData(newData);
    onDataChange(newData);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!data.amicus.name.trim()) newErrors.amicus_name = 'Amicus name is required';
    if (!data.amicus.mission_or_purpose.trim()) newErrors.amicus_mission = 'Mission or purpose is required';
    if (!data.amicus.direct_stake.trim()) newErrors.amicus_stake = 'Direct stake is required';
    if (!data.amicus.unique_perspective.trim()) newErrors.amicus_perspective = 'Unique perspective is required';
    if (!data.rule37.authorship.trim()) newErrors.rule37_authorship = 'Authorship disclosure is required';
    if (!data.rule37.funding.trim()) newErrors.rule37_funding = 'Funding disclosure is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Interest of Amicus Curiae - Input Form
        </h2>
        <p className="text-gray-600">
          Complete all required fields to generate the Interest of Amicus Curiae section. 
          This establishes your credibility and unique value to the Court.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Case Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Case Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Caption *
              </label>
              <input
                type="text"
                value={data.case.caption}
                onChange={(e) => updateData('case', 'caption', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Miller v. McDonald"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Supported *
              </label>
              <select
                value={data.case.party_supported}
                onChange={(e) => updateData('case', 'party_supported', e.target.value as 'Petitioner' | 'Respondent')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Petitioner">Petitioner</option>
                <option value="Respondent">Respondent</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Presented *
              </label>
              <textarea
                value={data.case.question_presented}
                onChange={(e) => updateData('case', 'question_presented', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                placeholder="Whether Title VII requires employers to provide reasonable accommodations..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posture
              </label>
              <input
                type="text"
                value={data.case.posture}
                onChange={(e) => updateData('case', 'posture', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="On writ of certiorari to the United States Court of Appeals for the Ninth Circuit"
              />
            </div>
          </div>
        </div>

        {/* Amicus Information */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏛️ Amicus Information</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amicus Name *
                </label>
                <input
                  type="text"
                  value={data.amicus.name}
                  onChange={(e) => updateData('amicus', 'name', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amicus_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="National Association of Faith-Inclusive Employers"
                />
                {errors.amicus_name && <p className="text-red-500 text-sm mt-1">{errors.amicus_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={data.amicus.type}
                  onChange={(e) => updateData('amicus', 'type', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="individual">Individual</option>
                  <option value="nonprofit">Nonprofit</option>
                  <option value="trade_association">Trade Association</option>
                  <option value="academic_coalition">Academic Coalition</option>
                  <option value="state">State</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission or Purpose *
              </label>
              <textarea
                value={data.amicus.mission_or_purpose}
                onChange={(e) => updateData('amicus', 'mission_or_purpose', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 ${
                  errors.amicus_mission ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="To promote religious accommodation best practices in the workplace..."
              />
              {errors.amicus_mission && <p className="text-red-500 text-sm mt-1">{errors.amicus_mission}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Members/Constituents
                </label>
                <input
                  type="number"
                  value={data.amicus.size_scope.members}
                  onChange={(e) => updateNestedData('amicus', 'size_scope', 'members', parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="412"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Geographic Footprint
                </label>
                <select
                  value={data.amicus.size_scope.footprint}
                  onChange={(e) => updateNestedData('amicus', 'size_scope', 'footprint', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="national">National</option>
                  <option value="state">State</option>
                  <option value="local">Local</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direct Stake *
              </label>
              <textarea
                value={data.amicus.direct_stake}
                onChange={(e) => updateData('amicus', 'direct_stake', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 ${
                  errors.amicus_stake ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="The ruling will directly affect how our 412 member employers implement religious accommodations..."
              />
              {errors.amicus_stake && <p className="text-red-500 text-sm mt-1">{errors.amicus_stake}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unique Perspective *
              </label>
              <textarea
                value={data.amicus.unique_perspective}
                onChange={(e) => updateData('amicus', 'unique_perspective', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 ${
                  errors.amicus_perspective ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="We provide the only comprehensive dataset on real-world accommodation costs and outcomes..."
              />
              {errors.amicus_perspective && <p className="text-red-500 text-sm mt-1">{errors.amicus_perspective}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Counsel of Record
              </label>
              <input
                type="text"
                value={data.amicus.counsel_of_record}
                onChange={(e) => updateData('amicus', 'counsel_of_record', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Smith, Esq."
              />
            </div>
          </div>
        </div>

        {/* Credentials and Experience */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎓 Credentials & Experience</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credentials (prior cases, awards, recognized expertise)
              </label>
              <div className="space-y-2">
                {data.amicus.credentials.map((credential, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={credential}
                      onChange={(e) => {
                        const newCredentials = [...data.amicus.credentials];
                        newCredentials[index] = e.target.value;
                        updateData('amicus', 'credentials', newCredentials);
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Consulted in 15+ federal religious accommodation cases"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('amicus', 'credentials', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('amicus', 'credentials', '')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Credential
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empirical Assets (datasets, surveys, studies)
              </label>
              <div className="space-y-2">
                {data.amicus.empirical_assets.map((asset, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={asset}
                      onChange={(e) => {
                        const newAssets = [...data.amicus.empirical_assets];
                        newAssets[index] = e.target.value;
                        updateData('amicus', 'empirical_assets', newAssets);
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Longitudinal dataset tracking 25,000+ accommodations"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('amicus', 'empirical_assets', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('amicus', 'empirical_assets', '')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Asset
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Litigation (case name & court/year)
              </label>
              <div className="space-y-2">
                {data.amicus.related_litigation.map((litigation, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={litigation}
                      onChange={(e) => {
                        const newLitigation = [...data.amicus.related_litigation];
                        newLitigation[index] = e.target.value;
                        updateData('amicus', 'related_litigation', newLitigation);
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Smith v. ABC Corp, 9th Cir. 2023"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('amicus', 'related_litigation', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('amicus', 'related_litigation', '')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Litigation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rule 37.6 Disclosure */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚖️ Rule 37.6 Disclosure</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authorship Disclosure *
              </label>
              <textarea
                value={data.rule37.authorship}
                onChange={(e) => updateData('rule37', 'authorship', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 ${
                  errors.rule37_authorship ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="No party's counsel authored this brief in whole or in part..."
              />
              {errors.rule37_authorship && <p className="text-red-500 text-sm mt-1">{errors.rule37_authorship}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Disclosure *
              </label>
              <textarea
                value={data.rule37.funding}
                onChange={(e) => updateData('rule37', 'funding', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 ${
                  errors.rule37_funding ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="No person other than amicus and its counsel made a monetary contribution..."
              />
              {errors.rule37_funding && <p className="text-red-500 text-sm mt-1">{errors.rule37_funding}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consent Status
              </label>
              <select
                value={data.rule37.consent}
                onChange={(e) => updateData('rule37', 'consent', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all parties consented">All parties consented</option>
                <option value="one party withheld">One party withheld</option>
                <option value="not required">Not required (state reason)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Interest Section
          </button>
        </div>
      </form>
    </div>
  );
}
