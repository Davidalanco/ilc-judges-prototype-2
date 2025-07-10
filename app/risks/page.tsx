import { AlertTriangle, Shield, TrendingDown, TrendingUp, Target, CheckCircle } from 'lucide-react'

export default function RisksPage() {
  const riskFactors = [
    {
      category: 'Political Risks',
      level: 'High',
      factors: [
        {
          name: 'Vaccine Politics',
          description: 'Political sensitivity around vaccines could make justices reluctant to take case',
          probability: 75,
          impact: 'High',
          mitigation: 'Emphasize traditional childhood vaccines, not COVID vaccines'
        },
        {
          name: 'Election Year Considerations',
          description: 'Court may avoid controversial decisions during election periods',
          probability: 60,
          impact: 'Medium',
          mitigation: 'Frame as narrow, technical constitutional issue'
        }
      ]
    },
    {
      category: 'Legal Risks',
      level: 'Medium',
      factors: [
        {
          name: 'Broad Civil Rights Implications',
          description: 'Justices may worry about impact on broader civil rights enforcement',
          probability: 65,
          impact: 'High',
          mitigation: 'Emphasize narrow application to insular religious communities'
        },
        {
          name: 'Precedent Stability',
          description: 'Institutional concerns about overturning major precedent',
          probability: 70,
          impact: 'Medium',
          mitigation: 'Provide narrow ruling pathway without Smith reversal'
        }
      ]
    },
    {
      category: 'Strategic Risks',
      level: 'Medium',
      factors: [
        {
          name: 'Public Health Concerns',
          description: 'Liberal justices may prioritize public health over religious liberty',
          probability: 80,
          impact: 'Medium',
          mitigation: 'Argue limited public health impact from insular communities'
        },
        {
          name: 'Slippery Slope Arguments',
          description: 'Opposition will argue religious exemptions undermine all regulations',
          probability: 90,
          impact: 'Medium',
          mitigation: 'Distinguish insular communities from general population'
        }
      ]
    }
  ]

  const mitigationStrategies = [
    {
      title: 'Narrow Framing Strategy',
      description: 'Frame the case as limited to insular religious communities with minimal public interaction',
      effectiveness: 85,
      targetJustices: ['Roberts', 'Barrett', 'Kavanaugh'],
      implementation: [
        'Emphasize Amish self-sufficiency and isolation',
        'Distinguish from broader religious exemption claims',
        'Highlight minimal public health risk'
      ]
    },
    {
      title: 'Cross-Ideological Appeal',
      description: 'Include bodily autonomy arguments to appeal to liberal justices',
      effectiveness: 65,
      targetJustices: ['Kagan', 'Sotomayor', 'Jackson'],
      implementation: [
        'Frame as bodily integrity issue',
        'Emphasize minority rights protection',
        'Connect to broader civil liberties concerns'
      ]
    },
    {
      title: 'Historical Precedent Focus',
      description: 'Leverage Pennsylvania\'s colonial religious liberty tradition',
      effectiveness: 90,
      targetJustices: ['Thomas', 'Alito', 'Gorsuch'],
      implementation: [
        'Extensive historical research and citations',
        'Connect to Founding Era religious liberty',
        'Emphasize positive outcomes of accommodation'
      ]
    }
  ]

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Risk Assessment</h1>
          <p className="text-lg text-gray-600">
            Comprehensive analysis of potential challenges and strategic mitigation approaches for constitutional cases.
          </p>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">High Risk Factors</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">4</p>
                <p className="text-sm text-gray-600">Medium Risk Factors</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">Mitigation Strategies</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">80%</p>
                <p className="text-sm text-gray-600">Avg. Mitigation Effectiveness</p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Identified Risk Factors</h2>
          <div className="space-y-6">
            {riskFactors.map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{category.category}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(category.level)}`}>
                      {category.level} Risk
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {category.factors.map((factor, factorIndex) => (
                      <div key={factorIndex} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">{factor.name}</h4>
                            <p className="text-sm text-gray-600 mb-3">{factor.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-gray-900">{factor.probability}%</div>
                            <div className="text-xs text-gray-500">Probability</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2">Impact:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(factor.impact)}`}>
                              {factor.impact}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Mitigation:</span> {factor.mitigation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mitigation Strategies */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mitigation Strategies</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mitigationStrategies.map((strategy, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Target className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-bold text-gray-900">{strategy.title}</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{strategy.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Effectiveness</span>
                      <span className="font-medium">{strategy.effectiveness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{width: `${strategy.effectiveness}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Target Justices</h4>
                    <div className="flex flex-wrap gap-1">
                      {strategy.targetJustices.map((justice, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {justice}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Implementation</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {strategy.implementation.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Matrix */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Risk-Impact Matrix</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">High Risk / High Impact</h3>
              <p className="text-sm text-red-700">Vaccine Politics</p>
              <p className="text-sm text-red-700">Civil Rights Implications</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Medium Risk / Medium Impact</h3>
              <p className="text-sm text-yellow-700">Precedent Stability</p>
              <p className="text-sm text-yellow-700">Public Health Concerns</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Manageable Risks</h3>
              <p className="text-sm text-green-700">Election Year Timing</p>
              <p className="text-sm text-green-700">Slippery Slope Arguments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 