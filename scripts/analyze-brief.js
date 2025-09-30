const pdf = require('pdf-parse');
const fs = require('fs');

function parseBriefSections(text) {
  const sections = [];
  const lines = text.split('\n');
  
  let currentSection = null;
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
    let sectionType = 'argument';
    
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

function extractKeyArguments(text) {
  const arguments = [];
  
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

function extractLegalIssues(text) {
  const issues = [];
  
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

function extractCitedCases(text) {
  const cases = [];
  
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

async function parseAmicusBriefPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    
    const fullText = pdfData.text;
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

async function analyzeBrief() {
  try {
    console.log('📄 Analyzing Amicus Brief: John Kluge v. Department of Health and Human Services');
    
    const filePath = '/Users/daveconklin/DEV/TASQER-3000/ilc-judges-prototype-2/examples/20230228110510772_22-174 Amicus Brief of John Kluge.pdf';
    
    // Parse the PDF and extract sections
    const { fullText, sections } = await parseAmicusBriefPDF(filePath);
    
    console.log('\n📊 BRIEF STRUCTURE ANALYSIS:');
    console.log('================================');
    
    sections.forEach((section, index) => {
      console.log(`\n${index + 1}. ${section.title}`);
      console.log(`   Type: ${section.type.toUpperCase()}`);
      console.log(`   Length: ${section.content.length} characters`);
      console.log(`   Preview: ${section.content.substring(0, 150)}...`);
    });
    
    // Extract key information
    const keyArguments = extractKeyArguments(fullText);
    const legalIssues = extractLegalIssues(fullText);
    const citedCases = extractCitedCases(fullText);
    
    console.log('\n🎯 KEY ANALYSIS RESULTS:');
    console.log('========================');
    
    console.log('\n📋 Key Arguments:');
    keyArguments.forEach((arg, index) => {
      console.log(`${index + 1}. ${arg}`);
    });
    
    console.log('\n⚖️ Legal Issues:');
    legalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    
    console.log('\n📚 Cited Cases:');
    citedCases.forEach((caseName, index) => {
      console.log(`${index + 1}. ${caseName}`);
    });
    
    console.log('\n✅ Analysis complete!');
    
    return { fullText, sections, keyArguments, legalIssues, citedCases };
    
  } catch (error) {
    console.error('❌ Error analyzing brief:', error);
    throw error;
  }
}

// Run the analysis
analyzeBrief().catch(console.error);
