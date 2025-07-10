'use client';

import { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Users, 
  CheckCircle, 
  Brain, 
  BookOpen, 
  Heart, 
  Target, 
  Shield, 
  PenTool, 
  Eye,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  UserCheck,
  Gavel,
  History,
  MessageSquare,
  Zap,
  Search,
  Edit3,
  RefreshCw,
  XCircle,
  Scale,
  AlertTriangle
} from 'lucide-react';

export default function WorkflowPage() {
  const [currentStep, setCurrentStep] = useState(10); // All steps available
  const [completedSteps, setCompletedSteps] = useState<number[]>([1,2,3,4,5,6,7,8,9,10]); // All steps completed
  const [expandedStep, setExpandedStep] = useState<number | null>(null); // None expanded by default

  const steps = [
    {
      id: 1,
      title: "Strategic Discussion Audio Upload",
      icon: Upload,
      color: "bg-blue-500",
      description: "Upload audio recording of legal team's strategy discussion about the case, or record a new session directly in the app.",
      details: "The AI uses 11Labs transcription with advanced speaker identification to capture the collaborative thinking process, automatically identifying different team members and extracting the core strategic framework, potential arguments, and the team's approach to the case.",
      mockData: {
        file: "attorney_strategy_discussion_miller_case.mp3",
        duration: "17:32",
        speakers: [
          { name: "Lead Attorney", segments: 87, confidence: 96 },
          { name: "Constitutional Law Expert", segments: 23, confidence: 94 },
          { name: "Religious Liberty Specialist", segments: 15, confidence: 92 },
          { name: "Strategy Advisor", segments: 31, confidence: 89 }
        ],
        transcriptionQuality: 98,
        keyTopics: ["Smith Decision", "Religious Targeting", "Amish Community", "Bodily Autonomy", "Historical Context"],
        emotionalTone: "Collaborative, Strategic, Optimistic",
        status: "Transcription Complete - 599 segments processed"
      }
    },
    {
      id: 2,
      title: "Case Information Input",
      icon: FileText,
      color: "bg-green-500",
      description: "Provide basic case details including parties, court level, legal issues, and constitutional questions.",
      details: "Users provide case details including the parties, court level, legal issues involved, and the specific constitutional question being addressed. They'll also indicate whether they're seeking cert or writing for a case already granted review, and specify their client/amicus party.",
      mockData: {
        caseName: "Miller v. New York State Department of Health",
        parties: "Amish families and schools vs. New York State Department of Health",
        courtLevel: "U.S. Supreme Court (Cert Petition from Second Circuit)",
        currentStatus: "Lost at Second Circuit - seeking certiorari",
        constitutionalQuestion: "Whether Employment Division v. Smith should be overruled when neutral and generally applicable laws burden sincere religious exercise",
        clientType: "First Liberty Institute (Amicus Brief)",
        jurisdiction: "New York State",
        penalties: "$118,000 in fines against Amish schools",
        precedentTarget: "Employment Division v. Smith (1990)"
      }
    },
    {
      id: 3,
      title: "Judge Profile Analysis",
      icon: Users,
      color: "bg-purple-500",
      description: "AI automatically analyzes psychological profiles and judicial philosophies of all relevant judges.",
      details: "For Supreme Court cases, this includes detailed analysis of all nine justices' previous opinions, speeches, and decision patterns, identifying their values, preferred legal frameworks, and potential pressure points for persuasion.",
      mockData: {
        justices: [
          { 
            name: "Alito", 
            alignment: 95, 
            keyFactors: ["Religious liberty champion", "Anti-Smith sentiment", "Traditional values"],
            strategy: "Emphasize historical religious persecution",
            confidence: "Natural ally - minimal persuasion needed"
          },
          { 
            name: "Gorsuch", 
            alignment: 93, 
            keyFactors: ["Explicit Smith critic", "Textualist approach", "Individual liberty"],
            strategy: "Focus on textual meaning of Free Exercise Clause",
            confidence: "Strong ally - has criticized Smith in opinions"
          },
          { 
            name: "Thomas", 
            alignment: 90, 
            keyFactors: ["Originalism", "Religious liberty", "Anti-Smith inclination"],
            strategy: "Historical analysis of Founding Era protections",
            confidence: "Reliable vote - originalist approach favors religious liberty"
          },
          { 
            name: "Barrett", 
            alignment: 75, 
            keyFactors: ["Religious liberty background", "Judicial minimalism", "Institutional concerns"],
            strategy: "Emphasize narrow application to insular communities",
            confidence: "Likely ally but may prefer incremental approach"
          },
          { 
            name: "Kavanaugh", 
            alignment: 70, 
            keyFactors: ["Moderate conservatism", "Institutional stability", "Precedent respect"],
            strategy: "Focus on limited impact to Amish communities",
            confidence: "Persuadable - concerned about broader implications"
          },
          { 
            name: "Roberts", 
            alignment: 65, 
            keyFactors: ["Institutional concerns", "Judicial minimalism", "Narrow rulings"],
            strategy: "Provide pathway for narrow ruling without Smith reversal",
            confidence: "Swing vote - institutional concerns may outweigh religious liberty"
          }
        ],
        liberalJustices: [
          {
            name: "Kagan",
            alignment: 45,
            strategy: "Frame as minority rights and bodily autonomy issue",
            keyFactors: ["Minority rights", "Bodily autonomy arguments", "Government authority"]
          },
          {
            name: "Sotomayor", 
            alignment: 40,
            strategy: "Emphasize protection of vulnerable minority communities",
            keyFactors: ["Public health focus", "Minority protection", "Government authority"]
          },
          {
            name: "Jackson",
            alignment: 35,
            strategy: "Focus on historical persecution of religious minorities",
            keyFactors: ["Public health priority", "Civil rights focus", "Government skepticism"]
          }
        ]
      }
    },
    {
      id: 4,
      title: "Vehicle Assessment",
      icon: Gavel,
      color: "bg-yellow-500",
      description: "Review AI-generated analysis of whether this case provides the 'perfect vehicle' the court is seeking.",
      details: "The system evaluates the case's potential to overturn precedent (like Employment Division v. Smith), its optics for public perception, and whether it gives justices the tools they need to explain their decision to the broader legal community.",
      mockData: {
        vehicleScore: 89,
        precedentImpact: "High - Multiple justices have criticized Smith",
        publicOptics: "Favorable - Sympathetic Amish plaintiffs, contained community",
        judicialTools: "Strong - Clear constitutional principles and historical precedent",
        politicalRisks: "Medium - Vaccine politics but not COVID-related",
        strengths: [
          "Sympathetic plaintiffs (Amish community)",
          "Clear constitutional violation (religious targeting)",
          "Insular community with minimal public impact",
          "Strong historical precedent for religious accommodation"
        ],
        weaknesses: [
          "Vaccine politics may concern some justices",
          "Potential broader civil rights implications",
          "Public health arguments from opposition"
        ],
        alternativePathways: [
          "Apply strict scrutiny without overturning Smith",
          "Find law not generally applicable due to medical exemptions",
          "Narrow ruling limited to insular religious communities"
        ]
      }
    },
    {
      id: 5,
      title: "Historical Context Research",
      icon: History,
      color: "bg-indigo-500",
      description: "AI conducts comprehensive research into founding documents, historical precedents, and relevant stories.",
      details: "The AI researches founding documents, historical precedents, and relevant stories from American history that support the legal arguments. Users can review and select from historical examples like conscientious objection to warfare, religious persecution in colonial times, or other foundational principles.",
      mockData: {
        foundingDocs: [
          "Madison's Memorial and Remonstrance Against Religious Assessments (1785)",
          "Pennsylvania Charter of Privileges (1701)",
          "First Amendment debates in Congress (1789)",
          "Virginia Statute for Religious Freedom (1786)"
        ],
        historicalCases: [
          "Wisconsin v. Yoder (1972) - Amish education rights",
          "Pierce v. Society of Sisters (1925) - Parental rights",
          "Sherbert v. Verner (1963) - Religious accommodation",
          "West Virginia v. Barnette (1943) - Compelled speech/action"
        ],
        colonialExamples: [
          "Quaker and Mennonite oath exemptions in Pennsylvania",
          "Conscientious objection to military service",
          "Religious tax exemptions for dissenting churches",
          "Pennsylvania's 'holy experiment' in religious tolerance"
        ],
        relevantQuotes: [
          "Madison: 'Homage owed to two sovereigns' - civil and divine",
          "Penn: 'No people can be truly happy if abridged of freedom of conscience'",
          "Jefferson: 'Wall of separation between church and state'"
        ],
        modernParallels: [
          "RFRA passage (1993) - bipartisan support after Smith",
          "Amish exemptions from Social Security",
          "Religious exemptions in military service"
        ]
      }
    },
    {
      id: 6,
      title: "Storytelling Integration",
      icon: Heart,
      color: "bg-pink-500",
      description: "Select specific human stories and concrete examples that make legal arguments emotionally resonant.",
      details: "The user selects specific human stories and concrete examples that will make the legal arguments emotionally resonant. This includes detailed narratives about the actual people affected (specific Amish families, individual circumstances) while connecting these stories to broader constitutional principles.",
      mockData: {
        primaryStories: [
          {
            family: "Miller Family",
            details: "Five children, third-generation farmers in rural New York, face $23,600 in fines for keeping children in Amish school",
            impact: "Cannot afford fines, may lose farm that's been in family for 60 years",
            religiousConnection: "Believe vaccines interfere with God's natural immunity design"
          },
          {
            community: "Swartzentruber Amish District",
            details: "127 families, completely self-sufficient community on 2,400 acres",
            impact: "School serves only Amish children, no contact with public school system",
            religiousConnection: "Traditional healing practices based on herbal medicine and prayer"
          },
          {
            precedent: "Wisconsin v. Yoder Parallel",
            details: "Same community that won education rights in 1972 Supreme Court case",
            impact: "Government again threatening core religious practice essential to community survival",
            religiousConnection: "Education and health practices intertwined with religious beliefs"
          }
        ],
        constitutionalConnections: [
          "Free Exercise of Religion - core religious practice",
          "Parental Rights - family autonomy in health decisions", 
          "Bodily Autonomy - forced medical intervention",
          "Equal Protection - religious exemptions removed while medical exemptions remain",
          "Due Process - fundamental rights require strict scrutiny"
        ],
        emotionalFraming: [
          "Peaceful community seeking only to be left alone",
          "Government targeting religion while accommodating medical needs",
          "Families facing financial ruin for following religious convictions",
          "Children's education threatened by government overreach"
        ]
      }
    },
    {
      id: 7,
      title: "Multi-Perspective Argument Crafting",
      icon: Target,
      color: "bg-red-500",
      description: "AI generates arguments framed to appeal across ideological lines.",
      details: "The AI generates arguments framed to appeal across ideological lines, ensuring the brief doesn't 'scare' any justices by presenting religious liberty as protection for all minority viewpoints rather than just conservative Christian interests.",
      mockData: {
        conservativeFraming: {
          title: "Traditional Religious Liberty and Constitutional Text",
          arguments: [
            "Original meaning of Free Exercise Clause protects religious practice",
            "Historical tradition of religious accommodation dating to colonial era",
            "Parental rights to direct children's upbringing and education",
            "Smith decision inconsistent with constitutional text and history"
          ],
          targetJustices: ["Thomas", "Alito", "Gorsuch", "Barrett"]
        },
        liberalFraming: {
          title: "Minority Rights Protection and Bodily Autonomy",
          arguments: [
            "Protection of vulnerable religious minority from government targeting",
            "Bodily autonomy and right to refuse unwanted medical intervention",
            "Equal protection - medical exemptions prove religious targeting",
            "Preventing government coercion of deeply held convictions"
          ],
          targetJustices: ["Kagan", "Sotomayor", "Jackson"]
        },
        moderateFraming: {
          title: "Narrow Constitutional Principle and Judicial Restraint",
          arguments: [
            "Limited ruling affecting only insular religious communities",
            "Law not generally applicable due to medical exemption availability",
            "Strict scrutiny without necessarily overturning Smith",
            "Minimal public health impact from contained community"
          ],
          targetJustices: ["Roberts", "Kavanaugh", "Barrett"]
        },
        unifyingThemes: [
          "Religious liberty protects all faiths, not just majority religions",
          "Constitutional principles transcend political divisions",
          "Limited government interference in private religious practice",
          "Accommodation strengthens rather than weakens constitutional system"
        ]
      }
    },
    {
      id: 8,
      title: "Citation and Precedent Verification",
      icon: Shield,
      color: "bg-teal-500",
      description: "System automatically verifies all citations and cross-references legal precedents.",
      details: "The system automatically verifies all citations, cross-references legal precedents, and ensures accuracy of quotes and case references. Multiple AI models cross-check each other to prevent hallucinations and false citations.",
      mockData: {
        citationsChecked: 247,
        precedentsVerified: 89,
        quotesValidated: 156,
        accuracyScore: 99.7,
        keyPrecedents: [
          {
            case: "Employment Division v. Smith (1990)",
            citation: "494 U.S. 872",
            status: "Verified - Target for potential reversal",
            relevance: "Central precedent limiting religious exemptions"
          },
          {
            case: "Wisconsin v. Yoder (1972)", 
            citation: "406 U.S. 205",
            status: "Verified - Strong supporting precedent",
            relevance: "Amish religious education rights protection"
          },
          {
            case: "Sherbert v. Verner (1963)",
            citation: "374 U.S. 398", 
            status: "Verified - Pre-Smith strict scrutiny standard",
            relevance: "Religious accommodation requirement"
          },
          {
            case: "Church of Lukumi Babalu Aye v. Hialeah (1993)",
            citation: "508 U.S. 520",
            status: "Verified - Religious targeting precedent",
            relevance: "Laws targeting religion require strict scrutiny"
          }
        ],
        historicalSources: [
          {
            source: "Madison's Memorial and Remonstrance (1785)",
            verification: "Verified - Virginia archives",
            relevance: "Founding Era religious liberty principles"
          },
          {
            source: "Pennsylvania Charter of Privileges (1701)",
            verification: "Verified - Historical Society of Pennsylvania", 
            relevance: "Colonial religious accommodation precedent"
          }
        ],
        potentialIssues: [
          "One citation format inconsistency corrected",
          "Two quote attributions double-checked and verified",
          "Three case dates cross-referenced with official reporters"
        ]
      }
    },
    {
      id: 9,
      title: "Brief Structure and Drafting",
      icon: PenTool,
      color: "bg-orange-500",
      description: "AI generates the full brief structure incorporating all research, stories, and strategic elements.",
      details: "The AI generates the full brief structure with introduction, argument sections, and conclusion, incorporating all the research, stories, and strategic elements identified in previous steps. Users can edit and refine the draft while maintaining the strategic framework.",
      mockData: {
        sections: [
          {
            title: "Interest of Amicus Curiae",
            content: "First Liberty Institute's expertise in religious liberty and interest in protecting constitutional rights",
            wordCount: 245,
            persuasionScore: 85
          },
          {
            title: "Summary of Argument", 
            content: "Constitutional principles and broader implications beyond this specific case",
            wordCount: 680,
            persuasionScore: 91
          },
          {
            title: "Argument I: Employment Division v. Smith Undermines Constitutional Text and History",
            content: "Historical analysis showing Free Exercise Clause requires accommodation with case facts woven throughout",
            wordCount: 2400,
            persuasionScore: 93
          },
          {
            title: "Argument II: New York's Selective Exemption System Violates Neutrality and General Applicability",
            content: "Analysis of medical vs. religious exemptions with specific case data and broader implications",
            wordCount: 2100,
            persuasionScore: 96
          },
          {
            title: "Argument III: The Measles Outbreak Provides No Justification for Religious Targeting",
            content: "Public health analysis with actual outbreak data and insular community considerations",
            wordCount: 1800,
            persuasionScore: 89
          },
          {
            title: "Conclusion",
            content: "Recommendation for reversal and remand with broader constitutional implications",
            wordCount: 327,
            persuasionScore: 88
          }
        ],
        totalWordCount: 8352,
        overallPersuasionScore: 90,
        justiceSpecificScores: {
          "Thomas": 96,
          "Alito": 94, 
          "Gorsuch": 93,
          "Barrett": 85,
          "Kavanaugh": 78,
          "Roberts": 72,
          "Kagan": 58,
          "Sotomayor": 54,
          "Jackson": 49
        },
        strengthAreas: [
          "Historical analysis exceptionally strong",
          "Factual narrative compelling and sympathetic", 
          "Legal arguments well-grounded in precedent",
          "Cross-ideological appeal effectively developed"
        ],
        improvementAreas: [
          "Could strengthen public health response",
          "Liberal justice appeal needs expansion",
          "Alternative narrow ruling pathway needs development"
        ]
      }
    },
    {
      id: 10,
      title: "Final Review and Optimization",
      icon: Eye,
      color: "bg-gray-500",
      description: "Conduct final review with AI assistance to ensure consistent messaging and effective balance.",
      details: "Users conduct final review with AI assistance to ensure the brief maintains consistent messaging, doesn't contain contradictions, and effectively balances legal argumentation with persuasive storytelling. The system provides a final assessment of how well the brief addresses each justice's likely concerns and interests.",
      mockData: {
        consistencyScore: 96,
        contradictions: 0,
        messagingAlignment: 94,
        factualAccuracy: 99,
        justiceAlignment: {
          "Roberts": 74,
          "Thomas": 97,
          "Alito": 95,
          "Gorsuch": 94,
          "Kavanaugh": 79,
          "Barrett": 86,
          "Kagan": 61,
          "Sotomayor": 57,
          "Jackson": 52
        },
        finalRecommendations: [
          {
            category: "Strengthen Liberal Appeal",
            suggestion: "Expand bodily autonomy discussion in Section II",
            impact: "Could increase Kagan/Sotomayor alignment by 8-12 points"
          },
          {
            category: "Address Institutional Concerns", 
            suggestion: "Add paragraph on narrow ruling pathway in Conclusion",
            impact: "Could increase Roberts alignment by 6-10 points"
          },
          {
            category: "Enhance Historical Analysis",
            suggestion: "Include additional Pennsylvania colonial examples",
            impact: "Reinforces strongest argument for conservative justices"
          }
        ],
        overallAssessment: {
          winProbability: 73,
          certProbability: 85,
          riskFactors: [
            "Vaccine politics may concern swing justices",
            "Liberal justices likely to prioritize public health"
          ],
          strengthFactors: [
            "Sympathetic plaintiffs and compelling narrative",
            "Strong historical and constitutional arguments",
            "Multiple pathways for Court to rule favorably"
          ]
        }
      }
    }
  ];

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    if (stepId < currentStep) return 'available';
    return 'locked';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'current': return 'bg-blue-500';
      case 'available': return 'bg-gray-300';
      case 'locked': return 'bg-gray-200';
      default: return 'bg-gray-200';
    }
  };

  const handleStepClick = (stepId: number) => {
    // All steps are always available
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId === currentStep && stepId < 10) {
      setCurrentStep(stepId + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Supreme Court Brief Workflow</h1>
          <p className="text-lg text-gray-600">
            Complete 10-step process to transform your legal strategy into a winning Supreme Court brief
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Analysis Complete</h2>
            <div className="text-sm text-green-600 font-medium">
              All 10 steps processed • Ready for review
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-green-500 text-white">
                  <CheckCircle className="w-4 h-4" />
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-1 mx-1 bg-green-500" />
                )}
              </div>
            ))}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-full" />
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Click any step below to explore the detailed analysis and results
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const status = getStepStatus(step.id);
            const isExpanded = expandedStep === step.id;
            
            return (
              <div key={step.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div 
                  className={`p-6 cursor-pointer transition-colors ${
                    status === 'current' ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleStepClick(step.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {completedSteps.includes(step.id) && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                      {status === 'current' && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t bg-gray-50">
                    <div className="pt-6">
                      <p className="text-gray-700 mb-6">{step.details}</p>
                      
                      {/* Step-specific UI components */}
                      {step.id === 1 && (
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Audio Upload & Processing</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm text-gray-600">Drop audio file or click to upload</p>
                                </div>
                                <div className="mt-4 text-center">
                                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    {step.mockData.status}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Play className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-medium">{step.mockData.file}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Volume2 className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">{step.mockData.duration}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <strong>Transcription Quality:</strong> {step.mockData.transcriptionQuality}%
                                </div>
                                <div className="text-sm text-gray-600">
                                  <strong>Emotional Tone:</strong> {step.mockData.emotionalTone}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h5 className="font-medium mb-2">Speakers Identified</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {step.mockData.speakers.map((speaker, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <UserCheck className="w-4 h-4 text-green-500" />
                                      <span className="text-sm font-medium">{speaker.name}</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-gray-600">{speaker.segments} segments</div>
                                      <div className="text-xs text-green-600">{speaker.confidence}% confidence</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="mt-4">
                              <h5 className="font-medium mb-2">Key Topics Extracted</h5>
                              <div className="flex flex-wrap gap-2">
                                {step.mockData.keyTopics.map((topic, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 2 && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Case Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Case Name</label>
                              <input 
                                type="text" 
                                value={step.mockData.caseName}
                                className="w-full p-2 border rounded-md"
                                readOnly
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Court Level</label>
                              <input 
                                type="text" 
                                value={step.mockData.courtLevel}
                                className="w-full p-2 border rounded-md"
                                readOnly
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Constitutional Question</label>
                              <textarea 
                                value={step.mockData.constitutionalQuestion}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 3 && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Conservative Justice Analysis</h4>
                          <div className="space-y-3 mb-6">
                            {step.mockData.justices.map((justice, idx) => (
                              <div key={idx} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <span className="font-medium text-lg">Justice {justice.name}</span>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {justice.keyFactors.join(" • ")}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-2xl font-bold ${
                                      justice.alignment >= 90 ? 'text-green-600' :
                                      justice.alignment >= 70 ? 'text-yellow-600' :
                                      'text-red-600'
                                    }`}>{justice.alignment}%</div>
                                    <div className="text-xs text-gray-500">Alignment</div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h6 className="text-sm font-medium text-gray-700 mb-1">Strategy</h6>
                                    <p className="text-sm text-gray-600">{justice.strategy}</p>
                                  </div>
                                  <div>
                                    <h6 className="text-sm font-medium text-gray-700 mb-1">Assessment</h6>
                                    <p className="text-sm text-gray-600">{justice.confidence}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <h4 className="font-semibold mb-3">Liberal Justice Analysis</h4>
                          <div className="space-y-3">
                            {step.mockData.liberalJustices.map((justice, idx) => (
                              <div key={idx} className="border rounded-lg p-4 bg-blue-50">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <span className="font-medium text-lg">Justice {justice.name}</span>
                                    <div className="text-sm text-blue-700 mt-1">
                                      {justice.keyFactors.join(" • ")}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">{justice.alignment}%</div>
                                    <div className="text-xs text-gray-500">Alignment</div>
                                  </div>
                                </div>
                                <div>
                                  <h6 className="text-sm font-medium text-blue-800 mb-1">Strategy</h6>
                                  <p className="text-sm text-blue-700">{justice.strategy}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.id === 4 && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Vehicle Assessment Analysis</h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <div className="text-3xl font-bold text-green-600">{step.mockData.vehicleScore}%</div>
                              <div className="text-sm text-gray-600">Overall Score</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <div className="text-sm font-medium text-blue-800">Precedent Impact</div>
                              <div className="text-sm text-blue-700">{step.mockData.precedentImpact}</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                              <div className="text-sm font-medium text-purple-800">Public Optics</div>
                              <div className="text-sm text-purple-700">{step.mockData.publicOptics}</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                              <div className="text-sm font-medium text-yellow-800">Political Risk</div>
                              <div className="text-sm text-yellow-700">{step.mockData.politicalRisks}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h5 className="font-medium mb-3 text-green-800">Strengths</h5>
                              <ul className="space-y-2">
                                {step.mockData.strengths.map((strength, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-3 text-red-800">Weaknesses</h5>
                              <ul className="space-y-2">
                                {step.mockData.weaknesses.map((weakness, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{weakness}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-3 text-blue-800">Alternative Pathways</h5>
                              <ul className="space-y-2">
                                {step.mockData.alternativePathways.map((pathway, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{pathway}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 5 && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Historical Research Results</h4>
                          <div className="space-y-6">
                            <div>
                              <h5 className="font-medium mb-3 text-blue-800">Founding Documents</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {step.mockData.foundingDocs.map((doc, idx) => (
                                  <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-blue-800">{doc}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium mb-3 text-purple-800">Historical Cases</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {step.mockData.historicalCases.map((case_, idx) => (
                                  <div key={idx} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                                    <Gavel className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-purple-800">{case_}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium mb-3 text-green-800">Colonial Examples</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {step.mockData.colonialExamples.map((example, idx) => (
                                  <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                                    <MessageSquare className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-green-800">{example}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium mb-3 text-yellow-800">Key Quotes</h5>
                              <div className="space-y-3">
                                {step.mockData.relevantQuotes.map((quote, idx) => (
                                  <div key={idx} className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                                    <p className="text-sm italic text-yellow-800">"{quote}"</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium mb-3 text-gray-800">Modern Parallels</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {step.mockData.modernParallels.map((parallel, idx) => (
                                  <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <History className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-800">{parallel}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 6 && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Human Stories & Narrative Framework</h4>
                          <div className="space-y-6">
                            <div>
                              <h5 className="font-medium mb-3 text-pink-800">Primary Stories</h5>
                              <div className="space-y-4">
                                {step.mockData.primaryStories.map((story, idx) => (
                                  <div key={idx} className="border rounded-lg p-4 bg-pink-50">
                                    <div className="flex items-start space-x-3 mb-3">
                                      <Heart className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1">
                                        <h6 className="font-medium text-pink-800">{story.family || story.community || story.precedent}</h6>
                                        <p className="text-sm text-pink-700 mt-1">{story.details}</p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h6 className="text-xs font-medium text-pink-700 mb-1">Impact</h6>
                                        <p className="text-xs text-pink-600">{story.impact}</p>
                                      </div>
                                      <div>
                                        <h6 className="text-xs font-medium text-pink-700 mb-1">Religious Connection</h6>
                                        <p className="text-xs text-pink-600">{story.religiousConnection}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium mb-3 text-blue-800">Constitutional Connections</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {step.mockData.constitutionalConnections.map((connection, idx) => (
                                  <div key={idx} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <Scale className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-blue-800">{connection}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium mb-3 text-purple-800">Emotional Framing</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {step.mockData.emotionalFraming.map((frame, idx) => (
                                  <div key={idx} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                                    <p className="text-sm text-purple-800">{frame}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 7 && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Multi-Perspective Arguments</h4>
                          <div className="space-y-4">
                            <div className="p-3 bg-red-50 rounded-lg">
                              <h5 className="font-medium text-red-800 mb-2">Conservative Framing</h5>
                              <p className="text-sm text-red-700">{step.mockData.conservativeFraming.title}</p>
                              <ul className="mt-2 text-sm text-red-700">
                                {step.mockData.conservativeFraming.arguments.map((arg, idx) => (
                                  <li key={idx} className="list-disc ml-4">{arg}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <h5 className="font-medium text-blue-800 mb-2">Liberal Framing</h5>
                              <p className="text-sm text-blue-700">{step.mockData.liberalFraming.title}</p>
                              <ul className="mt-2 text-sm text-blue-700">
                                {step.mockData.liberalFraming.arguments.map((arg, idx) => (
                                  <li key={idx} className="list-disc ml-4">{arg}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <h5 className="font-medium text-purple-800 mb-2">Moderate Framing</h5>
                              <p className="text-sm text-purple-700">{step.mockData.moderateFraming.title}</p>
                              <ul className="mt-2 text-sm text-purple-700">
                                {step.mockData.moderateFraming.arguments.map((arg, idx) => (
                                  <li key={idx} className="list-disc ml-4">{arg}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <h5 className="font-medium text-gray-800 mb-2">Unifying Themes</h5>
                              <ul className="text-sm text-gray-700">
                                {step.mockData.unifyingThemes.map((theme, idx) => (
                                  <li key={idx} className="list-disc ml-4">{theme}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 8 && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Citation Verification Results</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-teal-50 rounded-lg">
                              <div className="text-xl font-bold text-teal-600">{step.mockData.citationsChecked}</div>
                              <div className="text-xs text-gray-600">Citations Checked</div>
                            </div>
                            <div className="text-center p-3 bg-teal-50 rounded-lg">
                              <div className="text-xl font-bold text-teal-600">{step.mockData.precedentsVerified}</div>
                              <div className="text-xs text-gray-600">Precedents Verified</div>
                            </div>
                            <div className="text-center p-3 bg-teal-50 rounded-lg">
                              <div className="text-xl font-bold text-teal-600">{step.mockData.quotesValidated}</div>
                              <div className="text-xs text-gray-600">Quotes Validated</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-xl font-bold text-green-600">{step.mockData.accuracyScore}%</div>
                              <div className="text-xs text-gray-600">Accuracy Score</div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Key Precedents</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {step.mockData.keyPrecedents.map((prec, idx) => (
                                <div key={idx} className="bg-blue-50 rounded-lg p-3">
                                  <p className="text-sm font-medium text-blue-800">{prec.case}</p>
                                  <p className="text-xs text-blue-600">{prec.citation}</p>
                                  <p className="text-xs text-gray-600">{prec.status}</p>
                                  <p className="text-xs text-gray-600">{prec.relevance}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Historical Sources</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {step.mockData.historicalSources.map((source, idx) => (
                                <div key={idx} className="bg-purple-50 rounded-lg p-3">
                                  <p className="text-sm font-medium text-purple-800">{source.source}</p>
                                  <p className="text-xs text-purple-600">{source.verification}</p>
                                  <p className="text-xs text-gray-600">{source.relevance}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Potential Issues</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {step.mockData.potentialIssues.map((issue, idx) => (
                                <div key={idx} className="bg-red-50 rounded-lg p-3">
                                  <p className="text-sm text-red-700">{issue}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 9 && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">AI-Generated Brief: Miller v. New York</h4>
                          
                          {/* Brief Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <div className="text-xl font-bold text-orange-600">{step.mockData.totalWordCount}</div>
                              <div className="text-xs text-gray-600">Total Words</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-xl font-bold text-green-600">{step.mockData.overallPersuasionScore}%</div>
                              <div className="text-xs text-gray-600">Persuasion Score</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-xl font-bold text-blue-600">6</div>
                              <div className="text-xs text-gray-600">Sections</div>
                            </div>
                          </div>

                          {/* Brief Content */}
                          <div className="space-y-6">
                            {step.mockData.sections.map((section, idx) => (
                              <div key={idx} className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-medium text-gray-900">{section.title}</h5>
                                    <div className="flex items-center space-x-4">
                                      <span className="text-sm text-gray-600">{section.wordCount} words</span>
                                      <span className={`text-sm font-medium ${
                                        section.persuasionScore >= 90 ? 'text-green-600' :
                                        section.persuasionScore >= 80 ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`}>{section.persuasionScore}% persuasion</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-4">
                                  {/* Interest of Amicus Curiae */}
                                  {section.title === "Interest of Amicus Curiae" && (
                                    <div className="prose prose-sm max-w-none">
                                      <p className="text-gray-800 leading-relaxed">
                                        First Liberty Institute is a nonprofit legal organization dedicated to defending and restoring religious liberty across America. First Liberty has represented parties in numerous Supreme Court cases involving religious freedom, including <em>Kennedy v. Bremerton School District</em>, <em>American Legion v. American Humanist Association</em>, and <em>Trinity Lutheran v. Comer</em>.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        First Liberty has particular expertise in cases involving religious exemptions and the application of <em>Employment Division v. Smith</em>. The organization represents religious communities nationwide facing similar challenges to their constitutional rights.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        This case presents fundamental questions about the scope of religious liberty that extend far beyond the specific circumstances of Petitioners. The Court's resolution will affect religious communities across the nation and the future of the Free Exercise Clause.
                                      </p>
                                    </div>
                                  )}

                                  {/* Summary of Argument */}
                                  {section.title === "Summary of Argument" && (
                                    <div className="prose prose-sm max-w-none">
                                      <p className="text-gray-800 leading-relaxed">
                                        <strong>First,</strong> <em>Employment Division v. Smith</em> represents a significant departure from the original meaning of the Free Exercise Clause and this Court's historic commitment to religious accommodation. The Founding generation understood religious liberty to require meaningful protection for sincere religious practice, not mere formal equality.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        <strong>Second,</strong> New York's selective exemption system—maintaining medical exemptions while eliminating religious exemptions—violates both neutrality and general applicability requirements. The 2018-2019 measles outbreak that prompted this legislation demonstrates the arbitrary nature of targeting religious exemptions while preserving secular ones.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        <strong>Third,</strong> the broader implications of this case extend far beyond vaccination requirements to fundamental questions about government power over religious communities. The constitutional principles at stake affect religious liberty protections nationwide.
                                      </p>
                                    </div>
                                  )}



                                  {/* Argument I */}
                                  {section.title === "Argument I: Employment Division v. Smith Undermines Constitutional Text and History" && (
                                    <div className="prose prose-sm max-w-none">
                                      <h6 className="font-medium text-gray-900 mb-2">A. The Free Exercise Clause Originally Required Meaningful Protection</h6>
                                      <p className="text-gray-800 leading-relaxed">
                                        The Founding generation understood religious liberty to require more than formal equality. Madison's Memorial and Remonstrance warned against forcing citizens to violate their "homage owed to the Creator" through civil laws. Here, the State forces Amish families to choose between fundamental religious beliefs and educating their children in community schools—precisely the kind of coercion the Founders sought to prevent.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        Pennsylvania's colonial experience, particularly relevant given the Amish community's historical roots, demonstrates the Founders' commitment to religious accommodation. The Charter of Privileges (1701) protected conscientious objectors from oath requirements and military service, creating what contemporaries called the "unintended consequence of peace and prosperity."
                                      </p>
                                      <h6 className="font-medium text-gray-900 mb-2 mt-4">B. Smith's "Anarchy" Concern Has Proven Unfounded</h6>
                                      <p className="text-gray-800 leading-relaxed">
                                        Smith's fear that religious accommodation would "court anarchy" has not materialized in the three decades since that decision. Religious communities like the Amish have sought narrow accommodations consistent with public welfare. The $118,000 in penalties imposed here demonstrates how Smith enables government overreach against peaceful religious minorities.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        This Court's pre-Smith precedents in <em>Sherbert</em> and <em>Yoder</em> show that meaningful religious liberty protection is both workable and essential to constitutional governance.
                                      </p>
                                    </div>
                                  )}

                                  {/* Argument II */}
                                  {section.title === "Argument II: New York's Selective Exemption System Violates Neutrality and General Applicability" && (
                                    <div className="prose prose-sm max-w-none">
                                      <h6 className="font-medium text-gray-900 mb-2">A. The Medical-Religious Exemption Distinction Lacks Constitutional Justification</h6>
                                      <p className="text-gray-800 leading-relaxed">
                                        New York's decision to eliminate religious exemptions while preserving medical exemptions creates an arbitrary distinction that violates both neutrality and general applicability. The record shows that religious exemptions increased from 0.54% to 1.53% in private schools, while some schools had up to 50% medical exemptions—yet only religious exemptions were targeted for elimination.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        The three Amish schools here—Dygert Road, Pleasant View, and Shady Lane—serve entirely insular communities with minimal public contact. These schools educate only Amish children whose families hold sincere religious beliefs against vaccination, yet face $118,000 in penalties for maintaining their religious convictions.
                                      </p>
                                      <h6 className="font-medium text-gray-900 mb-2 mt-4">B. The Measles Outbreak Does Not Justify Religious Targeting</h6>
                                      <p className="text-gray-800 leading-relaxed">
                                        While New York cites the 2018-2019 measles outbreak as justification, the record shows this outbreak was concentrated in specific communities, not among the broader population of religious exemption holders. The State's response—eliminating all religious exemptions while preserving medical ones—was both overinclusive and underinclusive.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        The constitutional problem is not the State's public health interest, but its decision to accommodate secular objections while targeting religious ones. This selective accommodation violates the principle that government cannot "decide which reasons for not complying with the policy are worthy of solicitude."
                                      </p>
                                    </div>
                                  )}

                                  {/* Argument III */}
                                  {section.title === "Argument III: The Measles Outbreak Provides No Justification for Religious Targeting" && (
                                    <div className="prose prose-sm max-w-none">
                                      <h6 className="font-medium text-gray-900 mb-2">A. The Outbreak Data Does Not Support Blanket Religious Exemption Elimination</h6>
                                      <p className="text-gray-800 leading-relaxed">
                                        New York's own data shows the 2018-2019 measles outbreak was concentrated in specific geographic areas, primarily Rockland County, where up to 20% of students in six schools had religious exemptions. However, the State's response—eliminating religious exemptions statewide while preserving medical exemptions everywhere—bears no rational relationship to this localized problem.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        The record shows that 285 schools statewide had vaccination rates below 85%, including 170 schools below 70%, yet religious exemptions represented only a fraction of unvaccinated students. Medical exemptions outnumbered religious exemptions five-to-one in many areas, yet only religious exemptions were eliminated.
                                      </p>
                                      <h6 className="font-medium text-gray-900 mb-2 mt-4">B. Insular Religious Communities Present Distinct Considerations</h6>
                                      <p className="text-gray-800 leading-relaxed">
                                        The Amish schools here serve completely insular communities with minimal public interaction. Unlike the urban outbreak areas, these rural communities have different disease transmission patterns and risk profiles. The Second Circuit's decision treats all religious exemption holders identically, ignoring these meaningful distinctions.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        The constitutional injury here extends beyond vaccination requirements to fundamental questions about government power over religious communities. When the State can impose $118,000 in penalties on peaceful religious schools for maintaining their faith convictions, it threatens the autonomy of all religious communities.
                                      </p>
                                    </div>
                                  )}

                                  {/* Conclusion */}
                                  {section.title === "Conclusion" && (
                                    <div className="prose prose-sm max-w-none">
                                      <p className="text-gray-800 leading-relaxed">
                                        This case presents the Court with an opportunity to restore constitutional protection for religious exercise that has been eroded by <em>Employment Division v. Smith</em>. The Amish families here—Joseph Miller, Ezra Wengerd, Jonas Smucker, and their communities—face a stark choice between their fundamental religious beliefs and educating their children in their community schools.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        New York's selective targeting of religious exemptions while preserving medical exemptions violates the core principle that government cannot decide which reasons for accommodation are worthy of constitutional solicitude. The $118,000 in penalties imposed on these peaceful religious schools demonstrates how Smith enables government overreach against religious minorities.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        The constitutional principles at stake extend far beyond vaccination requirements to fundamental questions about religious liberty in America. When government can force religious believers to choose between their faith and their children's education, it threatens the autonomy of all religious communities.
                                      </p>
                                      <p className="text-gray-800 leading-relaxed mt-3">
                                        For these reasons, amici respectfully urge the Court to grant certiorari and reverse the judgment below.
                                      </p>
                                    </div>
                                  )}

                                  {/* Show content preview for other sections */}
                                  {!["Interest of Amicus Curiae", "Summary of Argument", "Argument I: Employment Division v. Smith Undermines Constitutional Text and History", "Argument II: New York's Selective Exemption System Violates Neutrality and General Applicability", "Argument III: The Measles Outbreak Provides No Justification for Religious Targeting", "Conclusion"].includes(section.title) && (
                                    <div className="text-gray-600 italic">
                                      {section.content}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Justice-Specific Scores */}
                          <div className="mt-6">
                            <h5 className="font-medium mb-3">Justice-Specific Persuasion Scores</h5>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                              {Object.entries(step.mockData.justiceSpecificScores).map(([justice, score]) => (
                                <div key={justice} className="text-center p-3 bg-gray-50 rounded-lg">
                                  <div className={`text-lg font-bold ${
                                    score >= 90 ? 'text-green-600' :
                                    score >= 70 ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>{score}%</div>
                                  <div className="text-xs text-gray-600">{justice}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Improvement Areas */}
                          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="font-medium mb-3 text-green-800">Strength Areas</h5>
                              <ul className="space-y-2">
                                {step.mockData.strengthAreas.map((area, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{area}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-3 text-yellow-800">Improvement Areas</h5>
                              <ul className="space-y-2">
                                {step.mockData.improvementAreas.map((area, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{area}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 10 && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Final Review Results</h4>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-xl font-bold text-gray-600">{step.mockData.consistencyScore}%</div>
                                <div className="text-xs text-gray-600">Consistency Score</div>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-xl font-bold text-green-600">{step.mockData.contradictions}</div>
                                <div className="text-xs text-gray-600">Contradictions</div>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-xl font-bold text-blue-600">6/9</div>
                                <div className="text-xs text-gray-600">Justices Aligned</div>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">Justice Alignment Scores</h5>
                              <div className="space-y-2">
                                {Object.entries(step.mockData.justiceAlignment).map(([justice, score]) => (
                                  <div key={justice} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm font-medium">{justice}</span>
                                    <span className="text-sm">{score}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">Final Recommendations</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {step.mockData.finalRecommendations.map((rec, idx) => (
                                  <div key={idx} className="bg-yellow-50 rounded-lg p-3">
                                    <p className="text-sm font-medium text-yellow-800">{rec.category}</p>
                                    <p className="text-sm text-yellow-700">{rec.suggestion}</p>
                                    <p className="text-xs text-gray-600">{rec.impact}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">Overall Assessment</h5>
                              <div className="bg-purple-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-purple-800">Win Probability: {step.mockData.overallAssessment.winProbability}%</p>
                                <p className="text-sm text-purple-700">Cert Probability: {step.mockData.overallAssessment.certProbability}%</p>
                                <p className="text-xs text-gray-600">Risk Factors:</p>
                                <ul className="text-xs text-gray-700 list-disc ml-4">
                                  {step.mockData.overallAssessment.riskFactors.map((factor, idx) => (
                                    <li key={idx}>{factor}</li>
                                  ))}
                                </ul>
                                <p className="text-xs text-gray-600">Strength Factors:</p>
                                <ul className="text-xs text-gray-700 list-disc ml-4">
                                  {step.mockData.overallAssessment.strengthFactors.map((factor, idx) => (
                                    <li key={idx}>{factor}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status indicator */}
                      <div className="flex justify-center items-center mt-6">
                        <div className="text-sm text-green-600 font-medium">
                          ✓ Analysis Complete - Click any step above to explore details
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 