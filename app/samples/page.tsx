import { FileText, Clock, Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const sampleCases = [
  {
    id: 'amish-vaccination-case',
    title: 'Miller v. New York State Department of Health',
    subtitle: 'Amish Religious Exemption from Vaccination Requirements',
    type: 'Religious Liberty',
    status: 'Real Case - Analyzed',
    duration: '17 minutes',
    participants: 4,
    keyIssues: ['Employment Division v. Smith', 'Religious Targeting', 'Strict Scrutiny', 'Bodily Autonomy'],
    justiceAlignment: { favorable: 6, neutral: 2, unfavorable: 1 },
    confidence: 92,
    description: 'Real attorney strategy discussion about Amish families challenging New York\'s removal of religious exemptions for school vaccination requirements.',
    highlights: [
      'Actual transcript from constitutional lawyers',
      'Smith decision reversal opportunity',
      'Cross-ideological bodily autonomy appeal',
      'Pennsylvania religious liberty history'
    ]
  },
  {
    id: 'school-prayer-case',
    title: 'Students for Religious Expression v. Metro School District',
    subtitle: 'Student-Led Prayer at Public School Events',
    type: 'Religious Liberty',
    status: 'Sample Analysis',
    duration: '22 minutes',
    participants: 3,
    keyIssues: ['Establishment Clause', 'Free Speech', 'Student Rights', 'Government Speech'],
    justiceAlignment: { favorable: 5, neutral: 3, unfavorable: 1 },
    confidence: 78,
    description: 'High school students challenge school district policy prohibiting student-led prayer before football games and graduation ceremonies.',
    highlights: [
      'Kennedy v. Bremerton precedent application',
      'Student speech vs. government endorsement',
      'Historical tradition arguments',
      'Coercion analysis framework'
    ]
  },
  {
    id: 'free-speech-social-media',
    title: 'Digital Rights Coalition v. State of California',
    subtitle: 'Social Media Content Moderation Laws',
    type: 'Free Speech',
    status: 'Sample Analysis',
    duration: '28 minutes',
    participants: 5,
    keyIssues: ['First Amendment', 'State Action', 'Private Platforms', 'Compelled Speech'],
    justiceAlignment: { favorable: 7, neutral: 1, unfavorable: 1 },
    confidence: 85,
    description: 'Challenge to state law requiring social media platforms to host all "legal" content and prohibiting content moderation.',
    highlights: [
      'Public forum doctrine application',
      'Corporate speech rights',
      'State compelled speech analysis',
      'Section 230 intersection'
    ]
  },
  {
    id: 'due-process-ai-sentencing',
    title: 'Johnson v. State Criminal Justice Department',
    subtitle: 'AI Algorithm Use in Criminal Sentencing',
    type: 'Due Process',
    status: 'Sample Analysis',
    duration: '19 minutes',
    participants: 4,
    keyIssues: ['Due Process', 'Equal Protection', 'Algorithmic Bias', 'Transparency Rights'],
    justiceAlignment: { favorable: 4, neutral: 4, unfavorable: 1 },
    confidence: 71,
    description: 'Criminal defendant challenges use of proprietary AI algorithm in sentencing that considers factors not disclosed to defense.',
    highlights: [
      'Algorithmic transparency requirements',
      'Bias in criminal justice systems',
      'Confrontation clause implications',
      'Equal protection under AI systems'
    ]
  },
  {
    id: 'equal-protection-voting',
    title: 'Citizens for Fair Elections v. Secretary of State',
    subtitle: 'Voter ID Requirements and Equal Protection',
    type: 'Equal Protection',
    status: 'Sample Analysis',
    duration: '31 minutes',
    participants: 6,
    keyIssues: ['Equal Protection', 'Voting Rights', 'Fundamental Rights', 'Rational Basis'],
    justiceAlignment: { favorable: 3, neutral: 3, unfavorable: 3 },
    confidence: 64,
    description: 'Challenge to strict voter ID law requiring specific forms of identification that disproportionately affect certain communities.',
    highlights: [
      'Anderson-Burdick balancing test',
      'Disparate impact analysis',
      'Fundamental right to vote',
      'State election administration authority'
    ]
  },
  {
    id: 'administrative-law-epa',
    title: 'Energy Companies v. Environmental Protection Agency',
    subtitle: 'Climate Regulation Authority Under Clean Air Act',
    type: 'Administrative Law',
    status: 'Sample Analysis',
    duration: '25 minutes',
    participants: 4,
    keyIssues: ['Major Questions Doctrine', 'Chevron Deference', 'Separation of Powers', 'Statutory Interpretation'],
    justiceAlignment: { favorable: 6, neutral: 2, unfavorable: 1 },
    confidence: 82,
    description: 'Energy companies challenge EPA\'s broad interpretation of Clean Air Act authority to regulate greenhouse gas emissions.',
    highlights: [
      'West Virginia v. EPA precedent',
      'Major questions doctrine application',
      'Congressional delegation limits',
      'Textualist statutory interpretation'
    ]
  }
]

export default function SamplesPage() {
  const getStatusColor = (status: string) => {
    if (status.includes('Real Case')) return 'bg-green-100 text-green-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'Religious Liberty': 'bg-purple-100 text-purple-800',
      'Free Speech': 'bg-orange-100 text-orange-800',
      'Due Process': 'bg-red-100 text-red-800',
      'Equal Protection': 'bg-indigo-100 text-indigo-800',
      'Administrative Law': 'bg-yellow-100 text-yellow-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sample Case Analyses</h1>
          <p className="text-lg text-gray-600">
            Explore different types of constitutional cases and see how Supreme Legal AI analyzes attorney strategy discussions across various legal domains.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">1</p>
                <p className="text-sm text-gray-600">Real Case Analyzed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-600">Sample Analyses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-600">Constitutional Areas</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">79%</p>
                <p className="text-sm text-gray-600">Avg. Confidence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Case Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sampleCases.map((case_) => (
            <div key={case_.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                        {case_.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(case_.type)}`}>
                        {case_.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{case_.title}</h3>
                    <p className="text-sm text-gray-600">{case_.subtitle}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gray-900">{case_.confidence}%</div>
                    <div className="text-xs text-gray-500">Confidence</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4">{case_.description}</p>

                {/* Case Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {case_.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {case_.participants} attorneys
                  </div>
                </div>

                {/* Justice Alignment */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Justice Alignment</span>
                    <span>{case_.justiceAlignment.favorable}-{case_.justiceAlignment.neutral}-{case_.justiceAlignment.unfavorable}</span>
                  </div>
                  <div className="flex rounded-full overflow-hidden h-2">
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${(case_.justiceAlignment.favorable / 9) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-yellow-500" 
                      style={{ width: `${(case_.justiceAlignment.neutral / 9) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${(case_.justiceAlignment.unfavorable / 9) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Key Issues */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Legal Issues</h4>
                  <div className="flex flex-wrap gap-1">
                    {case_.keyIssues.map((issue, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Analysis Highlights</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {case_.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-500 mr-1">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t">
                  {case_.status.includes('Real Case') ? (
                    <Link
                      href={`/analysis/${case_.id}`}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center"
                    >
                      View Real Analysis
                      <TrendingUp className="ml-2 w-4 h-4" />
                    </Link>
                  ) : (
                    <button className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed flex items-center justify-center">
                      Sample Analysis
                      <AlertTriangle className="ml-2 w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Analyze Your Case?</h2>
          <p className="text-gray-600 mb-6">
            Upload your attorney strategy discussion and get AI-powered analysis like the real Amish vaccination case above.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Start New Analysis
          </Link>
        </div>
      </div>
    </div>
  )
} 