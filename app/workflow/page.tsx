'use client';

import { useState, useEffect } from 'react';
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
  AlertTriangle,
  Database,
  ChevronUp,
  Clock
} from 'lucide-react';
import FileUpload from '@/app/components/FileUpload';
import CitationResearch from '@/app/components/CitationResearch';
import TranscriptionManager from '@/app/components/TranscriptionManager';

export default function WorkflowPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('workflow');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<any>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [documentSummaries, setDocumentSummaries] = useState<any[]>([]);
  const [briefSectionChats, setBriefSectionChats] = useState<{[key: string]: Array<{role: 'user' | 'assistant', content: string}>}>({});
  const [chatInputs, setChatInputs] = useState<{[key: string]: string}>({});

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
    if (stepNumber < steps.length) {
      setCurrentStep(stepNumber + 1);
    }
  };

  const handleFileUploadComplete = (fileData: any) => {
    setUploadedFileData(fileData);
    handleStepComplete(1);
  };

  const handleStepClick = (stepId: number) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const handleBriefSectionChat = (sectionId: string, userMessage: string) => {
    if (!userMessage.trim()) return;
    
    // Add user message
    setBriefSectionChats(prev => ({
      ...prev,
      [sectionId]: [
        ...(prev[sectionId] || []),
        { role: 'user', content: userMessage }
      ]
    }));
    
    // Clear input
    setChatInputs(prev => ({
      ...prev,
      [sectionId]: ''
    }));
    
    // Simulate AI response (in real implementation, this would call an API)
    setTimeout(() => {
      const responses = {
        'question': [
          "I can help refine the question presented. Would you like me to make it more specific to the Amish community, or broader to cover all religious minorities?",
          "The current formulation focuses on Smith doctrine. Should we emphasize the religious targeting angle more strongly?",
          "I notice we could strengthen the constitutional framing. Would you like me to add more originalist language for Justice Thomas?"
        ],
        'summary': [
          "The summary effectively previews our three-part argument. Should we adjust the emphasis on any particular pillar?",
          "I can enhance the emotional appeal while maintaining legal precision. What tone would you prefer?",
          "The Yoder parallel is strong here. Should we draw more explicit connections to that precedent?"
        ],
        'argument1': [
          "This section builds our textual and historical foundation. Should we add more founding-era evidence?",
          "The Yoder analysis is central here. Would you like me to strengthen the factual parallels?",
          "I can add more citations to support the historical accommodation tradition. What time period should we focus on?"
        ],
        'argument2': [
          "The religious targeting argument is powerful. Should we emphasize the selective exemption angle more?",
          "I can strengthen the Lukumi parallels. Would you like more detailed factual comparisons?",
          "The neutrality violation is clear. Should we add more examples of government religious hostility?"
        ],
        'argument3': [
          "This section tackles Smith directly. Should we be more aggressive in calling for its overruling?",
          "I can provide more narrow paths to avoid overturning Smith. Which justices are you most concerned about?",
          "The institutional competence argument could be stronger. Should we emphasize judicial vs. bureaucratic decision-making?"
        ],
        'conclusion': [
          "The conclusion ties everything together. Should we add more emotional appeal for the Amish family?",
          "I can strengthen the constitutional imperative language. Would you like more forceful rhetoric?",
          "The remedy section could be more specific. Should we detail exactly what accommodation we're seeking?"
        ]
      };
      
      const sectionResponses = responses[sectionId as keyof typeof responses] || [
        "I can help you refine this section. What specific changes would you like to make?",
        "What aspect of this argument would you like to strengthen or modify?",
        "I'm ready to help improve this section. What's your main concern?"
      ];
      
      const randomResponse = sectionResponses[Math.floor(Math.random() * sectionResponses.length)];
      
      setBriefSectionChats(prev => ({
        ...prev,
        [sectionId]: [
          ...prev[sectionId],
          { role: 'assistant', content: randomResponse }
        ]
      }));
    }, 1000);
  };

  const renderChatInterface = (sectionId: string) => (
    <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h6 className="font-medium text-gray-800 text-sm">💬 Discuss This Section</h6>
        <span className="text-xs text-gray-500">AI Legal Assistant</span>
      </div>
      
      {/* Chat Messages */}
      {briefSectionChats[sectionId] && briefSectionChats[sectionId].length > 0 && (
        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
          {briefSectionChats[sectionId].map((message, index) => (
            <div key={index} className={`text-xs p-2 rounded ${
              message.role === 'user' 
                ? 'bg-blue-100 text-blue-800 ml-4' 
                : 'bg-white text-gray-700 mr-4 border'
            }`}>
              <span className="font-medium">{message.role === 'user' ? 'You: ' : 'AI: '}</span>
              {message.content}
            </div>
          ))}
        </div>
      )}
      
      {/* Chat Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Ask about this section or suggest changes..."
          value={chatInputs[sectionId] || ''}
          onChange={(e) => setChatInputs(prev => ({...prev, [sectionId]: e.target.value}))}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleBriefSectionChat(sectionId, chatInputs[sectionId] || '');
            }
          }}
          className="flex-1 text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={() => handleBriefSectionChat(sectionId, chatInputs[sectionId] || '')}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );

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
          }
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
          ]
        },
        liberalFraming: {
          title: "Minority Rights Protection and Bodily Autonomy",
          arguments: [
            "Protection of vulnerable religious minority from government targeting",
            "Bodily autonomy and right to refuse unwanted medical intervention",
            "Equal protection - medical exemptions prove religious targeting",
            "Preventing government coercion of deeply held convictions"
          ]
        }
      }
    },
    {
      id: 8,
      title: "Counter-Argument Analysis & Response Strategy",
      icon: AlertTriangle,
      color: "bg-orange-500",
      description: "AI identifies all potential opposition arguments and develops strategic responses.",
      details: "The system analyzes the government's likely arguments, identifies potential weaknesses in our case, and develops strategic responses. This includes arguments to address directly in the brief versus those to avoid engaging, and how to inoculate against the strongest opposition points.",
      mockData: {
        counterArgumentsIdentified: 23,
        criticalThreats: 7,
        strategicResponses: 15,
        avoidanceRecommendations: 8,
        inoculationStrategies: 12,
        threatLevel: {
          high: ["Public Health Emergency", "Smith Precedent", "Slippery Slope"],
          medium: ["Equal Treatment", "Anti-Science Framing", "Child Welfare"],
          low: ["COVID Politics", "Religious Targeting Claims", "Broad Revolution"]
        }
      }
    },
    {
      id: 9,
      title: "Citation and Precedent Verification",
      icon: Shield,
      color: "bg-teal-500",
      description: "System automatically verifies all citations and cross-references legal precedents.",
      details: "The system automatically verifies all citations, cross-references legal precedents, and ensures accuracy of quotes and case references. Multiple AI models cross-check each other to prevent hallucinations and false citations.",
      mockData: {
        citationsChecked: 247,
        precedentsVerified: 89,
        quotesValidated: 156,
        accuracyScore: 99.7
      }
    },
    {
      id: 10,
      title: "Brief Structure and Drafting",
      icon: PenTool,
      color: "bg-indigo-500",
      description: "AI generates the full brief structure incorporating all research, stories, and strategic elements.",
      details: "The AI generates the full brief structure with introduction, argument sections, and conclusion, incorporating all the research, stories, and strategic elements identified in previous steps. Users can edit and refine the draft while maintaining the strategic framework.",
      mockData: {
        totalWordCount: 10952,
        overallPersuasionScore: 92,
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
        briefSections: [
          "Statement of the Question Presented",
          "Statement of Parties",
          "Statement of the Case",
          "Summary of Argument",
          "Argument I: The Free Exercise Clause Requires Accommodation",
          "Argument II: Religious Targeting Violates Neutrality",
          "Argument III: Smith Should Be Limited or Overruled",
          "Conclusion"
        ]
      }
    },
    {
      id: 11,
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
        overallAssessment: {
          winProbability: 73,
          certProbability: 85
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Supreme Court Brief Writing Tool</h1>
            <p className="mt-2 text-gray-600">AI-powered legal brief generation for constitutional cases</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-8 border-b">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'workflow'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Workflow</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('transcriptions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transcriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Saved Transcriptions</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'workflow' ? (
          <>
            {/* Progress Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Workflow Progress</h2>
                <div className="text-sm text-gray-600 font-medium">
                  {completedSteps.length} of {steps.length} steps completed
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      completedSteps.includes(step.id) 
                        ? 'bg-green-500 text-white' 
                        : step.id === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {completedSteps.includes(step.id) ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-1 mx-1 ${
                        completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                />
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
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 border-t bg-gray-50">
                        <div className="pt-6">
                          <p className="text-gray-700 mb-6">{step.details}</p>
                          
                          {/* Step-specific UI components with real data */}
                          {step.id === 1 && (
                            <div className="space-y-4">
                              <div className="bg-white rounded-lg p-4">
                                <h4 className="font-semibold mb-3">Audio Analysis: Strategy Session</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center bg-green-50">
                                      <Upload className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                      <p className="text-sm text-green-700">{step.mockData.file}</p>
                                      <p className="text-xs text-green-600 mt-1">Duration: {step.mockData.duration}</p>
                                    </div>
                                    <div className="mt-4 text-center">
                                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        {step.mockData.status}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="text-sm">
                                      <strong>Speakers Identified:</strong> {step.mockData?.speakers?.length || 0}
                                    </div>
                                    <div className="text-sm">
                                      <strong>Transcription Quality:</strong> {step.mockData?.transcriptionQuality || 0}%
                                    </div>
                                    <div className="text-sm">
                                      <strong>Key Topics:</strong> {step.mockData?.keyTopics?.join(", ") || ""}
                                    </div>
                                    <div className="text-sm">
                                      <strong>Tone:</strong> {step.mockData.emotionalTone}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {step.id === 2 && (
                            <div className="space-y-6">
                              {/* Basic Case Information */}
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-4">Basic Case Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Case Name</label>
                                    <input
                                      type="text"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="e.g., Miller v. McDonald"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Court Level</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                      <option>Supreme Court</option>
                                      <option>Circuit Court</option>
                                      <option>District Court</option>
                                    </select>
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Constitutional Question</label>
                                    <textarea
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      rows={3}
                                      placeholder="State the constitutional question at issue..."
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Citation Research Component */}
                              <CitationResearch
                                onDocumentsSelected={setSelectedDocuments}
                                onSummariesGenerated={setDocumentSummaries}
                              />

                              {/* Document Summaries Display */}
                              {documentSummaries.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <h4 className="font-semibold text-green-900 mb-2">✓ Document Analysis Complete</h4>
                                  <p className="text-sm text-green-700">
                                    {documentSummaries.length} documents analyzed and summarized for case context.
                                  </p>
                                </div>
                              )}

                              {/* Selected Documents Count */}
                              {selectedDocuments.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <h4 className="font-semibold text-blue-900 mb-2">Selected Documents</h4>
                                  <p className="text-sm text-blue-700">
                                    {selectedDocuments.length} documents selected for brief generation.
                                  </p>
                                  <div className="mt-4">
                                    <button
                                      onClick={() => handleStepComplete(2)}
                                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                      Continue to Legal Research <ChevronRight className="w-4 h-4 ml-1 inline" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Placeholder for remaining steps */}
                          {step.id > 2 && (
                            <div className="text-center py-8">
                              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-gray-700 mb-2">Coming Soon</h3>
                              <p className="text-gray-500">
                                This step will be available once the previous steps are completed.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Transcriptions Tab */
          <TranscriptionManager />
        )}
      </div>
    </div>
  );
}