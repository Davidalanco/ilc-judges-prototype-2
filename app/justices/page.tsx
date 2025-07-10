import { Users, TrendingUp, Scale, Brain, AlertCircle, CheckCircle } from 'lucide-react'

const justiceData = [
  {
    name: "Justice Samuel A. Alito Jr.",
    alignment: 95,
    appointment: "2006 (Bush)",
    philosophy: "Originalist/Textualist",
    keyPositions: ["Religious Liberty Champion", "Federalism Advocate", "Individual Rights"],
    recentVotes: [
      { case: "Kennedy v. Bremerton (2022)", vote: "Majority", issue: "School Prayer" },
      { case: "Dobbs v. Jackson (2022)", vote: "Majority", issue: "Abortion Rights" },
      { case: "Trinity Lutheran (2017)", vote: "Majority", issue: "Religious Funding" }
    ],
    strategy: "Emphasize historical religious persecution and constitutional text",
    concerns: "None - natural ally on religious liberty issues",
    persuasionFactors: ["Original meaning", "Historical practice", "Religious freedom"],
    riskFactors: ["Minimal - highly predictable vote"]
  },
  {
    name: "Justice Neil M. Gorsuch",
    alignment: 93,
    appointment: "2017 (Trump)",
    philosophy: "Textualist/Originalist",
    keyPositions: ["Smith Critic", "Individual Liberty", "Separation of Powers"],
    recentVotes: [
      { case: "Fulton v. Philadelphia (2021)", vote: "Concurrence", issue: "Religious Exemptions" },
      { case: "Bostock v. Clayton County (2020)", vote: "Majority", issue: "Employment Discrimination" },
      { case: "Carpenter v. United States (2018)", vote: "Majority", issue: "Digital Privacy" }
    ],
    strategy: "Focus on textual meaning and individual liberty principles",
    concerns: "None - has explicitly criticized Smith decision",
    persuasionFactors: ["Plain text", "Individual rights", "Government overreach"],
    riskFactors: ["Minimal - strong religious liberty record"]
  },
  {
    name: "Justice Clarence Thomas",
    alignment: 90,
    appointment: "1991 (Bush Sr.)",
    philosophy: "Originalist",
    keyPositions: ["Original Meaning", "Individual Rights", "Limited Government"],
    recentVotes: [
      { case: "Dobbs v. Jackson (2022)", vote: "Concurrence", issue: "Abortion Rights" },
      { case: "New York Rifle (2022)", vote: "Majority", issue: "Gun Rights" },
      { case: "Espinoza v. Montana (2020)", vote: "Majority", issue: "School Choice" }
    ],
    strategy: "Historical analysis of Founding Era religious liberty",
    concerns: "None - consistent originalist approach",
    persuasionFactors: ["Founding era history", "Original understanding", "Individual liberty"],
    riskFactors: ["Low - reliable conservative vote"]
  },
  {
    name: "Justice Amy Coney Barrett",
    alignment: 75,
    appointment: "2020 (Trump)",
    philosophy: "Originalist/Textualist",
    keyPositions: ["Judicial Restraint", "Religious Liberty", "Institutional Concerns"],
    recentVotes: [
      { case: "Students for Fair Admissions (2023)", vote: "Majority", issue: "Affirmative Action" },
      { case: "Moore v. Harper (2023)", vote: "Majority", issue: "Election Law" },
      { case: "Fulton v. Philadelphia (2021)", vote: "Majority", issue: "Religious Exemptions" }
    ],
    strategy: "Emphasize narrow application to religious communities",
    concerns: "May prefer incremental change over broad precedent reversal",
    persuasionFactors: ["Judicial minimalism", "Religious liberty", "Narrow holdings"],
    riskFactors: ["Medium - institutional concerns may limit scope"]
  },
  {
    name: "Justice Brett M. Kavanaugh",
    alignment: 70,
    appointment: "2018 (Trump)",
    philosophy: "Conservative Pragmatist",
    keyPositions: ["Precedent Respect", "Institutional Stability", "Moderate Approach"],
    recentVotes: [
      { case: "Dobbs v. Jackson (2022)", vote: "Majority", issue: "Abortion Rights" },
      { case: "West Virginia v. EPA (2022)", vote: "Majority", issue: "Administrative Law" },
      { case: "American Legion (2019)", vote: "Majority", issue: "Religious Displays" }
    ],
    strategy: "Focus on limited impact to insular communities",
    concerns: "Worried about broader implications for civil rights",
    persuasionFactors: ["Narrow scope", "Precedent stability", "Institutional concerns"],
    riskFactors: ["Medium - may prefer limited ruling"]
  },
  {
    name: "Chief Justice John G. Roberts Jr.",
    alignment: 65,
    appointment: "2005 (Bush)",
    philosophy: "Institutional Conservative",
    keyPositions: ["Judicial Minimalism", "Institutional Legitimacy", "Incremental Change"],
    recentVotes: [
      { case: "Moore v. Harper (2023)", vote: "Majority", issue: "Election Law" },
      { case: "Students for Fair Admissions (2023)", vote: "Majority", issue: "Affirmative Action" },
      { case: "Department of Homeland Security v. Regents (2020)", vote: "Majority", issue: "DACA" }
    ],
    strategy: "Emphasize judicial minimalism and narrow ruling",
    concerns: "Institutional impact of overturning major precedent",
    persuasionFactors: ["Narrow holdings", "Institutional stability", "Precedent respect"],
    riskFactors: ["High - may prioritize institutional concerns"]
  },
  {
    name: "Justice Elena Kagan",
    alignment: 45,
    appointment: "2010 (Obama)",
    philosophy: "Legal Pragmatist",
    keyPositions: ["Government Authority", "Minority Rights", "Practical Outcomes"],
    recentVotes: [
      { case: "Moore v. Harper (2023)", vote: "Concurrence", issue: "Election Law" },
      { case: "Biden v. Nebraska (2023)", vote: "Dissent", issue: "Student Loans" },
      { case: "Masterpiece Cakeshop (2018)", vote: "Concurrence", issue: "Religious Liberty" }
    ],
    strategy: "Frame as minority rights and bodily autonomy issue",
    concerns: "Generally supports government authority over religious exemptions",
    persuasionFactors: ["Minority protection", "Bodily autonomy", "Practical effects"],
    riskFactors: ["High - skeptical of broad religious exemptions"]
  },
  {
    name: "Justice Sonia Sotomayor",
    alignment: 40,
    appointment: "2009 (Obama)",
    philosophy: "Liberal Pragmatist",
    keyPositions: ["Government Authority", "Public Health", "Civil Rights"],
    recentVotes: [
      { case: "Students for Fair Admissions (2023)", vote: "Dissent", issue: "Affirmative Action" },
      { case: "Dobbs v. Jackson (2022)", vote: "Dissent", issue: "Abortion Rights" },
      { case: "Trinity Lutheran (2017)", vote: "Dissent", issue: "Religious Funding" }
    ],
    strategy: "Emphasize protection of vulnerable minority communities",
    concerns: "Public health priorities over religious exemptions",
    persuasionFactors: ["Minority protection", "Public health", "Government authority"],
    riskFactors: ["High - strong public health advocate"]
  },
  {
    name: "Justice Ketanji Brown Jackson",
    alignment: 35,
    appointment: "2022 (Biden)",
    philosophy: "Progressive Pragmatist",
    keyPositions: ["Civil Rights", "Government Authority", "Public Health"],
    recentVotes: [
      { case: "Students for Fair Admissions (2023)", vote: "Dissent", issue: "Affirmative Action" },
      { case: "Moore v. Harper (2023)", vote: "Concurrence", issue: "Election Law" },
      { case: "Biden v. Nebraska (2023)", vote: "Dissent", issue: "Student Loans" }
    ],
    strategy: "Focus on historical persecution of religious minorities",
    concerns: "Strong public health advocate, skeptical of exemptions",
    persuasionFactors: ["Historical persecution", "Minority rights", "Equal protection"],
    riskFactors: ["Very High - likely to prioritize public health"]
  }
]

