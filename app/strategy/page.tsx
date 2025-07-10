import { Target, Brain, Users, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'

export default function StrategyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Strategy Workshop</h1>
          <p className="text-lg text-gray-600">
            Advanced tools for framing constitutional arguments and developing persuasive legal strategies.
          </p>
        </div>

        {/* Strategy Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Argument Framing Tool */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Target className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Argument Framing</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Frame your constitutional arguments for maximum persuasive impact across different judicial philosophies.
            </p>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Originalist Framing</h3>
                <p className="text-sm text-gray-600">Historical meaning and Founding Era intent</p>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Effective for Thomas, Alito, Gorsuch
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Textualist Approach</h3>
                <p className="text-sm text-gray-600">Plain meaning of constitutional text</p>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Effective for Gorsuch, Barrett, Kavanaugh
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Pragmatic Framework</h3>
                <p className="text-sm text-gray-600">Real-world consequences and practical outcomes</p>
                <div className="mt-2 flex items-center text-sm text-yellow-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  May appeal to Kagan, Roberts
                </div>
              </div>
            </div>
          </div>

          {/* Justice Targeting */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Justice Targeting</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Tailor your arguments to specific justices' judicial philosophies and concerns.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-900">Conservative Block</span>
                <span className="text-sm text-green-700">5-6 votes likely</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium text-gray-900">Swing Justices</span>
                <span className="text-sm text-yellow-700">2-3 votes possible</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-900">Liberal Block</span>
                <span className="text-sm text-red-700">Cross-appeal needed</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Strategic Recommendation</h3>
              <p className="text-sm text-blue-800">
                Focus on securing Roberts and Barrett while providing cross-ideological appeals for liberal justices.
              </p>
            </div>
          </div>

          {/* Precedent Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Brain className="h-8 w-8 text-orange-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Precedent Analysis</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Analyze relevant precedents and their application to your case.
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900">Supporting Precedents</h3>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Wisconsin v. Yoder (1972) - Religious education</li>
                  <li>• Church of Lukumi (1993) - Religious targeting</li>
                  <li>• Fulton v. Philadelphia (2021) - General applicability</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-900">Opposing Precedents</h3>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Employment Division v. Smith (1990) - Neutral laws</li>
                  <li>• Jacobson v. Massachusetts (1905) - Public health</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Persuasion Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Persuasion Metrics</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Track the persuasive strength of different argument strategies.
            </p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Historical Arguments</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Textual Analysis</span>
                  <span>88%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '88%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Practical Consequences</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Policy Arguments</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">AI Strategic Recommendations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Primary Strategy</h3>
              <p className="text-sm text-gray-600 mb-3">
                Lead with historical religious liberty arguments emphasizing Pennsylvania's colonial experience.
              </p>
              <div className="text-xs text-green-600 font-medium">High Impact</div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Secondary Approach</h3>
              <p className="text-sm text-gray-600 mb-3">
                Frame as abstention claim rather than accommodation demand to appeal to liberal justices.
              </p>
              <div className="text-xs text-yellow-600 font-medium">Medium Impact</div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Fallback Position</h3>
              <p className="text-sm text-gray-600 mb-3">
                Argue narrow application to insular communities if broad religious liberty fails.
              </p>
              <div className="text-xs text-blue-600 font-medium">Safe Option</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 