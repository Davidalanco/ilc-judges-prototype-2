'use client';

import { ChevronLeft, Users, Scale, Target, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

// Real case data extracted from the attorney transcript
const caseData = {
  title: "Miller v. New York State Department of Health",
  subtitle: "Amish Religious Exemption from Vaccination Requirements",
  status: "Second Circuit Appeal - Cert Petition Pending",
  uploadedFile: "attorney_strategy_discussion.mp3",
  duration: "17 minutes",
  participants: ["Lead Attorney", "Constitutional Law Expert", "Religious Liberty Specialist", "Strategy Advisor"],
  
  // AI-extracted legal issues from the transcript
  legalIssues: [
    {
      issue: "Employment Division v. Smith Standard",
      description: "Whether neutral and generally applicable laws should receive strict scrutiny when they burden religious exercise",
      confidence: 92,
      priority: "Critical",
      keyQuote: "Some Supreme Court justices have previously voiced their opinion that the Smith decision should be overruled"
    },
    {
      issue: "Religious Targeting vs. Neutral Application",
      description: "Whether removing religious exemptions while maintaining medical exemptions constitutes targeting religion",
      confidence: 88,
      priority: "High",
      keyQuote: "They specifically took away the religious exemption... they ended up targeting religion"
    },
    {
      issue: "Strict Scrutiny Application",
      description: "Whether the law fails strict scrutiny due to availability of medical but not religious exemptions",
      confidence: 85,
      priority: "High",
      keyQuote: "They will give an exemption for medical, but they won't give it for religion. That means it's not generally applicable"
    },
    {
      issue: "Bodily Autonomy Intersection",
      description: "Whether forced vaccination implicates bodily autonomy rights that could appeal to liberal justices",
      confidence: 78,
      priority: "Medium",
      keyQuote: "They're trying to put something into their body so there may be bodily autonomy arguments that the left would be sympathetic to"
    }
  ],

  // AI analysis of each Supreme Court Justice
  justiceAnalysis: [
    {
      name: "Justice Alito",
      alignment: 95,
      reasoning: "Strong supporter of religious liberty, likely to view Smith as problematic precedent",
      strategy: "Emphasize historical religious persecution and need for constitutional protection",
      concerns: "None identified - natural ally",
      keyFactors: ["Religious liberty champion", "Originalist approach", "Anti-Smith sentiment"]
    },
    {
      name: "Justice Gorsuch", 
      alignment: 93,
      reasoning: "Has explicitly criticized Smith in previous opinions, textualist approach favors religious liberty",
      strategy: "Focus on textual meaning of Free Exercise Clause and historical understanding",
      concerns: "None identified - strong ally",
      keyFactors: ["Explicit Smith critic", "Textualist methodology", "Religious liberty record"]
    },
    {
      name: "Justice Thomas",
      alignment: 90,
      reasoning: "Originalist approach and strong religious liberty record, likely Smith opponent",
      strategy: "Historical analysis of Founding Era religious liberty protections",
      concerns: "None identified - reliable vote",
      keyFactors: ["Originalist approach", "Religious liberty supporter", "Anti-Smith inclination"]
    },
    {
      name: "Justice Barrett",
      alignment: 75,
      reasoning: "Religious liberty supporter but may prefer narrower grounds than overturning Smith",
      strategy: "Emphasize narrow application to insular religious communities",
      concerns: "May prefer incremental approach over broad Smith reversal",
      keyFactors: ["Religious liberty background", "Judicial minimalism", "Institutional concerns"]
    },
    {
      name: "Justice Kavanaugh",
      alignment: 70,
      reasoning: "Moderate conservative, may support religious liberty but concerned about broad implications",
      strategy: "Focus on limited impact to insular Amish communities",
      concerns: "Worried about broader civil rights implications",
      keyFactors: ["Moderate approach", "Institutional stability", "Limited scope preference"]
    },
    {
      name: "Chief Justice Roberts",
      alignment: 65,
      reasoning: "Institutional concerns may outweigh religious liberty sympathies",
      strategy: "Emphasize judicial minimalism and narrow ruling possibility",
      concerns: "Institutional impact of overturning major precedent",
      keyFactors: ["Institutional concerns", "Judicial minimalism", "Precedent respect"]
    },
    {
      name: "Justice Kagan",
      alignment: 45,
      reasoning: "Liberal justice but may be sympathetic to bodily autonomy and minority rights arguments",
      strategy: "Frame as minority rights and bodily autonomy issue",
      concerns: "Generally supports government authority, skeptical of religious exemptions",
      keyFactors: ["Minority rights", "Bodily autonomy", "Government authority"]
    },
    {
      name: "Justice Sotomayor",
      alignment: 40,
      reasoning: "Strong government authority supporter, but may consider minority rights angle",
      strategy: "Emphasize protection of vulnerable minority communities",
      concerns: "Public health priorities, skeptical of religious exemptions",
      keyFactors: ["Public health focus", "Government authority", "Minority protection"]
    },
    {
      name: "Justice Jackson",
      alignment: 35,
      reasoning: "Likely to prioritize public health over religious exemptions",
      strategy: "Focus on historical persecution of religious minorities",
      concerns: "Strong public health advocate, skeptical of religious exemptions",
      keyFactors: ["Public health priority", "Government authority", "Civil rights focus"]
    }
  ],

  // Strategic recommendations extracted from attorney discussion
  strategicRecommendations: [
    {
      category: "Historical Framing",
      title: "Pennsylvania Religious Liberty Tradition",
      description: "Leverage Pennsylvania's unique history as birthplace of American religious liberty",
      rationale: "Attorneys noted Pennsylvania's colonial experience with religious accommodation led to 'unintended consequence of peace and prosperity'",
      implementation: "Brief should extensively cite Pennsylvania's colonial religious liberty experiments and their positive outcomes",
      targetAudience: "All justices - appeals to originalist and pragmatic concerns"
    },
    {
      category: "Sympathetic Plaintiffs",
      title: "Amish Community Characteristics",
      description: "Emphasize insular, peaceful nature of Amish communities",
      rationale: "Attorneys highlighted Amish are 'contained,' 'keep to themselves,' and pose minimal public risk",
      implementation: "Detailed description of Amish insularity, self-sufficiency, and minimal public interaction",
      targetAudience: "Moderate conservatives concerned about broader implications"
    },
    {
      category: "Constitutional Principle",
      title: "Abstention vs. Accommodation Distinction",
      description: "Distinguish between asking government to do something vs. asking to be left alone",
      rationale: "Attorneys noted abstention claims are more sympathetic than accommodation demands",
      implementation: "Frame as simple request to abstain from government-mandated action, not special accommodation",
      targetAudience: "Liberal justices concerned about government establishment"
    },
    {
      category: "Cross-Ideological Appeal",
      title: "Bodily Autonomy Arguments",
      description: "Include bodily autonomy framing to appeal to liberal justices",
      rationale: "Attorneys identified this as potential bridge to liberal justices",
      implementation: "Supplement religious liberty arguments with bodily autonomy principles",
      targetAudience: "Liberal justices (Kagan, Sotomayor, Jackson)"
    },
    {
      category: "Judicial Minimalism",
      title: "Narrow Ruling Pathway",
      description: "Provide Court with narrow grounds for ruling without overturning Smith",
      rationale: "Attorneys acknowledged Court could apply strict scrutiny without Smith reversal",
      implementation: "Argue law is not generally applicable due to medical exemption availability",
      targetAudience: "Chief Justice Roberts and Justice Barrett"
    }
  ],

  // Risk factors identified in attorney discussion
  riskFactors: [
    {
      risk: "Vaccine Politics",
      level: "High",
      description: "Political sensitivity around vaccines could make justices reluctant to take case",
      mitigation: "Emphasize this involves traditional childhood vaccines, not COVID vaccines",
      quote: "Because this case deals with vaccines... there may be less desire to deal with this issue"
    },
    {
      risk: "Broad Civil Rights Implications", 
      level: "Medium",
      description: "Three justices may worry about impact on broader civil rights enforcement",
      mitigation: "Emphasize narrow application to insular religious communities",
      quote: "The biggest deterrent from taking the case... the broader civil rights area"
    },
    {
      risk: "Public Health Concerns",
      level: "Medium", 
      description: "Liberal justices may prioritize public health over religious liberty",
      mitigation: "Argue limited public health impact from insular Amish communities",
      quote: "The more liberal judges might not want to deal with this case"
    }
  ],

  // Opposition arguments predicted by attorneys
  oppositionArguments: [
    {
      argument: "Public Health Emergency Powers",
      strength: "Strong",
      description: "State will argue broad authority to protect public health through vaccination requirements",
      counterStrategy: "Distinguish from true emergencies; emphasize targeted nature of religious exemption removal"
    },
    {
      argument: "Equal Treatment Principle",
      strength: "Medium",
      description: "State will argue religious exemptions provide unfair advantage over secular objectors",
      counterStrategy: "Emphasize constitutional special status of religious liberty; distinguish from secular preferences"
    },
    {
      argument: "Slippery Slope Concerns",
      strength: "Medium",
      description: "State will argue religious exemptions could undermine all public health measures",
      counterStrategy: "Emphasize narrow application to insular communities with minimal public interaction"
    }
  ]
}

export default function AnalysisPage({ params }: { params: { caseId: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Case Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{caseData.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{caseData.subtitle}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {caseData.duration}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {caseData.participants.length} participants
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {caseData.status}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Analyzed File</h3>
            <p className="text-sm text-gray-600">{caseData.uploadedFile}</p>
          </div>
        </div>

        {/* Legal Issues Extracted */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Scale className="h-5 w-5 mr-2" />
            Legal Issues Identified
          </h2>
          <div className="space-y-4">
            {caseData.legalIssues.map((issue, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{issue.issue}</h3>
                    <p className="text-gray-600 mt-1">{issue.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{issue.confidence}% confidence</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      issue.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      issue.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {issue.priority}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-700 italic">"{issue.keyQuote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Justice Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Supreme Court Justice Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseData.justiceAnalysis.map((justice, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{justice.name}</h3>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      justice.alignment >= 80 ? 'bg-green-500' :
                      justice.alignment >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">{justice.alignment}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{justice.reasoning}</p>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-xs font-medium text-gray-900 uppercase tracking-wide">Strategy</h4>
                    <p className="text-sm text-gray-600">{justice.strategy}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-900 uppercase tracking-wide">Concerns</h4>
                    <p className="text-sm text-gray-600">{justice.concerns}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Strategic Recommendations
          </h2>
          <div className="space-y-4">
            {caseData.strategicRecommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        {rec.category}
                      </span>
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-2">{rec.description}</p>
                    <p className="text-sm text-gray-500 mb-2"><strong>Rationale:</strong> {rec.rationale}</p>
                    <p className="text-sm text-gray-500"><strong>Target:</strong> {rec.targetAudience}</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded p-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Implementation</h4>
                  <p className="text-sm text-blue-800">{rec.implementation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Risk Factors
          </h2>
          <div className="space-y-4">
            {caseData.riskFactors.map((risk, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-gray-900 mr-2">{risk.risk}</h3>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        risk.level === 'High' ? 'bg-red-100 text-red-800' :
                        risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {risk.level} Risk
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{risk.description}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm text-gray-700 italic">"{risk.quote}"</p>
                </div>
                <div className="bg-green-50 rounded p-3">
                  <h4 className="text-sm font-medium text-green-900 mb-1">Mitigation Strategy</h4>
                  <p className="text-sm text-green-800">{risk.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opposition Arguments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            Predicted Opposition Arguments
          </h2>
          <div className="space-y-4">
            {caseData.oppositionArguments.map((arg, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-gray-900 mr-2">{arg.argument}</h3>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        arg.strength === 'Strong' ? 'bg-red-100 text-red-800' :
                        arg.strength === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {arg.strength}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{arg.description}</p>
                  </div>
                </div>
                <div className="bg-blue-50 rounded p-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Counter-Strategy</h4>
                  <p className="text-sm text-blue-800">{arg.counterStrategy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 