export default function JusticesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Supreme Court Justice Profiles</h1>
          <p className="text-lg text-gray-600">
            Comprehensive analysis of each justice's judicial philosophy, voting patterns, and strategic considerations for constitutional cases.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">5-6</p>
                <p className="text-sm text-gray-600">Likely Conservative Votes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">2-3</p>
                <p className="text-sm text-gray-600">Swing/Moderate Votes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">Liberal Justices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Justice Cards */}
        <div className="space-y-6">
          {justiceData.map((justice, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{justice.name}</h3>
                    <p className="text-gray-600">{justice.appointment} • {justice.philosophy}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${
                        justice.alignment >= 80 ? 'bg-green-500' :
                        justice.alignment >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-lg font-bold text-gray-900">{justice.alignment}%</span>
                    </div>
                    <p className="text-sm text-gray-600">Alignment Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Positions</h4>
                      <div className="flex flex-wrap gap-2">
                        {justice.keyPositions.map((position, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {position}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Recent Key Votes</h4>
                      <div className="space-y-2">
                        {justice.recentVotes.map((vote, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{vote.case}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              vote.vote === 'Majority' ? 'bg-green-100 text-green-800' :
                              vote.vote === 'Concurrence' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {vote.vote}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Strategic Approach</h4>
                      <p className="text-sm text-gray-600">{justice.strategy}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Concerns</h4>
                      <p className="text-sm text-gray-600">{justice.concerns}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Persuasion Factors</h4>
                      <div className="flex flex-wrap gap-2">
                        {justice.persuasionFactors.map((factor, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Risk Assessment</h4>
                      <div className="flex flex-wrap gap-2">
                        {justice.riskFactors.map((risk, i) => (
                          <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            {risk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 