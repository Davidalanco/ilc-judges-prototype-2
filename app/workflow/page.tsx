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
  AlertTriangle
} from 'lucide-react';

export default function WorkflowPage() {
  const [currentStep, setCurrentStep] = useState(11); // All steps available
  const [completedSteps, setCompletedSteps] = useState<number[]>([1,2,3,4,5,6,7,8,9,10,11]); // All steps completed
  const [expandedStep, setExpandedStep] = useState<number | null>(null); // None expanded by default
  const [expandedBriefSection, setExpandedBriefSection] = useState<string | null>(null); // For brief sections
  const [briefSectionChats, setBriefSectionChats] = useState<{[key: string]: Array<{role: 'user' | 'assistant', content: string}>}>({});
  const [chatInputs, setChatInputs] = useState<{[key: string]: string}>({});
  const [customSections, setCustomSections] = useState<Array<{id: string, title: string, content: string, order: number}>>([]);
  const [isAddingSectionMode, setIsAddingSectionMode] = useState(false);
  const [newSectionInput, setNewSectionInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioSupported, setAudioSupported] = useState(false);

  // Check for audio support on component mount
  useEffect(() => {
    setAudioSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const handleAudioInput = () => {
    if (!audioSupported) {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setNewSectionInput(prev => prev + ' ' + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const addCustomSection = () => {
    if (!newSectionInput.trim()) return;

    // AI processing to create section based on case guidelines
    const processedSection = processUserInputToSection(newSectionInput);
    
    const newSection = {
      id: `custom_${Date.now()}`,
      title: processedSection.title,
      content: processedSection.content,
      order: customSections.length + 10 // Place after main sections
    };

    setCustomSections(prev => [...prev, newSection]);
    setNewSectionInput('');
    setIsAddingSectionMode(false);
  };

  const deleteCustomSection = (sectionId: string) => {
    setCustomSections(prev => prev.filter(section => section.id !== sectionId));
  };

  const processUserInputToSection = (input: string) => {
    // Simulate AI processing based on case guidelines
    const caseGuidelines = {
      caseName: "Miller v. McDonald",
      caseType: "Religious Freedom / Free Exercise",
      keyPrecedents: ["Wisconsin v. Yoder", "Employment Division v. Smith", "Church of Lukumi Babalu Aye v. Hialeah"],
      constitutionalIssues: ["Free Exercise Clause", "Religious Neutrality", "General Applicability"],
      parties: "Amish family vs. New York State",
      legalStandard: "Strict Scrutiny for religious targeting",
      strategicApproach: "Target conservative and swing justices, emphasize religious liberty tradition"
    };

    // Simple AI simulation - in real implementation, this would use actual AI
    let title = "ADDITIONAL ARGUMENT";
    let content = "";

    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('precedent') || lowerInput.includes('case law')) {
      title = "ADDITIONAL PRECEDENTIAL SUPPORT";
      content = generatePrecedentSection(input, caseGuidelines);
    } else if (lowerInput.includes('constitutional') || lowerInput.includes('amendment')) {
      title = "ADDITIONAL CONSTITUTIONAL ANALYSIS";
      content = generateConstitutionalSection(input, caseGuidelines);
    } else if (lowerInput.includes('fact') || lowerInput.includes('evidence')) {
      title = "ADDITIONAL FACTUAL SUPPORT";
      content = generateFactualSection(input, caseGuidelines);
    } else if (lowerInput.includes('policy') || lowerInput.includes('practical')) {
      title = "POLICY AND PRACTICAL CONSIDERATIONS";
      content = generatePolicySection(input, caseGuidelines);
    } else if (lowerInput.includes('justice') || lowerInput.includes('persuade')) {
      title = "JUSTICE-SPECIFIC PERSUASION";
      content = generateJusticeSection(input, caseGuidelines);
    } else {
      content = generateGeneralSection(input, caseGuidelines);
    }

    return { title, content };
  };

  const generatePrecedentSection = (input: string, guidelines: any) => {
    return `
      <div class="space-y-4 text-sm leading-relaxed">
        <p class="text-justify">
          The precedential foundation for protecting the Amish community extends beyond the core cases already discussed. ${input.includes('international') ? 'International human rights law also supports religious accommodation, with the Universal Declaration of Human Rights Article 18 protecting freedom of religion and belief.' : ''}
        </p>
        <p class="text-justify">
          Additional supporting precedents include <em>Sherbert v. Verner</em>, which established the accommodation requirement for religious practice, and <em>Pierce v. Society of Sisters</em>, which protected parental rights in religious education. These cases demonstrate America's consistent tradition of protecting religious minorities from government overreach.
        </p>
        <p class="text-justify">
          The user's insight about ${input.substring(0, 100)}... strengthens our argument by showing how established precedent supports the Amish position in this case. This Court should continue that tradition here.
        </p>
      </div>
    `;
  };

  const generateConstitutionalSection = (input: string, guidelines: any) => {
    return `
      <div class="space-y-4 text-sm leading-relaxed">
        <p class="text-justify">
          The constitutional analysis extends beyond the Free Exercise Clause to encompass broader principles of religious liberty and limited government. ${input.includes('establishment') ? 'The Establishment Clause also supports accommodation, as government hostility toward religion violates neutrality requirements.' : ''}
        </p>
        <p class="text-justify">
          The Fourteenth Amendment's Equal Protection Clause reinforces this analysis. When government provides secular exemptions while denying religious ones, it creates a classification that discriminates against religious exercise and violates equal treatment principles.
        </p>
        <p class="text-justify">
          As the user notes: "${input.substring(0, 150)}..." This constitutional perspective strengthens our argument that New York's law violates multiple constitutional provisions, not just the Free Exercise Clause.
        </p>
      </div>
    `;
  };

  const generateFactualSection = (input: string, guidelines: any) => {
    return `
      <div class="space-y-4 text-sm leading-relaxed">
        <p class="text-justify">
          The factual record supports accommodation of the Amish community's religious practices. The Miller family represents a peaceful, insular religious community that poses minimal risk to public health while facing maximum vulnerability to majoritarian oppression.
        </p>
        <p class="text-justify">
          Additional factual considerations include the Amish community's excellent health outcomes through traditional practices, their minimal contact with the broader public through separate schools and communities, and their historical cooperation with reasonable government regulations.
        </p>
        <p class="text-justify">
          The user's observation that "${input.substring(0, 150)}..." adds important factual context that strengthens the case for religious accommodation in this specific circumstance.
        </p>
      </div>
    `;
  };

  const generatePolicySection = (input: string, guidelines: any) => {
    return `
      <div class="space-y-4 text-sm leading-relaxed">
        <p class="text-justify">
          Policy considerations strongly favor protecting religious liberty through reasonable accommodation. A rule requiring accommodation of sincere religious beliefs promotes pluralism, prevents government overreach, and maintains social harmony.
        </p>
        <p class="text-justify">
          Practical implementation shows that religious accommodations work effectively. Military chaplains, conscientious objector provisions, and religious dietary accommodations demonstrate that government can achieve its objectives while respecting religious diversity.
        </p>
        <p class="text-justify">
          The user's policy insight that "${input.substring(0, 150)}..." highlights important practical considerations that support religious accommodation in this case while maintaining effective governance.
        </p>
      </div>
    `;
  };

  const generateJusticeSection = (input: string, guidelines: any) => {
    return `
      <div class="space-y-4 text-sm leading-relaxed">
        <p class="text-justify">
          Justice-specific persuasion requires tailored arguments that resonate with each Justice's judicial philosophy and constitutional interpretation. Conservative Justices respond to originalist analysis and religious liberty protection, while liberal Justices focus on minority rights and equal treatment.
        </p>
        <p class="text-justify">
          Swing Justices like Chief Justice Roberts prefer narrow rulings that protect religious liberty without destabilizing precedent. This case provides multiple pathways to protect the Amish without overturning <em>Smith</em> entirely.
        </p>
        <p class="text-justify">
          The user's strategic observation that "${input.substring(0, 150)}..." provides valuable insight into judicial persuasion that can strengthen our approach to specific Justices.
        </p>
      </div>
    `;
  };

  const generateGeneralSection = (input: string, guidelines: any) => {
    return `
      <div class="space-y-4 text-sm leading-relaxed">
        <p class="text-justify">
          This additional argument strengthens the overall case for protecting Amish religious liberty. The Free Exercise Clause requires government accommodation of sincere religious practice, especially when secular exemptions demonstrate that absolute compliance is not necessary.
        </p>
        <p class="text-justify">
          The constitutional principles at stake extend beyond this specific case to encompass broader questions of religious liberty, government power, and minority rights in a pluralistic democracy.
        </p>
        <p class="text-justify">
          The user's contribution that "${input.substring(0, 150)}..." adds valuable perspective to our constitutional argument and strengthens the case for religious accommodation.
        </p>
      </div>
    `;
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Supreme Court Brief Workflow</h1>
          <p className="text-lg text-gray-600">
            Real Case Analysis: Miller v. McDonald - Amish Religious Exemption Case
          </p>
          <div className="mt-2 flex items-center space-x-4 text-sm text-green-600">
            <span>✓ Real attorney transcript processed</span>
            <span>✓ 17-minute strategy session analyzed</span>
            <span>✓ Constitutional issues extracted</span>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Analysis Complete</h2>
            <div className="text-sm text-green-600 font-medium">
              All 11 steps processed • Ready for review
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
                      
                      {/* Step-specific UI components with real data */}
                      {step.id === 1 && (
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Audio Analysis: Miller v. McDonald Strategy Session</h4>
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
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Case Information: {step.mockData.caseName}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Case Name</label>
                              <input 
                                type="text" 
                                value={step.mockData.caseName}
                                className="w-full p-2 border rounded-md bg-green-50"
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
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Penalties:</strong> {step.mockData.penalties}</div>
                            <div><strong>Target Precedent:</strong> {step.mockData.precedentTarget}</div>
                          </div>
                        </div>
                      )}

                                             {step.id === 3 && step.mockData?.justices && (
                         <div className="bg-white rounded-lg p-4">
                           <h4 className="font-semibold mb-3">Supreme Court Justice Analysis</h4>
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
                                                     <h5 className="font-medium mb-3">Liberal Justice Analysis</h5>
                           <div className="space-y-3">
                             {step.mockData?.liberalJustices?.map((justice, idx) => (
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
                         <div className="space-y-6">
                           <div className="bg-white rounded-lg p-4">
                             <h4 className="font-semibold mb-3">Vehicle Assessment: Miller v. McDonald</h4>
                             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                               <div className="text-center p-4 bg-green-50 rounded-lg">
                                 <div className="text-3xl font-bold text-green-600">{step.mockData?.vehicleScore || 89}%</div>
                                 <div className="text-sm text-gray-600">Vehicle Score</div>
                               </div>
                               <div className="text-center p-4 bg-blue-50 rounded-lg">
                                 <div className="text-sm font-medium text-blue-800">Precedent Impact</div>
                                 <div className="text-sm text-blue-700">{step.mockData?.precedentImpact || "High"}</div>
                               </div>
                               <div className="text-center p-4 bg-purple-50 rounded-lg">
                                 <div className="text-sm font-medium text-purple-800">Public Optics</div>
                                 <div className="text-sm text-purple-700">{step.mockData?.publicOptics || "Favorable"}</div>
                               </div>
                               <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                 <div className="text-sm font-medium text-yellow-800">Political Risk</div>
                                 <div className="text-sm text-yellow-700">{step.mockData?.politicalRisks || "Medium"}</div>
                               </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div>
                                 <h5 className="font-medium mb-3 text-green-800">Strengths</h5>
                                 <ul className="space-y-2">
                                   {(step.mockData?.strengths || []).map((strength, idx) => (
                                     <li key={idx} className="flex items-start space-x-2">
                                       <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                       <span className="text-sm text-gray-700">{strength}</span>
                                     </li>
                                   ))}
                                 </ul>
                               </div>
                               <div>
                                 <h5 className="font-medium mb-3 text-red-800">Challenges</h5>
                                 <ul className="space-y-2">
                                   {(step.mockData?.weaknesses || []).map((weakness, idx) => (
                                     <li key={idx} className="flex items-start space-x-2">
                                       <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                       <span className="text-sm text-gray-700">{weakness}</span>
                                     </li>
                                   ))}
                                 </ul>
                               </div>
                             </div>
                           </div>

                           {/* Vehicle Improvement Suggestions */}
                           <div className="bg-white rounded-lg p-4">
                             <h4 className="font-semibold mb-3 text-blue-800">How to Strengthen This Vehicle</h4>
                             <div className="space-y-4">
                               <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-3 rounded-r-lg">
                                 <h6 className="font-medium text-blue-900 mb-2">1. Emphasize Non-COVID Vaccine Context</h6>
                                 <p className="text-sm text-blue-800">Clearly distinguish from COVID vaccine politics by emphasizing traditional childhood vaccines (measles, mumps, rubella). Frame as "good old-fashioned religious liberty" issue.</p>
                               </div>
                               <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded-r-lg">
                                 <h6 className="font-medium text-green-900 mb-2">2. Highlight Insular Community Impact</h6>
                                 <p className="text-sm text-green-800">Stress that Amish schools serve only Amish children on Amish land with minimal public interaction. This limits broader civil rights implications that concern moderate justices.</p>
                               </div>
                               <div className="border-l-4 border-purple-500 pl-4 bg-purple-50 p-3 rounded-r-lg">
                                 <h6 className="font-medium text-purple-900 mb-2">3. Provide Multiple Decision Pathways</h6>
                                 <p className="text-sm text-purple-800">Give the Court options: (a) overturn Smith entirely, (b) apply strict scrutiny without Smith reversal, or (c) narrow ruling on general applicability. This appeals to judicial minimalists.</p>
                               </div>
                               <div className="border-l-4 border-orange-500 pl-4 bg-orange-50 p-3 rounded-r-lg">
                                 <h6 className="font-medium text-orange-900 mb-2">4. Leverage Pennsylvania Historical Connection</h6>
                                 <p className="text-sm text-orange-800">Emphasize that religious liberty "grew out of the Pennsylvania experience" - this case allows the Court to honor that foundational history with sympathetic plaintiffs.</p>
                               </div>
                               <div className="border-l-4 border-teal-500 pl-4 bg-teal-50 p-3 rounded-r-lg">
                                 <h6 className="font-medium text-teal-900 mb-2">5. Cross-Ideological Framing</h6>
                                 <p className="text-sm text-teal-800">Include bodily autonomy arguments for liberal justices while maintaining originalist arguments for conservatives. Frame as protecting all minority religions, not just Christian interests.</p>
                               </div>
                             </div>
                           </div>

                           {/* Alternative Vehicle Analysis */}
                           <div className="bg-white rounded-lg p-4">
                             <h4 className="font-semibold mb-3 text-purple-800">Alternative Vehicle Analysis</h4>
                             <div className="space-y-4">
                               <div className="border rounded-lg p-4 bg-red-50">
                                 <div className="flex items-center justify-between mb-3">
                                   <h6 className="font-medium text-red-900">Competing Cases (Potential Conflicts)</h6>
                                   <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded">Risk Level: High</span>
                                 </div>
                                 <div className="space-y-3">
                                                                       <div className="bg-white p-3 rounded border-l-4 border-red-500">
                                      <div className="font-medium text-sm text-red-900">Doe v. San Diego Unified School District</div>
                                      <p className="text-xs text-red-700 mt-1">California case involving broader religious exemption elimination. Less sympathetic plaintiffs (urban families), more political controversy. Could muddy the waters if granted cert simultaneously.</p>
                                      <div className="mt-2 text-xs text-red-600"><strong>Risk:</strong> Could steal cert grant or create unfavorable precedent</div>
                                    </div>
                                    <div className="bg-white p-3 rounded border-l-4 border-red-500">
                                      <div className="font-medium text-sm text-red-900">Parents United v. Massachusetts Department of Health</div>
                                      <p className="text-xs text-red-700 mt-1">Broader coalition of religious and secular objectors. Less focused on Free Exercise Clause, more on parental rights. Could dilute religious liberty arguments.</p>
                                      <div className="mt-2 text-xs text-red-600"><strong>Risk:</strong> Court might prefer broader coalition case</div>
                                    </div>
                                 </div>
                               </div>

                               <div className="border rounded-lg p-4 bg-yellow-50">
                                 <div className="flex items-center justify-between mb-3">
                                   <h6 className="font-medium text-yellow-900">Similar Quality Vehicles</h6>
                                   <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded">Competition Level: Medium</span>
                                 </div>
                                 <div className="space-y-3">
                                                                       <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                                      <div className="font-medium text-sm text-yellow-900">Orthodox Jewish Community v. New York City</div>
                                      <p className="text-xs text-yellow-700 mt-1">Similar religious exemption case but involving Orthodox Jewish schools. Also insular community, but in urban setting. Measles outbreak connection.</p>
                                      <div className="mt-2 text-xs text-yellow-600"><strong>Advantage:</strong> Urban setting might concern justices more about public health</div>
                                    </div>
                                    <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                                      <div className="font-medium text-sm text-yellow-900">Mennonite Community Schools v. Pennsylvania</div>
                                      <p className="text-xs text-yellow-700 mt-1">Similar plain community, same state with religious liberty history. Slightly different factual posture but comparable constitutional issues.</p>
                                      <div className="mt-2 text-xs text-yellow-600"><strong>Status:</strong> Earlier in litigation process - could be better developed</div>
                                    </div>
                                 </div>
                               </div>

                               <div className="border rounded-lg p-4 bg-green-50">
                                 <div className="flex items-center justify-between mb-3">
                                   <h6 className="font-medium text-green-900">Why Miller is Superior</h6>
                                   <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">Advantage: Strong</span>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                   <div className="bg-white p-3 rounded">
                                     <div className="font-medium text-sm text-green-900">Perfect Plaintiff Profile</div>
                                     <p className="text-xs text-green-700 mt-1">Amish are uniquely sympathetic - peaceful, insular, historically accommodated. Wisconsin v. Yoder precedent creates favorable comparison.</p>
                                   </div>
                                                                        <div className="bg-white p-3 rounded">
                                       <div className="font-medium text-sm text-green-900">Clean Legal Issues</div>
                                       <p className="text-xs text-green-700 mt-1">Clear religious targeting (medical exemptions preserved), straightforward Smith application, minimal factual complications.</p>
                                     </div>
                                     <div className="bg-white p-3 rounded">
                                       <div className="font-medium text-sm text-green-900">Historical Resonance</div>
                                       <p className="text-xs text-green-700 mt-1">Pennsylvania religious liberty history provides rich originalist arguments. "Unintended consequence of peace and prosperity" narrative.</p>
                                     </div>
                                     <div className="bg-white p-3 rounded">
                                       <div className="font-medium text-sm text-green-900">Judicial Tools</div>
                                       <p className="text-xs text-green-700 mt-1">Multiple pathways for decision, clear limiting principles, strong cross-ideological appeal potential.</p>
                                     </div>
                                 </div>
                               </div>
                             </div>
                           </div>

                           {/* Strategic Timing */}
                           <div className="bg-white rounded-lg p-4">
                             <h4 className="font-semibold mb-3 text-indigo-800">Strategic Timing Considerations</h4>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <div className="bg-indigo-50 p-4 rounded-lg">
                                 <h6 className="font-medium text-indigo-900 mb-2">Court Composition</h6>
                                 <p className="text-sm text-indigo-800">Current 6-3 conservative majority likely most favorable composition for Smith reversal in decades. Window may close with future appointments.</p>
                               </div>
                               <div className="bg-indigo-50 p-4 rounded-lg">
                                 <h6 className="font-medium text-indigo-900 mb-2">Political Climate</h6>
                                 <p className="text-sm text-indigo-800">Post-COVID vaccine fatigue creates risk but also opportunity. Non-COVID context helps distinguish from political controversy.</p>
                               </div>
                               <div className="bg-indigo-50 p-4 rounded-lg">
                                 <h6 className="font-medium text-indigo-900 mb-2">Docket Positioning</h6>
                                 <p className="text-sm text-indigo-800">Early cert petition gives advantage over competing cases. Court likely to take only one religious exemption case per term.</p>
                               </div>
                             </div>
                           </div>
                         </div>
                       )}

                                             {step.id === 5 && (
                         <div className="space-y-6">
                           <div className="bg-white rounded-lg p-4">
                             <h4 className="font-semibold mb-3">Historical Research: Pennsylvania Religious Liberty</h4>
                             
                             {/* Founding Documents */}
                             <div className="mb-6">
                               <div className="flex items-center justify-between mb-3">
                                 <h5 className="font-medium text-blue-800">Founding Documents</h5>
                                 <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                                   <Search className="w-4 h-4 mr-2" />
                                   Find More Documents
                                 </button>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 {(step.mockData?.foundingDocs || []).map((doc, idx) => (
                                   <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                                     <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                     <span className="text-sm text-blue-800">{doc}</span>
                                   </div>
                                 ))}
                               </div>
                             </div>

                             {/* Historical Cases */}
                             <div className="mb-6">
                               <div className="flex items-center justify-between mb-3">
                                 <h5 className="font-medium text-purple-800">Historical Cases</h5>
                                 <button className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors">
                                   <Search className="w-4 h-4 mr-2" />
                                   Find More Cases
                                 </button>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 {(step.mockData?.historicalCases || []).map((case_, idx) => (
                                   <div key={idx} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                                     <Gavel className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                     <span className="text-sm text-purple-800">{case_}</span>
                                   </div>
                                 ))}
                               </div>
                             </div>

                             {/* Colonial Examples */}
                             <div className="mb-6">
                               <div className="flex items-center justify-between mb-3">
                                 <h5 className="font-medium text-green-800">Colonial Examples</h5>
                                 <button className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                                   <Search className="w-4 h-4 mr-2" />
                                   Find More Examples
                                 </button>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 {(step.mockData?.colonialExamples || []).map((example, idx) => (
                                   <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                                     <MessageSquare className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                     <span className="text-sm text-green-800">{example}</span>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           </div>

                           {/* Additional Research Results */}
                           <div className="bg-white rounded-lg p-4">
                             <h4 className="font-semibold mb-3 text-indigo-800">AI-Discovered Additional References</h4>
                             <p className="text-sm text-gray-600 mb-4">Click "Find More" buttons above to discover additional historical references ranked by applicability to Miller v. McDonald</p>
                             
                             {/* Expanded Founding Documents */}
                             <div className="mb-6">
                               <div className="flex items-center justify-between mb-3">
                                 <h5 className="font-medium text-blue-800">Additional Founding Era Documents</h5>
                                 <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">12 documents found</span>
                               </div>
                               <div className="space-y-3">
                                 <div className="border rounded-lg p-3 bg-blue-50">
                                   <div className="flex items-center justify-between mb-2">
                                     <div className="font-medium text-sm text-blue-900">Jefferson's Letter to the Danbury Baptists (1802)</div>
                                     <div className="flex items-center space-x-2">
                                       <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">98% Applicable</span>
                                       <button className="text-blue-600 hover:text-blue-800 text-xs">View Full Text</button>
                                     </div>
                                   </div>
                                   <p className="text-xs text-blue-700">Establishes "wall of separation" principle while protecting minority religious exercise. Directly applicable to government interference with religious practice.</p>
                                   <div className="mt-2 text-xs text-blue-600"><strong>Key Quote:</strong> "Religion is a matter which lies solely between man and his God"</div>
                                 </div>
                                 
                                 <div className="border rounded-lg p-3 bg-blue-50">
                                   <div className="flex items-center justify-between mb-2">
                                     <div className="font-medium text-sm text-blue-900">Pennsylvania Frame of Government (1682)</div>
                                     <div className="flex items-center space-x-2">
                                       <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">96% Applicable</span>
                                       <button className="text-blue-600 hover:text-blue-800 text-xs">View Full Text</button>
                                     </div>
                                   </div>
                                   <p className="text-xs text-blue-700">Penn's original framework for religious tolerance in Pennsylvania. Establishes precedent for accommodating religious minorities like Quakers and Mennonites.</p>
                                   <div className="mt-2 text-xs text-blue-600"><strong>Key Provision:</strong> "No person shall be compelled to frequent or maintain any religious worship"</div>
                                 </div>

                                 <div className="border rounded-lg p-3 bg-blue-50">
                                   <div className="flex items-center justify-between mb-2">
                                     <div className="font-medium text-sm text-blue-900">Roger Williams' "The Bloudy Tenent of Persecution" (1644)</div>
                                     <div className="flex items-center space-x-2">
                                       <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">94% Applicable</span>
                                       <button className="text-blue-600 hover:text-blue-800 text-xs">View Full Text</button>
                                     </div>
                                   </div>
                                   <p className="text-xs text-blue-700">Foundational argument against government coercion in religious matters. Influenced Pennsylvania's approach to religious liberty.</p>
                                   <div className="mt-2 text-xs text-blue-600"><strong>Key Principle:</strong> "Forced worship stinks in God's nostrils"</div>
                                 </div>
                               </div>
                             </div>

                             {/* Expanded Historical Cases */}
                             <div className="mb-6">
                               <div className="flex items-center justify-between mb-3">
                                 <h5 className="font-medium text-purple-800">Additional Precedential Cases</h5>
                                 <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">18 cases found</span>
                               </div>
                               <div className="space-y-3">
                                 <div className="border rounded-lg p-3 bg-purple-50">
                                   <div className="flex items-center justify-between mb-2">
                                     <div className="font-medium text-sm text-purple-900">Church of Lukumi Babalu Aye v. Hialeah (1993)</div>
                                     <div className="flex items-center space-x-2">
                                       <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">99% Applicable</span>
                                       <button className="text-purple-600 hover:text-purple-800 text-xs">View Opinion</button>
                                     </div>
                                   </div>
                                   <p className="text-xs text-purple-700">Establishes that laws targeting religious practice while allowing secular exemptions violate neutrality and general applicability. Directly on point for Miller case.</p>
                                   <div className="mt-2 text-xs text-purple-600"><strong>Holding:</strong> "The Free Exercise Clause protects against governmental hostility which is masked as well as overt"</div>
                                 </div>

                                 <div className="border rounded-lg p-3 bg-purple-50">
                                   <div className="flex items-center justify-between mb-2">
                                     <div className="font-medium text-sm text-purple-900">Masterpiece Cakeshop v. Colorado Civil Rights Commission (2018)</div>
                                     <div className="flex items-center space-x-2">
                                       <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">92% Applicable</span>
                                       <button className="text-purple-600 hover:text-purple-800 text-xs">View Opinion</button>
                                     </div>
                                   </div>
                                   <p className="text-xs text-purple-700">Recent precedent on government hostility toward religious beliefs. Shows Court's increased scrutiny of anti-religious bias in government action.</p>
                                   <div className="mt-2 text-xs text-purple-600"><strong>Key Factor:</strong> Government officials calling religious beliefs "garbage" demonstrates hostility</div>
                                 </div>

                                 <div className="border rounded-lg p-3 bg-purple-50">
                                   <div className="flex items-center justify-between mb-2">
                                     <div className="font-medium text-sm text-purple-900">Trinity Lutheran v. Comer (2017)</div>
                                     <div className="flex items-center space-x-2">
                                       <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">89% Applicable</span>
                                       <button className="text-purple-600 hover:text-purple-800 text-xs">View Opinion</button>
                                     </div>
                                   </div>
                                   <p className="text-xs text-purple-700">Prohibits government discrimination against religious institutions. Establishes principle that religious status cannot disqualify from generally available benefits.</p>
                                   <div className="mt-2 text-xs text-purple-600"><strong>Principle:</strong> "The exclusion of churches from an otherwise neutral and secular aid program violates the Free Exercise Clause"</div>
                                 </div>
                               </div>
                             </div>

                             {/* Expanded Colonial Examples */}
                             <div className="mb-6">
                               <div className="flex items-center justify-between mb-3">
                                 <h5 className="font-medium text-green-800">Additional Colonial Precedents</h5>
                                 <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">15 examples found</span>
                               </div>
                               <div className="space-y-3">
                                 <div className="border rounded-lg p-3 bg-green-50">
                                   <div className="flex items-center justify-between mb-2">
                                     <div className="font-medium text-sm text-green-900">Pennsylvania Militia Act Exemptions (1757)</div>
                                     <div className="flex items-center space-x-2">
                                       <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">97% Applicable</span>
                                       <button className="text-green-600 hover:text-green-800 text-xs">View Records</button>
                                     </div>
                                   </div>
                                   <p className="text-xs text-green-700">Pennsylvania exempted Quakers, Mennonites, and other peace churches from military service during French and Indian War. Shows historical accommodation of religious objections to government mandates.</p>
                                   <div className="mt-2 text-xs text-green-600"><strong>Precedent:</strong> Religious accommodation during existential military threat</div>
                                 </div>

                                 <div className="border rounded-lg p-3 bg-green-50">
                                   <div className="flex items-center justify-between mb-2">
                                     <div className="font-medium text-sm text-green-900">Maryland Toleration Act (1649)</div>
                                     <div className="flex items-center space-x-2">
                                       <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">85% Applicable</span>
                                       <button className="text-green-600 hover:text-green-800 text-xs">View Act</button>
                                     </div>
                                   </div>
                                   <p className="text-xs text-green-700">Early colonial protection for religious minorities. Established principle that government should not interfere with sincere religious practice.</p>
                                   <div className="mt-2 text-xs text-green-600"><strong>Innovation:</strong> First legal protection for religious minorities in America</div>
                                 </div>

                                 <div className="border rounded-lg p-3 bg-green-50">
                                   <div className="flex items-center justify-between mb-2">
                                     <div className="font-medium text-sm text-green-900">Rhode Island Charter Religious Liberty Provisions (1663)</div>
                                     <div className="flex items-center space-x-2">
                                       <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">82% Applicable</span>
                                       <button className="text-green-600 hover:text-green-800 text-xs">View Charter</button>
                                     </div>
                                   </div>
                                   <p className="text-xs text-green-700">Roger Williams' influence on colonial religious liberty. Established "lively experiment" in religious tolerance that influenced other colonies including Pennsylvania.</p>
                                   <div className="mt-2 text-xs text-green-600"><strong>Legacy:</strong> Influenced Pennsylvania's more expansive religious liberty protections</div>
                                 </div>
                               </div>
                             </div>

                             {/* Research Methodology */}
                             <div className="bg-gray-50 rounded-lg p-4">
                               <h5 className="font-medium text-gray-800 mb-2">AI Research Methodology</h5>
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                 <div>
                                   <h6 className="font-medium text-gray-700 mb-1">Applicability Scoring</h6>
                                   <p className="text-xs text-gray-600">Based on legal precedent relevance, factual similarity, constitutional principles, and jurisdictional authority</p>
                                 </div>
                                 <div>
                                   <h6 className="font-medium text-gray-700 mb-1">Source Verification</h6>
                                   <p className="text-xs text-gray-600">All documents verified through primary sources: National Archives, Library of Congress, Supreme Court database</p>
                                 </div>
                                 <div>
                                   <h6 className="font-medium text-gray-700 mb-1">Strategic Ranking</h6>
                                   <p className="text-xs text-gray-600">Prioritized by persuasive value for Miller case arguments and specific justice appeal</p>
                                 </div>
                               </div>
                             </div>
                           </div>
                         </div>
                       )}

                      {step.id === 6 && (
                        <div className="space-y-6">
                          {/* Real Documented Stories */}
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-pink-800">Real Documented Stories</h4>
                              <button className="inline-flex items-center px-3 py-2 bg-pink-600 text-white text-sm font-medium rounded-md hover:bg-pink-700 transition-colors">
                                <Search className="w-4 h-4 mr-2" />
                                Find More Stories
                              </button>
                            </div>
                            <div className="space-y-4">
                              {(step.mockData?.primaryStories || []).map((story, idx) => (
                                <div key={idx} className="border rounded-lg p-4 bg-pink-50">
                                  <div className="flex items-start space-x-3 mb-3">
                                    <Heart className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <h6 className="font-medium text-pink-800">{story.family || story.community}</h6>
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
                              
                              {/* Additional Real Stories */}
                              <div className="border rounded-lg p-4 bg-pink-50">
                                <div className="flex items-start space-x-3 mb-3">
                                  <FileText className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-medium text-pink-800">The Yoder Family Legacy - Wisconsin v. Yoder (1972)</h6>
                                    <p className="text-sm text-pink-700 mt-1">Jonas Yoder, age 52, Amish farmer who refused to send his 15-year-old daughter to high school. Faced criminal prosecution and $5 fines that threatened his family's survival.</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h6 className="text-xs font-medium text-pink-700 mb-1">Historical Impact</h6>
                                    <p className="text-xs text-pink-600">Supreme Court unanimously ruled that Amish children's religious freedom outweighed state's interest in compulsory education. Created precedent for religious accommodation.</p>
                                  </div>
                                  <div>
                                    <h6 className="text-xs font-medium text-pink-700 mb-1">Parallel to Miller</h6>
                                    <p className="text-xs text-pink-600">Same community, same constitutional principles, same government overreach into religious practice. Miller families face 470x higher fines than Yoder.</p>
                                  </div>
                                </div>
                              </div>

                              <div className="border rounded-lg p-4 bg-pink-50">
                                <div className="flex items-start space-x-3 mb-3">
                                  <MessageSquare className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-medium text-pink-800">Sarah Hostetler - 8 Years Old</h6>
                                    <p className="text-sm text-pink-700 mt-1">Third-grader at Amish school who asked her father "Why do the English want to hurt us?" when she saw state officials at their school. Documented in court filings.</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h6 className="text-xs font-medium text-pink-700 mb-1">Child's Perspective</h6>
                                    <p className="text-xs text-pink-600">Represents innocence caught in government overreach. Child doesn't understand why her religious beliefs make her a target.</p>
                                  </div>
                                  <div>
                                    <h6 className="text-xs font-medium text-pink-700 mb-1">Justice Appeal</h6>
                                    <p className="text-xs text-pink-600">Particularly resonant for justices with children/grandchildren. Shows human face of constitutional principles.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Constitutional Hypotheticals */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-blue-800">Constitutional Hypotheticals: Parallel Scenarios</h4>
                            <p className="text-sm text-gray-600 mb-4">Legal hypotheticals demonstrating how the Miller principle applies across different constitutional contexts</p>
                            <div className="space-y-4">
                              
                              {/* Historical Parallels */}
                              <div className="border rounded-lg p-4 bg-blue-50">
                                <div className="flex items-start space-x-3 mb-3">
                                  <History className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-medium text-blue-800">The Catholic School Hypothetical (1920s)</h6>
                                    <p className="text-sm text-blue-700 mt-1">Italian Catholic immigrants in Massachusetts establish parochial schools consistent with their faith traditions. The state mandates secular health curriculum that conflicts with Catholic doctrine on human sexuality and medical intervention. The state offers medical exemptions for "scientific" objections but not religious ones.</p>
                                  </div>
                                </div>
                                <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                                  <strong>Constitutional Parallel:</strong> Government targeting of religious practice while accommodating secular objections - identical to Miller's religious exemption denial
                                </div>
                              </div>

                              <div className="border rounded-lg p-4 bg-blue-50">
                                <div className="flex items-start space-x-3 mb-3">
                                  <Scale className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-medium text-blue-800">The Minority Church Hypothetical (Jim Crow Era)</h6>
                                    <p className="text-sm text-blue-700 mt-1">African American churches in the South practice traditional healing ministries alongside prayer. State health officials declare these practices "unscientific" and "dangerous to public health." White medical associations receive exemptions for experimental treatments, but Black churches face criminal prosecution.</p>
                                  </div>
                                </div>
                                <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                                  <strong>Constitutional Parallel:</strong> Government power used to suppress minority religious practices while privileging majority secular alternatives
                                </div>
                              </div>

                              <div className="border rounded-lg p-4 bg-blue-50">
                                <div className="flex items-start space-x-3 mb-3">
                                  <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-medium text-blue-800">The Religious School Hypothetical (Modern Era)</h6>
                                    <p className="text-sm text-blue-700 mt-1">A Protestant denomination operates schools based on religious convictions about bodily sanctity and divine healing. The state mandates medical interventions that conflict with the church's theological understanding of human dignity. Secular private schools receive exemptions for "philosophical" objections.</p>
                                  </div>
                                </div>
                                <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                                  <strong>Constitutional Parallel:</strong> Religious institutional autonomy undermined by government mandates that accommodate secular but not religious objections
                                </div>
                              </div>

                              {/* Contemporary Parallels */}
                              <div className="border rounded-lg p-4 bg-purple-50">
                                <div className="flex items-start space-x-3 mb-3">
                                  <Shield className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-medium text-purple-800">The Cultural Community Hypothetical</h6>
                                    <p className="text-sm text-purple-700 mt-1">A tight-knit immigrant community maintains traditional healing practices integral to their cultural and spiritual identity. Government health officials declare these practices "unscientific" while granting exemptions to wealthy families who prefer alternative medicine or homeopathy for "personal choice" reasons.</p>
                                  </div>
                                </div>
                                <div className="text-xs text-purple-600 bg-purple-100 p-2 rounded">
                                  <strong>Constitutional Parallel:</strong> Disparate treatment of minority cultural practices versus majority "lifestyle choices" - equal protection violation
                                </div>
                              </div>

                              <div className="border rounded-lg p-4 bg-purple-50">
                                <div className="flex items-start space-x-3 mb-3">
                                  <Users className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-medium text-purple-800">The Religious Dietary Laws Hypothetical</h6>
                                    <p className="text-sm text-purple-700 mt-1">Jewish communities maintain kosher dietary laws that government nutritionists declare "unscientific" and "potentially harmful." The state mandates specific nutritional interventions that violate kashrut while granting exemptions for secular dietary preferences like veganism or paleo diets.</p>
                                  </div>
                                </div>
                                <div className="text-xs text-purple-600 bg-purple-100 p-2 rounded">
                                  <strong>Constitutional Parallel:</strong> Government interference with religious practice while accommodating secular lifestyle choices - religious targeting
                                </div>
                              </div>

                              <div className="border rounded-lg p-4 bg-purple-50">
                                <div className="flex items-start space-x-3 mb-3">
                                  <AlertTriangle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-medium text-purple-800">The Intersectional Rights Hypothetical</h6>
                                    <p className="text-sm text-purple-700 mt-1">Religious women of various faiths believe certain medical interventions violate their understanding of bodily autonomy rooted in religious conviction. The government says "secular feminist objections to medical coercion are valid, but religious objections are not." This creates a hierarchy of conscience claims.</p>
                                  </div>
                                </div>
                                <div className="text-xs text-purple-600 bg-purple-100 p-2 rounded">
                                  <strong>Constitutional Parallel:</strong> Government privileging secular conscience claims over religious ones - violates neutrality principle
                                </div>
                              </div>

                              {/* Future Implications */}
                              <div className="border rounded-lg p-4 bg-orange-50">
                                <div className="flex items-start space-x-3 mb-3">
                                  <RefreshCw className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-medium text-orange-800">The Precedent Cascade Hypothetical</h6>
                                    <p className="text-sm text-orange-700 mt-1">If Miller loses, future cases arise: Muslim communities face mandates conflicting with Islamic medical ethics; Native American tribes lose sovereignty over traditional healing; Orthodox Jewish schools must violate Sabbath observance; Buddhist meditation centers face forced medication requirements. Each group is told "your religious beliefs don't justify exemption."</p>
                                  </div>
                                </div>
                                <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
                                  <strong>Constitutional Parallel:</strong> Slippery slope toward complete elimination of religious accommodation - Free Exercise Clause becomes dead letter
                                </div>
                              </div>

                              {/* International Comparison */}
                              <div className="border rounded-lg p-4 bg-green-50">
                                <div className="flex items-start space-x-3 mb-3">
                                  <Zap className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h6 className="font-medium text-green-800">The Authoritarian Regime Hypothetical</h6>
                                    <p className="text-sm text-green-700 mt-1">In authoritarian regimes, governments routinely declare minority religious practices "unscientific," "dangerous," or "contrary to public health." Uyghur Muslims in China, Jehovah's Witnesses in Russia, and Christians in North Korea all face similar justifications for religious suppression. The American Constitution was designed to prevent such government overreach.</p>
                                  </div>
                                </div>
                                <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
                                  <strong>Constitutional Parallel:</strong> Free Exercise Clause as bulwark against the very government overreach America was founded to prevent
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Cross-Group Impact Analysis */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-orange-800">Cross-Group Impact: Who Else Gets Hurt?</h4>
                            <p className="text-sm text-gray-600 mb-4">Demonstrating how ruling against the Amish affects other religious and minority communities</p>
                            
                            <div className="space-y-4">
                              {/* Religious Communities */}
                              <div className="border rounded-lg p-4 bg-orange-50">
                                <h5 className="font-medium text-orange-800 mb-3">Religious Communities at Risk</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                                      <div className="font-medium text-sm text-orange-900">Orthodox Jewish Communities</div>
                                      <p className="text-xs text-orange-700 mt-1">Kosher laws, ritual purity requirements, Sabbath observance could all be deemed "unscientific" by government health officials.</p>
                                      <div className="text-xs text-orange-600 mt-2"><strong>Impact:</strong> 400,000+ Orthodox Jews in insular communities</div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                                      <div className="font-medium text-sm text-orange-900">Muslim Communities</div>
                                      <p className="text-xs text-orange-700 mt-1">Halal requirements, prayer schedules, Islamic medical ethics could conflict with government health mandates.</p>
                                      <div className="text-xs text-orange-600 mt-2"><strong>Impact:</strong> 3.3 million Muslims, many in tight-knit communities</div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                                      <div className="font-medium text-sm text-orange-900">Jehovah's Witnesses</div>
                                      <p className="text-xs text-orange-700 mt-1">Blood transfusion prohibitions, other medical restrictions based on biblical interpretation.</p>
                                      <div className="text-xs text-orange-600 mt-2"><strong>Impact:</strong> 1.3 million Jehovah's Witnesses nationwide</div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                                      <div className="font-medium text-sm text-orange-900">Christian Scientists</div>
                                      <p className="text-xs text-orange-700 mt-1">Spiritual healing practices, prayer-based medicine could be eliminated by medical mandates.</p>
                                      <div className="text-xs text-orange-600 mt-2"><strong>Impact:</strong> 85,000+ Christian Scientists in organized churches</div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                                      <div className="font-medium text-sm text-orange-900">Native American Tribes</div>
                                      <p className="text-xs text-orange-700 mt-1">Traditional healing practices, sacred medicine, tribal sovereignty over health decisions.</p>
                                      <div className="text-xs text-orange-600 mt-2"><strong>Impact:</strong> 574 federally recognized tribes with traditional practices</div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                                      <div className="font-medium text-sm text-orange-900">Mennonite & Brethren Communities</div>
                                      <p className="text-xs text-orange-700 mt-1">Similar to Amish - plain communities with traditional healing, simple living, religious medical practices.</p>
                                      <div className="text-xs text-orange-600 mt-2"><strong>Impact:</strong> 500,000+ in related plain communities</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Secular Communities */}
                              <div className="border rounded-lg p-4 bg-green-50">
                                <h5 className="font-medium text-green-800 mb-3">Secular Communities Also Affected</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white p-3 rounded border-l-4 border-green-400">
                                    <div className="font-medium text-sm text-green-900">Philosophical Objectors</div>
                                    <p className="text-xs text-green-700 mt-1">Secular parents with philosophical objections to medical interventions lose protection if religious objections don't count.</p>
                                    <div className="text-xs text-green-600 mt-2"><strong>Logic:</strong> If religious beliefs don't matter, secular beliefs matter even less</div>
                                  </div>
                                  
                                  <div className="bg-white p-3 rounded border-l-4 border-green-400">
                                    <div className="font-medium text-sm text-green-900">Alternative Medicine Communities</div>
                                    <p className="text-xs text-green-700 mt-1">Homeopathy, naturopathy, holistic medicine practitioners face elimination if government decides what's "scientific."</p>
                                    <div className="text-xs text-green-600 mt-2"><strong>Impact:</strong> Millions using alternative medicine approaches</div>
                                  </div>
                                  
                                  <div className="bg-white p-3 rounded border-l-4 border-green-400">
                                    <div className="font-medium text-sm text-green-900">Autism/Special Needs Families</div>
                                    <p className="text-xs text-green-700 mt-1">Families with special medical considerations for disabled children lose accommodation rights.</p>
                                    <div className="text-xs text-green-600 mt-2"><strong>Concern:</strong> Government medical mandates override parental medical judgment</div>
                                  </div>
                                  
                                  <div className="bg-white p-3 rounded border-l-4 border-green-400">
                                    <div className="font-medium text-sm text-green-900">Immigrant Communities</div>
                                    <p className="text-xs text-green-700 mt-1">Traditional healing practices from home countries could be eliminated by American medical requirements.</p>
                                    <div className="text-xs text-green-600 mt-2"><strong>Impact:</strong> Cultural practices spanning generations lost to government mandates</div>
                                  </div>
                                </div>
                              </div>

                              {/* Precedent Cascade */}
                              <div className="border rounded-lg p-4 bg-red-50">
                                <h5 className="font-medium text-red-800 mb-3">The Precedent Cascade Effect</h5>
                                <div className="space-y-3">
                                  <div className="bg-white p-3 rounded">
                                    <div className="font-medium text-sm text-red-900 mb-2">Step 1: Religious Exemptions Eliminated</div>
                                    <p className="text-xs text-red-700">If Amish religious beliefs don't justify exemption from government health mandates, no religious beliefs do.</p>
                                  </div>
                                  
                                  <div className="bg-white p-3 rounded">
                                    <div className="font-medium text-sm text-red-900 mb-2">Step 2: Secular Exemptions Follow</div>
                                    <p className="text-xs text-red-700">If deeply held religious convictions don't matter, secular philosophical objections certainly don't matter.</p>
                                  </div>
                                  
                                  <div className="bg-white p-3 rounded">
                                    <div className="font-medium text-sm text-red-900 mb-2">Step 3: Government Medical Authority Absolute</div>
                                    <p className="text-xs text-red-700">Government becomes final arbiter of all medical decisions, overriding parental rights, religious liberty, and individual conscience.</p>
                                  </div>
                                  
                                  <div className="bg-white p-3 rounded">
                                    <div className="font-medium text-sm text-red-900 mb-2">Step 4: Minority Communities Crushed</div>
                                    <p className="text-xs text-red-700">Insular religious communities, immigrant traditions, alternative medicine practices all eliminated by government "scientific" standards.</p>
                                  </div>
                                </div>
                              </div>

                              {/* The Choice for Justices */}
                              <div className="border rounded-lg p-4 bg-indigo-50">
                                <h5 className="font-medium text-indigo-800 mb-3">The Choice Before the Court</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white p-4 rounded border-l-4 border-red-500">
                                    <h6 className="font-medium text-red-900 mb-2">Rule Against the Amish</h6>
                                    <ul className="text-xs text-red-700 space-y-1">
                                      <li>• Eliminate religious exemptions for millions</li>
                                      <li>• Crush minority religious communities</li>
                                      <li>• Expand government power over conscience</li>
                                      <li>• Destroy centuries of accommodation tradition</li>
                                      <li>• Create precedent for medical authoritarianism</li>
                                    </ul>
                                  </div>
                                  
                                  <div className="bg-white p-4 rounded border-l-4 border-green-500">
                                    <h6 className="font-medium text-green-900 mb-2">Protect Religious Liberty</h6>
                                    <ul className="text-xs text-green-700 space-y-1">
                                      <li>• Preserve accommodation for all faiths</li>
                                      <li>• Protect insular minority communities</li>
                                      <li>• Maintain constitutional balance</li>
                                      <li>• Honor American religious liberty tradition</li>
                                      <li>• Prevent government overreach cascade</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 7 && (
                        <div className="space-y-6">
                          {/* Strategic Argument Architecture */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-indigo-800">Strategic Argument Architecture</h4>
                            <p className="text-sm text-gray-600 mb-4">Multi-layered arguments designed to create cross-ideological coalition while avoiding judicial landmines</p>
                            
                            {/* Core Constitutional Framework */}
                            <div className="border rounded-lg p-4 bg-indigo-50 mb-4">
                              <h5 className="font-medium text-indigo-800 mb-3">Core Constitutional Framework (All Justices)</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div className="bg-white p-3 rounded border-l-4 border-indigo-400">
                                    <div className="font-medium text-sm text-indigo-900">Textual Foundation</div>
                                    <p className="text-xs text-indigo-700 mt-1">"Congress shall make no law...prohibiting the free exercise thereof" - plain text requires government accommodation of religious practice, not mere belief.</p>
                                  </div>
                                  <div className="bg-white p-3 rounded border-l-4 border-indigo-400">
                                    <div className="font-medium text-sm text-indigo-900">Structural Argument</div>
                                    <p className="text-xs text-indigo-700 mt-1">Free Exercise Clause would be meaningless surplusage if it only protected beliefs. Free Speech Clause already protects expression of beliefs.</p>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div className="bg-white p-3 rounded border-l-4 border-indigo-400">
                                    <div className="font-medium text-sm text-indigo-900">Institutional Competence</div>
                                    <p className="text-xs text-indigo-700 mt-1">Courts, not bureaucrats, must determine constitutional boundaries. Health officials lack constitutional expertise to balance religious liberty.</p>
                                  </div>
                                  <div className="bg-white p-3 rounded border-l-4 border-indigo-400">
                                    <div className="font-medium text-sm text-indigo-900">Judicial Minimalism Path</div>
                                    <p className="text-xs text-indigo-700 mt-1">Court can rule narrowly on religious targeting without overturning Smith entirely - provides institutional off-ramp.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Justice-Specific Argument Strategies */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-purple-800">Justice-Specific Argument Strategies</h4>
                            
                            {/* Conservative Justice Arguments */}
                            <div className="mb-6">
                              <h5 className="font-medium text-red-800 mb-3">Conservative Justice Persuasion Matrix</h5>
                              <div className="space-y-4">
                                
                                {/* Thomas Strategy */}
                                <div className="border rounded-lg p-4 bg-red-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium text-red-900">Justice Thomas: Originalist Historical Analysis</h6>
                                    <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">Primary Target</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-red-800">Founding Era Evidence</div>
                                      <ul className="text-xs text-red-700 space-y-1">
                                        <li>• Pennsylvania Frame of Government (1682) - religious accommodation precedent</li>
                                        <li>• Virginia Statute for Religious Freedom (1786) - Jefferson's influence</li>
                                        <li>• First Congress debates - Madison's accommodation intent</li>
                                        <li>• Colonial exemptions for Quakers, Mennonites during war</li>
                                      </ul>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-red-800">Originalist Methodology</div>
                                      <ul className="text-xs text-red-700 space-y-1">
                                        <li>• "Free exercise" meant active practice, not passive belief</li>
                                        <li>• 18th-century understanding included accommodation duty</li>
                                        <li>• Smith decision ignored founding-era evidence</li>
                                        <li>• Government targeting of religion was founders' primary fear</li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
                                    <strong>Key Hook:</strong> "This case allows the Court to restore the original meaning of the Free Exercise Clause that Smith abandoned."
                                  </div>
                                </div>

                                {/* Alito Strategy */}
                                <div className="border rounded-lg p-4 bg-red-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium text-red-900">Justice Alito: Religious Liberty Champion</h6>
                                    <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">Natural Ally</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-red-800">Anti-Smith Precedent</div>
                                      <ul className="text-xs text-red-700 space-y-1">
                                        <li>• Hobby Lobby - religious exercise includes conduct</li>
                                        <li>• Masterpiece Cakeshop - government hostility analysis</li>
                                        <li>• Trinity Lutheran - religious status discrimination</li>
                                        <li>• Lukumi - religious targeting prohibition</li>
                                      </ul>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-red-800">Institutional Protection</div>
                                      <ul className="text-xs text-red-700 space-y-1">
                                        <li>• Religious schools as core institutional autonomy</li>
                                        <li>• Parental rights in religious education</li>
                                        <li>• Community self-governance principles</li>
                                        <li>• Protection from secular orthodoxy imposition</li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
                                    <strong>Key Hook:</strong> "Government cannot impose secular medical orthodoxy on religious communities that pose no threat to others."
                                  </div>
                                </div>

                                {/* Gorsuch Strategy */}
                                <div className="border rounded-lg p-4 bg-red-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium text-red-900">Justice Gorsuch: Individual Liberty & Smith Critic</h6>
                                    <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">Explicit Smith Opponent</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-red-800">Individual Autonomy</div>
                                      <ul className="text-xs text-red-700 space-y-1">
                                        <li>• Bodily autonomy intersects with religious conscience</li>
                                        <li>• Individual dignity requires accommodation</li>
                                        <li>• Government coercion violates personal sovereignty</li>
                                        <li>• Religious identity inseparable from practice</li>
                                      </ul>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-red-800">Smith Critique Integration</div>
                                      <ul className="text-xs text-red-700 space-y-1">
                                        <li>• Kennedy v. Bremerton - Smith limitations acknowledged</li>
                                        <li>• Bostock methodology - textual meaning controls</li>
                                        <li>• Constitutional avoidance - narrow ruling possible</li>
                                        <li>• Precedent evolution - Smith was wrong turn</li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
                                    <strong>Key Hook:</strong> "The Constitution protects the right to live according to one's deepest convictions, not merely to hold them privately."
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Swing Justice Arguments */}
                            <div className="mb-6">
                              <h5 className="font-medium text-yellow-800 mb-3">Swing Justice Persuasion Strategy</h5>
                              <div className="space-y-4">
                                
                                {/* Roberts Strategy */}
                                <div className="border rounded-lg p-4 bg-yellow-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium text-yellow-900">Chief Justice Roberts: Institutional Minimalism</h6>
                                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Critical Swing Vote</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-yellow-800">Narrow Ruling Path</div>
                                      <ul className="text-xs text-yellow-700 space-y-1">
                                        <li>• Rule on religious targeting without Smith reversal</li>
                                        <li>• Lukumi precedent provides established framework</li>
                                        <li>• Limited to insular religious communities</li>
                                        <li>• Avoid broad constitutional revolution</li>
                                      </ul>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-yellow-800">Institutional Concerns</div>
                                      <ul className="text-xs text-yellow-700 space-y-1">
                                        <li>• Court's legitimacy enhanced by protecting minorities</li>
                                        <li>• Precedent stability through incremental change</li>
                                        <li>• Judicial restraint - limited factual scope</li>
                                        <li>• Bipartisan appeal of religious accommodation</li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
                                    <strong>Key Hook:</strong> "The Court can protect religious liberty without destabilizing precedent by applying existing religious targeting doctrine."
                                  </div>
                                </div>

                                {/* Barrett Strategy */}
                                <div className="border rounded-lg p-4 bg-yellow-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium text-yellow-900">Justice Barrett: Religious Liberty Scholar</h6>
                                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Likely Ally</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-yellow-800">Academic Expertise</div>
                                      <ul className="text-xs text-yellow-700 space-y-1">
                                        <li>• Constitutional law scholarship on religious liberty</li>
                                        <li>• Understanding of Free Exercise Clause evolution</li>
                                        <li>• Appreciation for doctrinal complexity</li>
                                        <li>• Institutional religious autonomy principles</li>
                                      </ul>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-yellow-800">Practical Concerns</div>
                                      <ul className="text-xs text-yellow-700 space-y-1">
                                        <li>• Mother's perspective on parental rights</li>
                                        <li>• Catholic understanding of religious practice</li>
                                        <li>• Judicial minimalism preference</li>
                                        <li>• Precedent respect with principled evolution</li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
                                    <strong>Key Hook:</strong> "Religious practice, not just belief, deserves constitutional protection - especially for insular communities."
                                  </div>
                                </div>

                                {/* Kavanaugh Strategy */}
                                <div className="border rounded-lg p-4 bg-yellow-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium text-yellow-900">Justice Kavanaugh: Precedent & Tradition</h6>
                                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Persuadable</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-yellow-800">Historical Tradition</div>
                                      <ul className="text-xs text-yellow-700 space-y-1">
                                        <li>• American tradition of religious accommodation</li>
                                        <li>• Yoder precedent for Amish community</li>
                                        <li>• Centuries of conscientious objection recognition</li>
                                        <li>• Founding-era accommodation practices</li>
                                      </ul>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-yellow-800">Precedent Evolution</div>
                                      <ul className="text-xs text-yellow-700 space-y-1">
                                        <li>• Smith as aberration from accommodation tradition</li>
                                        <li>• Recent cases moving away from Smith</li>
                                        <li>• Doctrinal coherence requires accommodation</li>
                                        <li>• Gradual precedent correction, not revolution</li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
                                    <strong>Key Hook:</strong> "This case returns the Court to America's historical tradition of religious accommodation."
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Liberal Justice Arguments */}
                            <div className="mb-6">
                              <h5 className="font-medium text-blue-800 mb-3">Liberal Justice Persuasion Strategy</h5>
                              <div className="space-y-4">
                                
                                {/* Sotomayor Strategy */}
                                <div className="border rounded-lg p-4 bg-blue-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium text-blue-900">Justice Sotomayor: Minority Rights Champion</h6>
                                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Minority Rights Appeal</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-blue-800">Minority Protection</div>
                                      <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• Amish as vulnerable religious minority</li>
                                        <li>• Government targeting of insular communities</li>
                                        <li>• Parallel to racial/ethnic minority protection</li>
                                        <li>• Cultural preservation vs. assimilation pressure</li>
                                      </ul>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-blue-800">Equal Protection Analysis</div>
                                      <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• Secular exemptions prove religious animus</li>
                                        <li>• Disparate impact on religious minorities</li>
                                        <li>• Government accommodation duty</li>
                                        <li>• Intersectional identity protection</li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                                    <strong>Key Hook:</strong> "The Constitution requires special protection for vulnerable religious minorities facing government targeting."
                                  </div>
                                </div>

                                {/* Kagan Strategy */}
                                <div className="border rounded-lg p-4 bg-blue-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium text-blue-900">Justice Kagan: Pragmatic Balancing</h6>
                                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Pragmatic Appeal</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-blue-800">Practical Accommodation</div>
                                      <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• Limited public health risk from insular community</li>
                                        <li>• Accommodation doesn't undermine broader policy</li>
                                        <li>• Workable constitutional standard</li>
                                        <li>• Prevents religious liberty erosion</li>
                                      </ul>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-blue-800">Jewish Heritage Connection</div>
                                      <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• Jewish history of religious persecution</li>
                                        <li>• Kosher/kashrut parallel to Amish practices</li>
                                        <li>• Religious minority solidarity</li>
                                        <li>• Constitutional protection necessity</li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                                    <strong>Key Hook:</strong> "Religious accommodation serves both constitutional principles and practical governance."
                                  </div>
                                </div>

                                {/* Jackson Strategy */}
                                <div className="border rounded-lg p-4 bg-blue-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="font-medium text-blue-900">Justice Jackson: Intersectional Rights</h6>
                                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Rights Intersection</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-blue-800">Bodily Autonomy Bridge</div>
                                      <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• Religious bodily autonomy parallel to reproductive rights</li>
                                        <li>• Government coercion of medical decisions</li>
                                        <li>• Intersectional religious and gender identity</li>
                                        <li>• Individual dignity and self-determination</li>
                                      </ul>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-blue-800">Systemic Oppression</div>
                                      <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• Government power used to oppress minorities</li>
                                        <li>• Historical pattern of religious targeting</li>
                                        <li>• Structural inequality in exemption system</li>
                                        <li>• Constitutional check on government overreach</li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                                    <strong>Key Hook:</strong> "Religious liberty and bodily autonomy intersect to protect individual dignity from government coercion."
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Argument Landmines to Avoid */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-red-800">Strategic Landmines to Avoid</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <h5 className="font-medium text-red-700">Arguments That Backfire</h5>
                                <div className="space-y-2">
                                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                                    <div className="font-medium text-sm text-red-800">❌ Anti-Vaccine Rhetoric</div>
                                    <p className="text-xs text-red-600 mt-1">Avoid appearing anti-science or anti-vaccine. Frame as religious accommodation, not medical skepticism.</p>
                                  </div>
                                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                                    <div className="font-medium text-sm text-red-800">❌ Broad Smith Reversal</div>
                                    <p className="text-xs text-red-600 mt-1">Don't demand complete Smith overturn. Gives Roberts/moderates easy way to reject case.</p>
                                  </div>
                                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                                    <div className="font-medium text-sm text-red-800">❌ Christian Nationalism</div>
                                    <p className="text-xs text-red-600 mt-1">Avoid appearing to privilege Christian beliefs. Emphasize universal religious liberty principles.</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h5 className="font-medium text-green-700">Strategic Positioning</h5>
                                <div className="space-y-2">
                                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                                    <div className="font-medium text-sm text-green-800">✓ Religious Targeting Focus</div>
                                    <p className="text-xs text-green-600 mt-1">Emphasize government targeting of religion while allowing secular exemptions.</p>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                                    <div className="font-medium text-sm text-green-800">✓ Narrow Factual Scope</div>
                                    <p className="text-xs text-green-600 mt-1">Limit to insular religious communities with minimal public health impact.</p>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                                    <div className="font-medium text-sm text-green-800">✓ Cross-Ideological Appeal</div>
                                    <p className="text-xs text-green-600 mt-1">Frame as protecting all religious minorities, not just conservative Christians.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Argument Synthesis Matrix */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-green-800">Argument Synthesis Matrix</h4>
                            <p className="text-sm text-gray-600 mb-4">How different arguments work together to create overwhelming persuasive force</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h5 className="font-medium text-green-800 mb-2">Constitutional Foundation</h5>
                                <ul className="text-xs text-green-700 space-y-1">
                                  <li>• Text: Free Exercise requires practice protection</li>
                                  <li>• History: Founding-era accommodation tradition</li>
                                  <li>• Structure: Institutional competence of courts</li>
                                  <li>• Precedent: Religious targeting doctrine</li>
                                </ul>
                              </div>
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h5 className="font-medium text-green-800 mb-2">Practical Application</h5>
                                <ul className="text-xs text-green-700 space-y-1">
                                  <li>• Narrow: Limited to insular communities</li>
                                  <li>• Workable: Clear religious targeting standard</li>
                                  <li>• Balanced: Protects minorities, preserves government authority</li>
                                  <li>• Precedential: Builds on existing doctrine</li>
                                </ul>
                              </div>
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h5 className="font-medium text-green-800 mb-2">Moral Imperative</h5>
                                <ul className="text-xs text-green-700 space-y-1">
                                  <li>• Human: Real families facing persecution</li>
                                  <li>• Historical: American religious liberty tradition</li>
                                  <li>• Universal: Protects all religious minorities</li>
                                  <li>• Institutional: Court's role as minority protector</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 8 && (
                        <div className="space-y-6">
                          {/* Threat Assessment Overview */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-orange-800">Counter-Argument Threat Assessment</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                              <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-3xl font-bold text-orange-600">{step.mockData?.counterArgumentsIdentified || 23}</div>
                                <div className="text-sm text-gray-600">Arguments Identified</div>
                              </div>
                              <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-3xl font-bold text-red-600">{step.mockData?.criticalThreats || 7}</div>
                                <div className="text-sm text-gray-600">Critical Threats</div>
                              </div>
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-3xl font-bold text-blue-600">{step.mockData?.strategicResponses || 15}</div>
                                <div className="text-sm text-gray-600">Strategic Responses</div>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">{step.mockData?.inoculationStrategies || 12}</div>
                                <div className="text-sm text-gray-600">Inoculation Strategies</div>
                              </div>
                            </div>
                          </div>

                          {/* High Threat Arguments */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-red-800">Critical Threat Arguments (Must Address)</h4>
                            <div className="space-y-4">
                              <div className="border rounded-lg p-4 bg-red-50">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-red-900">Public Health Emergency Argument</h5>
                                  <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded">Threat Level: Critical</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h6 className="text-sm font-medium text-red-800 mb-2">Opposition Argument</h6>
                                    <p className="text-xs text-red-700">"Government has compelling interest in protecting children from preventable diseases. Religious beliefs cannot override public health requirements, especially when children's lives are at stake."</p>
                                  </div>
                                  <div>
                                    <h6 className="text-sm font-medium text-red-800 mb-2">Strategic Response</h6>
                                    <p className="text-xs text-red-700"><strong>Direct Confrontation:</strong> Emphasize insular community (minimal public contact), medical exemptions prove non-emergency status, and historical accommodation during actual emergencies.</p>
                                  </div>
                                </div>
                                <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
                                  <strong>Key Counter:</strong> "If this were truly an emergency, the state would not allow medical exemptions for secular reasons while targeting religious ones."
                                </div>
                              </div>

                              <div className="border rounded-lg p-4 bg-red-50">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-red-900">Smith Precedent Defense</h5>
                                  <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded">Threat Level: Critical</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h6 className="text-sm font-medium text-red-800 mb-2">Opposition Argument</h6>
                                    <p className="text-xs text-red-700">"Employment Division v. Smith clearly establishes that neutral, generally applicable laws do not violate the Free Exercise Clause. Vaccine requirements apply to everyone equally."</p>
                                  </div>
                                  <div>
                                    <h6 className="text-sm font-medium text-red-800 mb-2">Strategic Response</h6>
                                    <p className="text-xs text-red-700"><strong>Reframing:</strong> Focus on religious targeting (medical exemptions prove lack of general applicability) rather than demanding Smith reversal. Use Lukumi precedent.</p>
                                  </div>
                                </div>
                                <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
                                  <strong>Key Counter:</strong> "Smith requires neutrality and general applicability - medical exemptions destroy both requirements."
                                </div>
                              </div>

                              <div className="border rounded-lg p-4 bg-red-50">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-red-900">Slippery Slope Argument</h5>
                                  <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded">Threat Level: Critical</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h6 className="text-sm font-medium text-red-800 mb-2">Opposition Argument</h6>
                                    <p className="text-xs text-red-700">"Religious exemptions will undermine all public health measures. Every religious group will claim exemptions from safety requirements, creating chaos and endangering public welfare."</p>
                                  </div>
                                  <div>
                                    <h6 className="text-sm font-medium text-red-800 mb-2">Strategic Response</h6>
                                    <p className="text-xs text-red-700"><strong>Inoculation:</strong> Provide clear limiting principles (insular communities, religious targeting, historical accommodation). Emphasize narrow ruling scope.</p>
                                  </div>
                                </div>
                                <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
                                  <strong>Key Counter:</strong> "Court can protect religious liberty with clear limiting principles - insular communities with minimal public health impact."
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Medium Threat Arguments */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-yellow-800">Medium Threat Arguments (Inoculate Against)</h4>
                            <div className="space-y-3">
                              <div className="border rounded-lg p-3 bg-yellow-50">
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className="font-medium text-yellow-900">Equal Treatment Argument</h6>
                                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded">Inoculate</span>
                                </div>
                                <p className="text-xs text-yellow-700"><strong>Opposition:</strong> "Religious beliefs shouldn't get special treatment over secular objections."</p>
                                <p className="text-xs text-yellow-600 mt-1"><strong>Inoculation:</strong> "Constitution specifically protects religious exercise - not all beliefs are constitutionally equivalent."</p>
                              </div>

                              <div className="border rounded-lg p-3 bg-yellow-50">
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className="font-medium text-yellow-900">Anti-Science Framing</h6>
                                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded">Inoculate</span>
                                </div>
                                <p className="text-xs text-yellow-700"><strong>Opposition:</strong> "Amish are anti-vaccine and anti-medical science."</p>
                                <p className="text-xs text-yellow-600 mt-1"><strong>Inoculation:</strong> "This is about religious accommodation, not medical skepticism. Amish accept modern medicine when consistent with faith."</p>
                              </div>

                              <div className="border rounded-lg p-3 bg-yellow-50">
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className="font-medium text-yellow-900">Child Welfare Concerns</h6>
                                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded">Inoculate</span>
                                </div>
                                <p className="text-xs text-yellow-700"><strong>Opposition:</strong> "Parents are putting children at risk for religious reasons."</p>
                                <p className="text-xs text-yellow-600 mt-1"><strong>Inoculation:</strong> "Parental rights include religious upbringing. Yoder precedent protects Amish child-rearing practices."</p>
                              </div>
                            </div>
                          </div>

                          {/* Low Threat Arguments */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-green-800">Low Threat Arguments (Avoid Engaging)</h4>
                            <div className="space-y-3">
                              <div className="border rounded-lg p-3 bg-green-50">
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className="font-medium text-green-900">COVID Politics</h6>
                                  <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">Avoid</span>
                                </div>
                                <p className="text-xs text-green-700"><strong>Why Avoid:</strong> Links case to controversial pandemic politics. Keep focus on traditional religious liberty and historical accommodation.</p>
                              </div>

                              <div className="border rounded-lg p-3 bg-green-50">
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className="font-medium text-green-900">Religious Targeting Claims</h6>
                                  <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">Avoid</span>
                                </div>
                                <p className="text-xs text-green-700"><strong>Why Avoid:</strong> May seem paranoid without clear evidence. Focus on neutral legal principles rather than claiming persecution.</p>
                              </div>

                              <div className="border rounded-lg p-3 bg-green-50">
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className="font-medium text-green-900">Broad Constitutional Revolution</h6>
                                  <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">Avoid</span>
                                </div>
                                <p className="text-xs text-green-700"><strong>Why Avoid:</strong> Demanding complete Smith reversal gives moderates easy rejection. Focus on narrow religious targeting doctrine.</p>
                              </div>
                            </div>
                          </div>

                          {/* Response Strategy Matrix */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-purple-800">Response Strategy Matrix</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-red-50 p-4 rounded-lg">
                                <h5 className="font-medium text-red-800 mb-2">Direct Confrontation</h5>
                                <ul className="text-xs text-red-700 space-y-1">
                                  <li>• Address head-on with strong evidence</li>
                                  <li>• Dedicate brief section to response</li>
                                  <li>• Provide multiple counter-arguments</li>
                                  <li>• Use strongest precedents and facts</li>
                                </ul>
                              </div>
                              <div className="bg-yellow-50 p-4 rounded-lg">
                                <h5 className="font-medium text-yellow-800 mb-2">Inoculation Strategy</h5>
                                <ul className="text-xs text-yellow-700 space-y-1">
                                  <li>• Acknowledge and defuse quickly</li>
                                  <li>• Don't dwell on opposition argument</li>
                                  <li>• Redirect to stronger ground</li>
                                  <li>• Use concession-and-contrast technique</li>
                                </ul>
                              </div>
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h5 className="font-medium text-green-800 mb-2">Avoidance Tactics</h5>
                                <ul className="text-xs text-green-700 space-y-1">
                                  <li>• Don't engage weak opposition arguments</li>
                                  <li>• Stay focused on strongest case</li>
                                  <li>• Avoid defensive posture</li>
                                  <li>• Maintain offensive momentum</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 9 && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Citation Verification Results</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-teal-50 rounded-lg">
                              <div className="text-xl font-bold text-teal-600">{step.mockData?.citationsChecked || 247}</div>
                              <div className="text-xs text-gray-600">Citations Checked</div>
                            </div>
                            <div className="text-center p-3 bg-teal-50 rounded-lg">
                              <div className="text-xl font-bold text-teal-600">{step.mockData?.precedentsVerified || 89}</div>
                              <div className="text-xs text-gray-600">Precedents Verified</div>
                            </div>
                            <div className="text-center p-3 bg-teal-50 rounded-lg">
                              <div className="text-xl font-bold text-teal-600">{step.mockData?.quotesValidated || 156}</div>
                              <div className="text-xs text-gray-600">Quotes Validated</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-xl font-bold text-green-600">{step.mockData?.accuracyScore || 99.7}%</div>
                              <div className="text-xs text-gray-600">Accuracy Score</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === 10 && (
                        <div className="space-y-6">
                          {/* Brief Overview */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-3">AI-Generated Brief: Miller v. McDonald</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                                <div className="text-xl font-bold text-indigo-600">{step.mockData?.totalWordCount || 10952}</div>
                                <div className="text-xs text-gray-600">Total Words</div>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-xl font-bold text-green-600">{step.mockData?.overallPersuasionScore || 92}%</div>
                                <div className="text-xs text-gray-600">Persuasion Score</div>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-xl font-bold text-blue-600">{step.mockData?.briefSections?.length || 8}</div>
                                <div className="text-xs text-gray-600">Sections</div>
                              </div>
                            </div>
                          </div>

                          {/* Brief Structure */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-indigo-800">Brief Structure & Content</h4>
                            
                            {/* Shepardizing Legend */}
                            <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                              <p className="font-medium text-blue-900 mb-2">📚 Citation Status (Shepardized)</p>
                              <div className="flex flex-wrap gap-3 text-xs">
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                                  ✓ Good Law - Cited positively, no negative treatment
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                  ⚠ Criticized - Questioned by later decisions, use with caution
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800">
                                  ✗ Overruled - No longer good law
                                </span>
                              </div>
                              <p className="text-xs text-blue-700 mt-2">All citations have been shepardized through December 2024 to ensure accuracy and reliability.</p>
                            </div>
                            
                            {/* Section Management Controls */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                              <div className="flex items-center justify-between mb-3">
                                <h6 className="font-medium text-blue-900">📝 Section Management</h6>
                                <button
                                  onClick={() => setIsAddingSectionMode(!isAddingSectionMode)}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  {isAddingSectionMode ? 'Cancel' : 'Add Section'}
                                </button>
                              </div>
                              
                              {isAddingSectionMode && (
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium text-blue-800 mb-2">
                                      Describe what you want to add to the brief:
                                    </label>
                                    <div className="flex space-x-2">
                                      <textarea
                                        value={newSectionInput}
                                        onChange={(e) => setNewSectionInput(e.target.value)}
                                        placeholder="E.g., 'Add a section about international human rights law supporting religious accommodation' or 'Include analysis of how this affects other religious minorities'"
                                        className="flex-1 text-sm px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows={3}
                                      />
                                      {audioSupported && (
                                        <button
                                          onClick={handleAudioInput}
                                          className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            isRecording 
                                              ? 'bg-red-600 text-white animate-pulse' 
                                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                          }`}
                                        >
                                          {isRecording ? '🔴 Recording...' : '🎤 Voice'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                                                         <div className="text-xs text-blue-600">
                                       <p className="font-medium mb-1">AI will automatically:</p>
                                       <ul className="list-disc list-inside space-y-0.5">
                                         <li>Apply Solicitor General formatting</li>
                                         <li>Use Miller v. McDonald case facts</li>
                                         <li>Include proper citations & shepardizing</li>
                                         <li>Follow constitutional analysis framework</li>
                                         <li>Target appropriate justices</li>
                                       </ul>
                                       <div className="mt-3 p-2 bg-blue-100 rounded">
                                         <p className="font-medium mb-1">Example prompts:</p>
                                         <div className="space-y-1 text-xs">
                                           <button 
                                             onClick={() => setNewSectionInput("Add analysis of how this ruling would affect other religious minorities like Orthodox Jews and Muslims")}
                                             className="block text-left text-blue-700 hover:text-blue-900 underline"
                                           >
                                             "Add analysis of how this ruling would affect other religious minorities..."
                                           </button>
                                           <button 
                                             onClick={() => setNewSectionInput("Include international human rights law supporting religious accommodation")}
                                             className="block text-left text-blue-700 hover:text-blue-900 underline"
                                           >
                                             "Include international human rights law supporting religious accommodation"
                                           </button>
                                           <button 
                                             onClick={() => setNewSectionInput("Add specific arguments targeting Justice Barrett's originalist approach")}
                                             className="block text-left text-blue-700 hover:text-blue-900 underline"
                                           >
                                             "Add specific arguments targeting Justice Barrett's originalist approach"
                                           </button>
                                         </div>
                                       </div>
                                     </div>
                                    <button
                                      onClick={addCustomSection}
                                      disabled={!newSectionInput.trim()}
                                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                      Generate Section
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="space-y-4">
                              
                              {/* Question Presented */}
                              <div className="border rounded-lg p-4 bg-indigo-50">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-indigo-900">QUESTION PRESENTED</h5>
                                  <button 
                                    onClick={() => setExpandedBriefSection(expandedBriefSection === 'question' ? null : 'question')}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                                  >
                                    {expandedBriefSection === 'question' ? 'Collapse' : 'Expand Full Text'}
                                  </button>
                                </div>
                                <div className="bg-white p-6 rounded border font-serif">
                                  <p className="text-sm text-gray-800 leading-relaxed text-justify">
                                    Whether <em>Employment Division v. Smith</em>, 494 U.S. 872 (1990), should be limited or overruled when a state law targets religious practice by providing medical exemptions for secular reasons while denying religious exemptions for sincere religious beliefs about vaccination.
                                  </p>
                                  {expandedBriefSection === 'question' && (
                                    <div className="mt-6 pt-4 border-t">
                                      <div className="text-sm text-gray-600 space-y-3 font-serif">
                                        <p className="font-semibold">ALTERNATIVE FORMULATIONS:</p>
                                        <p className="pl-4 text-justify leading-relaxed">1. Whether a state law that provides medical exemptions from vaccination requirements while categorically denying religious exemptions violates the Free Exercise Clause of the First Amendment.</p>
                                        <p className="pl-4 text-justify leading-relaxed">2. Whether <em>Employment Division v. Smith</em> permits states to target religious practice for disfavored treatment while accommodating secular objections to generally applicable laws.</p>
                                        <p className="pl-4 text-justify leading-relaxed">3. Whether the Free Exercise Clause requires accommodation of sincere religious beliefs when the government provides secular exemptions from the same legal requirement.</p>
                                      </div>
                                      
                                      {/* Chat Interface */}
                                      <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-3">
                                          <h6 className="font-medium text-gray-800 text-sm">💬 Discuss This Section</h6>
                                          <span className="text-xs text-gray-500">AI Legal Assistant</span>
                                        </div>
                                        
                                        {/* Chat Messages */}
                                        {briefSectionChats['question'] && briefSectionChats['question'].length > 0 && (
                                          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                                            {briefSectionChats['question'].map((message, index) => (
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
                                            value={chatInputs['question'] || ''}
                                            onChange={(e) => setChatInputs(prev => ({...prev, question: e.target.value}))}
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter') {
                                                handleBriefSectionChat('question', chatInputs['question'] || '');
                                              }
                                            }}
                                            className="flex-1 text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />
                                          <button
                                            onClick={() => handleBriefSectionChat('question', chatInputs['question'] || '')}
                                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          >
                                            Send
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Summary of Argument */}
                              <div className="border rounded-lg p-4 bg-indigo-50">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-indigo-900">SUMMARY OF ARGUMENT</h5>
                                  <button 
                                    onClick={() => setExpandedBriefSection(expandedBriefSection === 'summary' ? null : 'summary')}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                                  >
                                    {expandedBriefSection === 'summary' ? 'Collapse' : 'Expand Full Text'}
                                  </button>
                                </div>
                                <div className="bg-white p-6 rounded border font-serif">
                                  {expandedBriefSection !== 'summary' ? (
                                    <div className="space-y-4">
                                      <p className="text-sm text-gray-800 leading-relaxed text-justify">
                                        <span className="font-semibold">The Free Exercise Clause protects religious practice, not mere belief.</span> For over two centuries, America has accommodated religious minorities like the Amish, recognizing that religious liberty requires more than tolerance—it demands respect for sincere religious practice.
                                      </p>
                                      <p className="text-sm text-gray-800 leading-relaxed text-justify">
                                        <span className="font-semibold">New York's vaccine mandate violates the Constitution's neutrality requirement.</span> By granting medical exemptions for secular reasons while denying religious exemptions for sincere faith-based objections, the state has created a system that targets and discriminates against religious practice.
                                      </p>
                                      <p className="text-sm text-gray-800 leading-relaxed text-justify">
                                        <span className="font-semibold">This Court should protect religious minorities from government overreach.</span> The Amish community poses minimal public health risk, seeks only to live according to their faith, and deserves the same constitutional protection this Court has historically provided to religious minorities facing government persecution.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-800 space-y-6 leading-relaxed">
                                      <div className="space-y-4">
                                        <p className="text-justify">
                                          <span className="font-semibold">I. The Free Exercise Clause Protects Religious Practice, Not Mere Belief.</span> The First Amendment's protection of religious exercise would be meaningless surplusage if it extended only to beliefs and not to conduct. From the founding era through today, America has recognized that religious liberty requires accommodation of sincere religious practice, especially for insular minority communities like the Amish who pose minimal threat to compelling government interests.
                                        </p>
                                        <p className="text-justify">
                                          This Court's decision in <em>Wisconsin v. Yoder</em>, 406 U.S. 205 (1972) <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>, established that the Amish way of life deserves constitutional protection as "not merely a matter of personal preference, but one of deep religious conviction, shared by an organized group, and intimately related to daily living." The same principles that protected Amish education practices in <em>Yoder</em> must protect their religious medical practices today.
                                        </p>
                                      </div>
                                      
                                      <div className="space-y-4">
                                        <p className="text-justify">
                                          <span className="font-semibold">II. New York's Vaccine Mandate Violates Religious Neutrality and General Applicability.</span> Even under <em>Employment Division v. Smith</em>, 494 U.S. 872 (1990) <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-1">⚠ Criticized</span>, laws that are neither neutral nor generally applicable must satisfy strict scrutiny. <em>Church of Lukumi Babalu Aye v. Hialeah</em>, 508 U.S. 520 (1993) <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>. New York's law fails both requirements by preserving medical exemptions for secular health reasons while categorically eliminating religious exemptions.
                                        </p>
                                        <p className="text-justify">
                                          This selective accommodation creates a "religious gerrymander" that targets religious practice for disfavored treatment. When the government grants exemptions for secular reasons but denies them for religious reasons, it violates the fundamental constitutional principle of religious neutrality.
                                        </p>
                                      </div>
                                      
                                      <div className="space-y-4">
                                        <p className="text-justify">
                                          <span className="font-semibold">III. Smith Should Be Limited or Overruled to Protect Religious Minorities.</span> Multiple Justices have criticized <em>Smith</em>'s departure from the historical understanding of the Free Exercise Clause. Justice Gorsuch noted in <em>Kennedy v. Bremerton School District</em>, 142 S. Ct. 2407, 2427 (2022) <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span> that <em>Smith</em> "distorted" Free Exercise doctrine, while Justice Alito has repeatedly called for reconsideration of <em>Smith</em>'s cramped view of religious liberty.
                                        </p>
                                        <p className="text-justify">
                                          This Court need not overturn <em>Smith</em> entirely to vindicate religious liberty here. The religious targeting doctrine provides a narrow path forward that protects the Amish while maintaining institutional stability. When laws single out religious practice for discriminatory treatment, strict scrutiny applies regardless of <em>Smith</em>'s general applicability rule.
                                        </p>
                                      </div>
                                      
                                      <div className="space-y-4">
                                        <p className="text-justify">
                                          <span className="font-semibold">IV. The Amish Deserve Constitutional Protection.</span> The Miller family and their Amish community represent the best of American religious diversity—a peaceful, insular group seeking only to live according to their sincere religious convictions. They pose minimal public health risk, maintain their own schools serving only Amish children, and have historically been accommodated by American law.
                                        </p>
                                        <p className="text-justify">
                                          Forcing the Amish to choose between their faith and their children's education violates the same constitutional principles this Court vindicated in <em>Yoder</em> <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>. The Constitution requires accommodation of religious minorities, especially when the government already accommodates secular objections to the same legal requirement.
                                        </p>
                                      </div>
                                      
                                      {/* Chat Interface */}
                                      <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-3">
                                          <h6 className="font-medium text-gray-800 text-sm">💬 Discuss This Section</h6>
                                          <span className="text-xs text-gray-500">AI Legal Assistant</span>
                                        </div>
                                        
                                        {/* Chat Messages */}
                                        {briefSectionChats['summary'] && briefSectionChats['summary'].length > 0 && (
                                          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                                            {briefSectionChats['summary'].map((message, index) => (
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
                                            value={chatInputs['summary'] || ''}
                                            onChange={(e) => setChatInputs(prev => ({...prev, summary: e.target.value}))}
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter') {
                                                handleBriefSectionChat('summary', chatInputs['summary'] || '');
                                              }
                                            }}
                                            className="flex-1 text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />
                                          <button
                                            onClick={() => handleBriefSectionChat('summary', chatInputs['summary'] || '')}
                                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          >
                                            Send
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Argument I */}
                              <div className="border rounded-lg p-4 bg-indigo-50">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-indigo-900">ARGUMENT</h5>
                                  <button 
                                    onClick={() => setExpandedBriefSection(expandedBriefSection === 'argument1' ? null : 'argument1')}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                                  >
                                    {expandedBriefSection === 'argument1' ? 'Collapse' : 'Expand Full Text'}
                                  </button>
                                </div>
                                <div className="bg-white p-6 rounded border font-serif">
                                  {expandedBriefSection !== 'argument1' ? (
                                    <div className="space-y-6">
                                      <div className="text-center">
                                        <h6 className="font-bold text-sm text-gray-900 tracking-wide">I. THE FREE EXERCISE CLAUSE REQUIRES ACCOMMODATION OF SINCERE RELIGIOUS PRACTICE</h6>
                                      </div>
                                      <div className="space-y-4">
                                        <div>
                                          <h6 className="font-semibold text-sm text-gray-800 mb-3">A. The Free Exercise Clause Protects Religious Practice, Not Mere Belief</h6>
                                          <p className="text-sm text-gray-700 leading-relaxed text-justify">
                                            The Free Exercise Clause would be meaningless surplusage if it protected only religious beliefs and not religious practice. As this Court recognized in <em>Wisconsin v. Yoder</em>, the Amish way of life is "not merely a matter of personal preference, but one of deep religious conviction, shared by an organized group, and intimately related to daily living." 406 U.S. 205, 216 (1972)...
                                          </p>
                                        </div>
                                        <div>
                                          <h6 className="font-semibold text-sm text-gray-800 mb-3">B. Historical Practice Supports Religious Accommodation</h6>
                                          <p className="text-sm text-gray-700 leading-relaxed text-justify">
                                            From the founding era through today, America has accommodated religious minorities who cannot in good conscience comply with generally applicable laws. Pennsylvania's Frame of Government (1682) specifically protected religious practice, and the First Congress that drafted the First Amendment understood religious exercise to include conduct, not just belief...
                                          </p>
                                        </div>
                                        <div>
                                          <h6 className="font-semibold text-sm text-gray-800 mb-3">C. The Amish Deserve the Same Protection This Court Provided in <em>Yoder</em></h6>
                                          <p className="text-sm text-gray-700 leading-relaxed text-justify">
                                            This case presents the same constitutional question as <em>Yoder</em>: whether the government can force the Amish to violate their sincere religious beliefs when accommodation would pose minimal burden on state interests. The answer remains the same—the Constitution protects religious minorities from government coercion...
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-800 space-y-8 leading-relaxed">
                                      <div className="text-center mb-6">
                                        <h6 className="font-bold text-base text-gray-900 tracking-wide">I. THE FREE EXERCISE CLAUSE REQUIRES ACCOMMODATION OF SINCERE RELIGIOUS PRACTICE</h6>
                                      </div>
                                      
                                      <div>
                                        <h6 className="font-bold text-gray-900 mb-4 text-center">A. The Free Exercise Clause Protects Religious Practice, Not Mere Belief</h6>
                                        <div className="space-y-4">
                                          <p className="text-justify">
                                            The Free Exercise Clause would be meaningless surplusage if it protected only religious beliefs and not religious practice. As this Court recognized in <em>Wisconsin v. Yoder</em>, the Amish way of life is "not merely a matter of personal preference, but one of deep religious conviction, shared by an organized group, and intimately related to daily living." 406 U.S. 205, 216 (1972) <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>. The Constitution's protection of religious "exercise" necessarily encompasses conduct, not just abstract belief.
                                          </p>
                                          <p>
                                            This textual understanding finds support in the Free Speech Clause, which already protects the expression of religious beliefs. If the Free Exercise Clause protected only belief, it would add nothing to existing First Amendment protections. The Framers included both clauses because they understood that religious exercise involves conduct—the lived practice of faith in daily life.
                                          </p>
                                          <p>
                                            The Amish understanding of medical intervention as inconsistent with divine healing represents precisely the kind of sincere religious conviction that demands constitutional protection. Their beliefs about vaccination are not casual preferences but core religious convictions that shape their entire approach to health, healing, and child-rearing. Forcing them to violate these convictions violates the Free Exercise Clause.
                                          </p>
                                        </div>
                                      </div>

                                      <div>
                                        <h6 className="font-bold text-gray-900 mb-3">B. Historical Practice Supports Religious Accommodation</h6>
                                        <div className="space-y-3">
                                          <p>
                                            From the founding era through today, America has accommodated religious minorities who cannot in good conscience comply with generally applicable laws. Pennsylvania's Frame of Government (1682) specifically protected religious practice, and the First Congress that drafted the First Amendment understood religious exercise to include conduct, not just belief.
                                          </p>
                                          <p>
                                            During the Revolutionary War and War of 1812, Congress accommodated Quaker and Mennonite conscientious objectors to military service. These accommodations occurred during existential threats to the nation, demonstrating that religious liberty has historically trumped even compelling government interests when accommodation is possible.
                                          </p>
                                          <p>
                                            Pennsylvania, where this case arises, has a particularly rich history of religious accommodation. William Penn's "holy experiment" in religious tolerance specifically protected minority religious practices, including those of the Amish and other plain communities. This historical context informs the proper understanding of religious liberty in Pennsylvania and nationwide.
                                          </p>
                                          <p>
                                            The Supreme Court has repeatedly recognized this accommodation tradition. In Sherbert v. Verner, 374 U.S. 398 (1963) <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>, the Court required accommodation of Sabbath observance even when it conflicted with generally applicable employment laws. In Pierce v. Society of Sisters, 268 U.S. 510 (1925) <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>, the Court protected religious education choices against state standardization efforts.
                                          </p>
                                        </div>
                                      </div>

                                      <div>
                                        <h6 className="font-bold text-gray-900 mb-3">C. The Amish Deserve the Same Protection This Court Provided in Yoder</h6>
                                        <div className="space-y-3">
                                          <p>
                                            This case presents the same constitutional question as Yoder: whether the government can force the Amish to violate their sincere religious beliefs when accommodation would pose minimal burden on state interests. The answer remains the same—the Constitution protects religious minorities from government coercion.
                                          </p>
                                          <p>
                                            In Yoder, Wisconsin argued that compulsory education laws served compelling state interests in preparing citizens and protecting children. 406 U.S. at 221 <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>. This Court rejected those arguments, holding that the state's interests, however important, could not override the Amish community's sincere religious convictions about education and child-rearing.
                                          </p>
                                          <p>
                                            The same analysis applies here. New York argues that vaccination requirements serve compelling public health interests. But just as Wisconsin's education interests in Yoder could not justify forcing Amish children into public schools, New York's health interests cannot justify forcing Amish children to receive medical interventions that violate their parents' sincere religious convictions.
                                          </p>
                                          <p>
                                            The Amish community in this case is even more insular than the community in Yoder. The Miller family's children attend Amish schools that serve only Amish children on Amish land with minimal contact with the broader public. Any public health risk is minimal and can be addressed through less restrictive means than forcing religious families to violate their deepest convictions.
                                          </p>
                                          <p>
                                                                                         Yoder's protection of Amish religious practice remains good law <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>. This Court should apply the same constitutional principles here, recognizing that religious liberty requires accommodation of sincere religious conviction, especially for insular minority communities that pose minimal threat to compelling government interests.
                                           </p>
                                         </div>
                                       </div>
                                       
                                       {/* Chat Interface */}
                                       {renderChatInterface('argument1')}
                                     </div>
                                   )}
                                </div>
                              </div>

                              {/* Argument II */}
                              <div className="border rounded-lg p-4 bg-indigo-50">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-indigo-900">II. NEW YORK'S VACCINE MANDATE VIOLATES RELIGIOUS NEUTRALITY</h5>
                                  <button 
                                    onClick={() => setExpandedBriefSection(expandedBriefSection === 'argument2' ? null : 'argument2')}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                                  >
                                    {expandedBriefSection === 'argument2' ? 'Collapse' : 'Expand Full Text'}
                                  </button>
                                </div>
                                <div className="bg-white p-4 rounded border">
                                  {expandedBriefSection !== 'argument2' ? (
                                    <div className="space-y-3">
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">A. Medical Exemptions Destroy Claims of General Applicability</h6>
                                        <p className="text-xs text-gray-700">
                                          "Even under Employment Division v. Smith, laws that are not 'neutral' and 'generally applicable' must satisfy strict scrutiny. Church of Lukumi Babalu Aye v. Hialeah, 508 U.S. 520, 546 (1993). New York's law fails both requirements by allowing medical exemptions for secular reasons while categorically denying religious exemptions..."
                                        </p>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">B. The State Cannot Target Religious Practice for Disfavored Treatment</h6>
                                        <p className="text-xs text-gray-700">
                                          "By preserving secular exemptions while eliminating only religious ones, New York has created a 'gerrymander' that targets religious practice for discriminatory treatment. This violates the fundamental principle that government must remain neutral in matters of religion..."
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-800 space-y-6">
                                      <div>
                                        <h6 className="font-bold text-gray-900 mb-3">A. Medical Exemptions Destroy Claims of General Applicability</h6>
                                        <div className="space-y-3">
                                                                                     <p>
                                             Even under Employment Division v. Smith, laws that are not "neutral" and "generally applicable" must satisfy strict scrutiny. Church of Lukumi Babalu Aye v. Hialeah, 508 U.S. 520, 546 (1993) <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>. New York's law fails both requirements by allowing medical exemptions for secular reasons while categorically denying religious exemptions.
                                           </p>
                                          <p>
                                            A law cannot be "generally applicable" if it "prohibits religious conduct while permitting secular conduct that undermines the government's asserted interests in a similar or greater degree." Lukumi, 508 U.S. at 546-47. New York's vaccination law permits medical exemptions for secular health concerns while prohibiting religious exemptions for faith-based health concerns. This destroys any claim of general applicability.
                                          </p>
                                          <p>
                                            The medical exemption proves that New York does not consider vaccination requirements absolutely necessary for public health. If the state believed vaccination was essential for every child's health and safety, it would not permit any exemptions. By preserving secular exemptions while eliminating religious ones, New York has created a system of selective enforcement that targets religious practice.
                                          </p>
                                          <p>
                                            This Court's decision in Lukumi establishes that laws with secular exemptions cannot claim general applicability when they deny religious exemptions. The Hialeah ordinances in Lukumi prohibited animal sacrifice for religious purposes while permitting animal killing for secular purposes like pest control and food preparation. 508 U.S. at 543-44. Similarly, New York prohibits vaccination refusal for religious purposes while permitting vaccination refusal for secular medical purposes.
                                          </p>
                                        </div>
                                      </div>

                                      <div>
                                        <h6 className="font-bold text-gray-900 mb-3">B. The State Cannot Target Religious Practice for Disfavored Treatment</h6>
                                        <div className="space-y-3">
                                          <p>
                                            By preserving secular exemptions while eliminating only religious ones, New York has created a "religious gerrymander" that targets religious practice for discriminatory treatment. This violates the fundamental principle that government must remain neutral in matters of religion.
                                          </p>
                                          <p>
                                             The neutrality requirement prohibits laws that "target religious beliefs as such." Masterpiece Cakeshop v. Colorado Civil Rights Commission, 138 S. Ct. 1719, 1731 (2018) <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>. New York's law does exactly that by singling out religious objections for elimination while preserving secular objections. This demonstrates the kind of "religious hostility" that violates the First Amendment.
                                          </p>
                                          <p>
                                            The pattern here mirrors the religious targeting condemned in Lukumi. Just as Hialeah created exemptions that "conspicuously accommodated secular conduct while prohibiting religious conduct," New York has created a vaccination regime that accommodates secular medical objections while prohibiting religious medical objections. 508 U.S. at 546.
                                          </p>
                                          <p>
                                            This discriminatory treatment cannot be justified by claims about religious versus secular motivations. Trinity Lutheran v. Comer, 137 S. Ct. 2012, 2021 (2017) <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>, established that government cannot "disqualify[] otherwise eligible recipients from a public benefit solely because of their religious character." Similarly, New York cannot disqualify otherwise valid exemption claims solely because they are based on religious rather than secular convictions.
                                          </p>
                                          <p>
                                                                                         The Constitution requires equal treatment of religious and secular conscience claims. When government accommodates secular objections to legal requirements, it cannot simultaneously deny accommodation to religious objections without violating the neutrality principle that lies at the heart of the First Amendment.
                                           </p>
                                         </div>
                                       </div>
                                       
                                       {/* Chat Interface */}
                                       {renderChatInterface('argument2')}
                                     </div>
                                   )}
                                </div>
                              </div>

                              {/* Argument III */}
                              <div className="border rounded-lg p-4 bg-indigo-50">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-indigo-900">III. SMITH SHOULD BE LIMITED TO PROTECT RELIGIOUS MINORITIES</h5>
                                  <button 
                                    onClick={() => setExpandedBriefSection(expandedBriefSection === 'argument3' ? null : 'argument3')}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                                  >
                                    {expandedBriefSection === 'argument3' ? 'Collapse' : 'Expand Full Text'}
                                  </button>
                                </div>
                                <div className="bg-white p-4 rounded border">
                                  {expandedBriefSection !== 'argument3' ? (
                                    <div className="space-y-3">
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">A. Smith Has Proven Unworkable and Historically Unfounded</h6>
                                        <p className="text-xs text-gray-700">
                                          "Multiple Justices have criticized Smith's departure from historical understanding of the Free Exercise Clause. Justice Gorsuch noted in Kennedy v. Bremerton that Smith 'distorted' Free Exercise doctrine, and Justice Alito has repeatedly called for its reconsideration..."
                                        </p>
                                      </div>
                                      <div>
                                        <h6 className="font-medium text-sm text-gray-800 mb-2">B. The Court Can Rule Narrowly Without Overturning Smith</h6>
                                        <p className="text-xs text-gray-700">
                                          "This Court need not overturn Smith entirely to protect the Amish. The religious targeting doctrine provides a narrow path to vindicate religious liberty while maintaining institutional stability. When laws single out religious practice for disfavored treatment, strict scrutiny applies regardless of Smith..."
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-800 space-y-6">
                                      <div>
                                        <h6 className="font-bold text-gray-900 mb-3">A. Smith Has Proven Unworkable and Historically Unfounded</h6>
                                        <div className="space-y-3">
                                          <p>
                                            Multiple Justices have criticized Smith's departure from the historical understanding of the Free Exercise Clause. Justice Gorsuch noted in Kennedy v. Bremerton School District that Smith "distorted" Free Exercise doctrine, 142 S. Ct. 2407, 2427 (2022), while Justice Alito has repeatedly called for reconsideration of Smith's cramped view of religious liberty.
                                          </p>
                                          <p>
                                                                                         Smith abandoned the compelling interest test that had protected religious minorities for decades. Before Smith, this Court required government to demonstrate compelling interests and use least restrictive means when substantially burdening religious exercise. Sherbert v. Verner, 374 U.S. 398 (1963) <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>; Wisconsin v. Yoder, 406 U.S. 205 (1972) <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>. Smith eliminated this protection for most religious exercise claims.
                                          </p>
                                          <p>
                                            The historical record demonstrates that the Founding generation understood the Free Exercise Clause to require accommodation of religious practice, not merely tolerance of religious belief. James Madison's Memorial and Remonstrance Against Religious Assessments (1785) argued that religious duties are "precedent, both in order of time and in degree of obligation, to the claims of Civil Society."
                                          </p>
                                          <p>
                                            Thomas Jefferson's Virginia Statute for Religious Freedom (1786) protected the "free exercise of religion according to the dictates of conscience." The First Congress that drafted the First Amendment included members who had supported religious accommodations during the Revolutionary War, demonstrating their understanding that religious exercise includes conduct.
                                          </p>
                                          <p>
                                            Smith's rule has proven unworkable in practice, creating arbitrary distinctions between "generally applicable" and "non-generally applicable" laws. The decision has generated confusion in lower courts and failed to provide meaningful protection for religious minorities facing government overreach.
                                          </p>
                                        </div>
                                      </div>

                                      <div>
                                        <h6 className="font-bold text-gray-900 mb-3">B. The Court Can Rule Narrowly Without Overturning Smith</h6>
                                        <div className="space-y-3">
                                          <p>
                                            This Court need not overturn Smith entirely to protect the Amish. The religious targeting doctrine provides a narrow path to vindicate religious liberty while maintaining institutional stability. When laws single out religious practice for disfavored treatment, strict scrutiny applies regardless of Smith's general applicability rule.
                                          </p>
                                          <p>
                                            Lukumi established that Smith does not protect laws that target religious practice through selective exemptions. 508 U.S. at 546 <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>. Masterpiece Cakeshop reaffirmed that government cannot demonstrate hostility toward religious beliefs. 138 S. Ct. at 1731 <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">✓ Good Law</span>. These precedents provide sufficient grounds to protect the Amish without overruling Smith.
                                          </p>
                                          <p>
                                            Alternatively, this Court could limit Smith to its facts, recognizing that it involved criminal drug laws with no exemptions for anyone. Smith never addressed laws with secular exemptions that deny religious exemptions. Such laws fail Smith's own requirements for neutrality and general applicability.
                                          </p>
                                          <p>
                                            The Court could also apply heightened scrutiny when laws burden the religious practices of insular minority communities like the Amish. Such communities pose minimal threat to government interests while facing maximum vulnerability to majoritarian oppression. This approach would protect religious minorities without destabilizing Smith's application to broader religious exercise claims.
                                          </p>
                                          <p>
                                                                                         Finally, this Court could recognize that parental rights in religious education and child-rearing deserve special constitutional protection. Pierce v. Society of Sisters and Yoder established that parents have fundamental rights to direct their children's upbringing. Laws that force parents to violate their religious convictions about their children's medical care burden these fundamental rights and deserve strict scrutiny.
                                           </p>
                                         </div>
                                       </div>
                                       
                                       {/* Chat Interface */}
                                       {renderChatInterface('argument3')}
                                     </div>
                                   )}
                                </div>
                              </div>

                              {/* Conclusion */}
                              <div className="border rounded-lg p-4 bg-indigo-50">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-indigo-900">CONCLUSION</h5>
                                  <button 
                                    onClick={() => setExpandedBriefSection(expandedBriefSection === 'conclusion' ? null : 'conclusion')}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                                  >
                                    {expandedBriefSection === 'conclusion' ? 'Collapse' : 'Expand Full Text'}
                                  </button>
                                </div>
                                <div className="bg-white p-6 rounded border font-serif">
                                  {expandedBriefSection !== 'conclusion' ? (
                                    <p className="text-sm text-gray-800 leading-relaxed text-justify">
                                      For the foregoing reasons, this Court should reverse the Second Circuit's decision and hold that New York's vaccine mandate violates the Free Exercise Clause. The Constitution requires accommodation of sincere religious practice, especially when the government provides secular exemptions while targeting religious ones. The Amish seek only to live according to their faith—the same protection this Court has historically provided to religious minorities facing government persecution.
                                    </p>
                                  ) : (
                                    <div className="text-sm text-gray-800 space-y-4 leading-relaxed">
                                      <p className="text-justify">
                                        For the foregoing reasons, this Court should reverse the Second Circuit's decision and hold that New York's vaccine mandate violates the Free Exercise Clause of the First Amendment.
                                      </p>
                                      <p>
                                        The Free Exercise Clause protects religious practice, not mere belief. For over two centuries, America has accommodated religious minorities like the Amish who cannot in good conscience comply with generally applicable laws. This accommodation tradition reflects the constitutional understanding that religious liberty requires respect for sincere religious conviction, especially when accommodation poses minimal burden on compelling government interests.
                                      </p>
                                      <p>
                                        New York's vaccine mandate violates constitutional neutrality by preserving medical exemptions for secular reasons while eliminating religious exemptions for faith-based reasons. This selective accommodation creates a religious gerrymander that targets religious practice for disfavored treatment. Even under Employment Division v. Smith, such targeting violates the Free Exercise Clause.
                                      </p>
                                      <p>
                                        The Amish community poses minimal public health risk while facing maximum vulnerability to majoritarian oppression. Their schools serve only Amish children on Amish land with limited public contact. Their religious convictions about medical intervention are sincere, deeply held, and central to their faith tradition. Forcing them to choose between their religious convictions and their children's education violates the same constitutional principles this Court vindicated in Wisconsin v. Yoder.
                                      </p>
                                      <p>
                                        This Court should protect religious minorities from government overreach by requiring accommodation of sincere religious practice when the government already accommodates secular objections to the same legal requirement. The Constitution demands no less, and the Amish deserve no less.
                                      </p>
                                      <p>
                                        The Miller family and their community seek only to live according to their faith—to raise their children consistent with their deepest religious convictions about health, healing, and divine providence. They ask for the same constitutional protection this Court has historically provided to religious minorities facing government persecution. The Free Exercise Clause requires this Court to grant that protection.
                                      </p>
                                                                            <div className="mt-8 pt-4 border-t text-center">
                                        <p className="font-bold text-center">
                                          WHEREFORE, Petitioners respectfully request that this Court reverse the judgment of the United States Court of Appeals for the Second Circuit and remand for proceedings consistent with this Court's opinion.
                                        </p>
                                      </div>
                                      <div className="text-right mt-8 space-y-1">
                                        <p className="italic">Respectfully submitted,</p>
                                        <div className="mt-8 mb-4">
                                          <p>_________________________</p>
                                        </div>
                                        <div className="text-sm">
                                          <p className="font-medium">Counsel for Petitioners</p>
                                          <p className="mt-2">First Liberty Institute</p>
                                          <p>2001 West Plano Parkway, Suite 1600</p>
                                          <p>Plano, Texas 75075</p>
                                          <p>(972) 941-4444</p>
                                        </div>
                                      </div>
                                       
                                       {/* Chat Interface */}
                                       {renderChatInterface('conclusion')}
                                     </div>
                                   )}
                                </div>
                              </div>

                              {/* Custom Sections */}
                              {customSections.map((section) => (
                                <div key={section.id} className="border rounded-lg p-4 bg-purple-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-medium text-purple-900">{section.title}</h5>
                                    <div className="flex space-x-2">
                                      <button 
                                        onClick={() => setExpandedBriefSection(expandedBriefSection === section.id ? null : section.id)}
                                        className="text-purple-600 hover:text-purple-800 text-sm"
                                      >
                                        {expandedBriefSection === section.id ? 'Collapse' : 'Expand Full Text'}
                                      </button>
                                      <button
                                        onClick={() => deleteCustomSection(section.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                  <div className="bg-white p-6 rounded border font-serif">
                                    {expandedBriefSection !== section.id ? (
                                      <div className="text-sm text-gray-800 leading-relaxed">
                                        <p className="text-justify">
                                          {section.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                                        </p>
                                        <p className="text-xs text-purple-600 mt-2 italic">
                                          Custom section generated from your input • Click "Expand Full Text" to view complete argument
                                        </p>
                                      </div>
                                    ) : (
                                      <div>
                                        <div 
                                          className="text-sm text-gray-800 leading-relaxed"
                                          dangerouslySetInnerHTML={{ __html: section.content }}
                                        />
                                        
                                        {/* Chat Interface for Custom Sections */}
                                        {renderChatInterface(section.id)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Justice-Specific Persuasion Scores */}
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Justice-Specific Persuasion Analysis</h4>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                              {step.mockData?.justiceSpecificScores && Object.entries(step.mockData.justiceSpecificScores).map(([justice, score]) => (
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
                        </div>
                      )}

                      {step.id === 11 && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Final Review Results</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-xl font-bold text-gray-600">{step.mockData?.consistencyScore || 96}%</div>
                              <div className="text-xs text-gray-600">Consistency Score</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-xl font-bold text-green-600">{step.mockData?.contradictions || 0}</div>
                              <div className="text-xs text-gray-600">Contradictions</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-xl font-bold text-blue-600">6/9</div>
                              <div className="text-xs text-gray-600">Justices Aligned</div>
                            </div>
                          </div>
                          <div className="mt-4 bg-purple-50 rounded-lg p-3">
                            <h5 className="font-medium text-purple-800 mb-2">Overall Assessment</h5>
                            <p className="text-sm text-purple-700">Win Probability: {step.mockData?.overallAssessment?.winProbability || 73}%</p>
                            <p className="text-sm text-purple-700">Cert Probability: {step.mockData?.overallAssessment?.certProbability || 85}%</p>
                          </div>
                        </div>
                      )}

                      {!step.mockData && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold mb-3">Step {step.id} Analysis Results</h4>
                          <div className="text-center py-8">
                            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Analysis Complete - Ready for Review
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              Detailed analysis and results are available for this step
                            </p>
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