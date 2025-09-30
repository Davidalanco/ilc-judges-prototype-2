const { parseAmicusBriefPDF, analyzeAmicusBriefStructure } = require('../lib/pdf-parser');

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
    
    // Analyze structure
    const analysis = await analyzeAmicusBriefStructure(filePath);
    
    console.log('\n🎯 KEY ANALYSIS RESULTS:');
    console.log('========================');
    
    console.log('\n📋 Key Arguments:');
    analysis.keyArguments.forEach((arg, index) => {
      console.log(`${index + 1}. ${arg}`);
    });
    
    console.log('\n⚖️ Legal Issues:');
    analysis.legalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    
    console.log('\n📚 Cited Cases:');
    analysis.citedCases.forEach((caseName, index) => {
      console.log(`${index + 1}. ${caseName}`);
    });
    
    console.log('\n💡 Structure Recommendations:');
    analysis.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    
    console.log('\n✅ Analysis complete!');
    
    return { fullText, sections, analysis };
    
  } catch (error) {
    console.error('❌ Error analyzing brief:', error);
    throw error;
  }
}

// Run the analysis
analyzeBrief().catch(console.error);
