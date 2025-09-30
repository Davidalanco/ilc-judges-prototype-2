const pdf = require('pdf-parse');
const fs = require('fs');

export interface AmicusBriefSection {
  title: string;
  content: string;
  order: number;
  type: 'header' | 'summary' | 'argument' | 'conclusion' | 'citation';
}

export async function parseAmicusBriefPDF(filePath: string): Promise<{
  fullText: string;
  sections: AmicusBriefSection[];
}> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    
    const fullText = pdfData.text;
    
    // Parse the brief into logical sections
    const sections = parseBriefSections(fullText);
    
    return {
      fullText,
      sections
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

function parseBriefSections(text: string): AmicusBriefSection[] {
  const sections: AmicusBriefSection[] = [];
  const lines = text.split('\n');
  
  let currentSection: AmicusBriefSection | null = null;
  let order = 0;
  
  // Common section headers in amicus briefs
  const sectionPatterns = [
    /^I\.?\s+(SUMMARY|INTRODUCTION)/i,
    /^II\.?\s+(STATEMENT\s+OF\s+THE\s+CASE|BACKGROUND|FACTS)/i,
    /^III\.?\s+(ARGUMENT|LEGAL\s+ANALYSIS)/i,
    /^IV\.?\s+(ARGUMENT|LEGAL\s+ANALYSIS)/i,
    /^V\.?\s+(ARGUMENT|LEGAL\s+ANALYSIS)/i,
    /^VI\.?\s+(ARGUMENT|LEGAL\s+ANALYSIS)/i,
    /^VII\.?\s+(ARGUMENT|LEGAL\s+ANALYSIS)/i,
    /^VIII\.?\s+(ARGUMENT|LEGAL\s+ANALYSIS)/i,
    /^(CONCLUSION|SUMMARY)/i,
    /^CERTIFICATE\s+OF\s+SERVICE/i,
    /^APPENDIX/i
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this line matches a section header
    let isSectionHeader = false;
    let sectionType: AmicusBriefSection['type'] = 'argument';
    
    for (const pattern of sectionPatterns) {
      if (pattern.test(line)) {
        isSectionHeader = true;
        
        if (line.toLowerCase().includes('summary') || line.toLowerCase().includes('introduction')) {
          sectionType = 'summary';
        } else if (line.toLowerCase().includes('argument') || line.toLowerCase().includes('analysis')) {
          sectionType = 'argument';
        } else if (line.toLowerCase().includes('conclusion')) {
          sectionType = 'conclusion';
        } else if (line.toLowerCase().includes('certificate') || line.toLowerCase().includes('appendix')) {
          sectionType = 'citation';
        }
        break;
      }
    }
    
    if (isSectionHeader) {
      // Save previous section if it exists
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: line,
        content: '',
        order: order++,
        type: sectionType
      };
    } else if (currentSection) {
      // Add content to current section
      currentSection.content += line + '\n';
    }
  }
  
  // Add the last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  // Clean up content (remove excessive whitespace)
  sections.forEach(section => {
    section.content = section.content.trim().replace(/\s+/g, ' ');
  });
  
  return sections;
}

export async function analyzeAmicusBriefStructure(filePath: string): Promise<{
  briefType: string;
  keyArguments: string[];
  legalIssues: string[];
  citedCases: string[];
  recommendations: string[];
}> {
  const { fullText, sections } = await parseAmicusBriefPDF(filePath);
  
  // Extract key information using patterns
  const keyArguments = extractKeyArguments(fullText);
  const legalIssues = extractLegalIssues(fullText);
  const citedCases = extractCitedCases(fullText);
  
  // Analyze structure for recommendations
  const recommendations = analyzeStructureForRecommendations(sections);
  
  return {
    briefType: 'Amicus Curiae Brief',
    keyArguments,
    legalIssues,
    citedCases,
    recommendations
  };
}

function extractKeyArguments(text: string): string[] {
  const arguments: string[] = [];
  
  // Look for argument patterns
  const argumentPatterns = [
    /(?:argument|contend|assert|maintain)s?\s+(?:that\s+)?([^.]{50,200})/gi,
    /(?:plaintiff|defendant|petitioner|respondent)\s+(?:argues?|contends?)\s+(?:that\s+)?([^.]{50,200})/gi,
    /(?:court|tribunal)\s+(?:should|must|ought\s+to)\s+([^.]{50,200})/gi
  ];
  
  argumentPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1] && match[1].length > 30) {
        arguments.push(match[1].trim());
      }
    }
  });
  
  return [...new Set(arguments)].slice(0, 10); // Remove duplicates and limit
}

function extractLegalIssues(text: string): string[] {
  const issues: string[] = [];
  
  // Look for legal issue patterns
  const issuePatterns = [
    /(?:issue|question)\s+(?:presented|before\s+the\s+court|is)\s*:?\s*([^.]{30,150})/gi,
    /(?:whether|if)\s+([^.]{30,150})/gi,
    /(?:constitutional|statutory|legal)\s+(?:question|issue)\s*:?\s*([^.]{30,150})/gi
  ];
  
  issuePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1] && match[1].length > 20) {
        issues.push(match[1].trim());
      }
    }
  });
  
  return [...new Set(issues)].slice(0, 8);
}

function extractCitedCases(text: string): string[] {
  const cases: string[] = [];
  
  // Look for case citation patterns
  const casePatterns = [
    /([A-Za-z\s]+)\s+v\.\s+([A-Za-z\s]+)\s*,\s*\d+/g,
    /([A-Za-z\s]+)\s+v\.\s+([A-Za-z\s]+)\s*,\s*\d+\s+[A-Za-z]+\s+\d+/g,
    /([A-Za-z\s]+)\s+v\.\s+([A-Za-z\s]+)\s*\(\d{4}\)/g
  ];
  
  casePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const caseName = match[0].trim();
      if (caseName.length > 10 && caseName.length < 100) {
        cases.push(caseName);
      }
    }
  });
  
  return [...new Set(cases)].slice(0, 15);
}

function analyzeStructureForRecommendations(sections: AmicusBriefSection[]): string[] {
  const recommendations: string[] = [];
  
  // Analyze section structure
  const summarySections = sections.filter(s => s.type === 'summary');
  const argumentSections = sections.filter(s => s.type === 'argument');
  const conclusionSections = sections.filter(s => s.type === 'conclusion');
  
  if (summarySections.length === 0) {
    recommendations.push('Include a clear summary or introduction section');
  }
  
  if (argumentSections.length < 2) {
    recommendations.push('Structure arguments into multiple logical sections');
  }
  
  if (conclusionSections.length === 0) {
    recommendations.push('Add a strong conclusion section');
  }
  
  // Check for citation section
  const citationSections = sections.filter(s => s.type === 'citation');
  if (citationSections.length === 0) {
    recommendations.push('Include proper citations and certificate of service');
  }
  
  recommendations.push('Use numbered sections for clear organization');
  recommendations.push('Include case citations in proper legal format');
  recommendations.push('Maintain consistent legal terminology throughout');
  
  return recommendations;
}
