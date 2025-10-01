import { NextRequest, NextResponse } from 'next/server';
import { claude } from '@/lib/ai/claude';

export interface InterestOfAmicusData {
  case: {
    caption: string;
    question_presented: string;
    party_supported: 'Petitioner' | 'Respondent';
    posture: string;
  };
  amicus: {
    name: string;
    type: 'individual' | 'nonprofit' | 'trade_association' | 'academic_coalition' | 'state' | 'business';
    mission_or_purpose: string;
    size_scope: {
      members: number;
      footprint: 'national' | 'state' | 'local';
    };
    credentials: string[];
    empirical_assets: string[];
    related_litigation: string[];
    direct_stake: string;
    unique_perspective: string;
    counsel_of_record: string;
  };
  rule37: {
    authorship: string;
    funding: string;
    consent: 'all parties consented' | 'one party withheld' | 'not required';
  };
}

export interface InterestOfAmicusOutput {
  section: string;
  text_markdown: string;
  footnotes: Array<{
    marker: string;
    text: string;
  }>;
  metadata: {
    word_count: number;
    flags: {
      contains_merits_argument: boolean;
      missing_unique_value: boolean;
      missing_rule37: boolean;
    };
  };
}

export interface QualityScores {
  uniqueValue: number; // 0-5
  textFirst: number; // 0-5 (repurposed as "Specifics First")
  evidenceFit: number; // 0-5
  compliance: number; // 0-5
  coherence: number; // 0-100%
}

function generateSystemPrompt(): string {
  return `You are drafting a U.S. Supreme Court amicus brief. Write the 'Interest of Amicus Curiae' section to Supreme-Court standards. Voice must be formal, precise, and restrained. Do not argue the merits.`;
}

function generateInstructionPrompt(data: InterestOfAmicusData): string {
  return `Using the provided case, amicus, and rule37 data:

Start with a one-paragraph identity statement: who the amicus is (type, mission, scope, credentials that matter here).

Add one–two paragraphs of concrete experience, data, membership exposure, or litigation track record that gives a unique perspective. Prefer verified facts (numbers, jurisdictions, years).

Add one paragraph linking that experience to the question presented—spell out the real-world impact on the amicus or its constituents and why clerks need this vantage point.

Include a Rule 37.6 disclosure as a footnote at the first mention of the amicus name (exact language supplied below).

Avoid repeating the parties' arguments; do not preview doctrinal claims. Use 'this Court' and keep paragraphs compact.

Rule 37.6 footnote text (insert verbatim unless data requires modification):
"No counsel for a party authored this brief in whole or in part, and no person other than amicus and its counsel made a monetary contribution intended to fund the preparation or submission of this brief."

(If authorship/funding differ, programmatically substitute the accurate disclosure text from rule37.)

CASE DATA:
Caption: ${data.case.caption}
Question Presented: ${data.case.question_presented}
Party Supported: ${data.case.party_supported}
Posture: ${data.case.posture}

AMICUS DATA:
Name: ${data.amicus.name}
Type: ${data.amicus.type}
Mission: ${data.amicus.mission_or_purpose}
Members: ${data.amicus.size_scope.members}
Footprint: ${data.amicus.size_scope.footprint}
Credentials: ${data.amicus.credentials.join(', ')}
Empirical Assets: ${data.amicus.empirical_assets.join(', ')}
Related Litigation: ${data.amicus.related_litigation.join(', ')}
Direct Stake: ${data.amicus.direct_stake}
Unique Perspective: ${data.amicus.unique_perspective}
Counsel of Record: ${data.amicus.counsel_of_record}

RULE 37 DATA:
Authorship: ${data.rule37.authorship}
Funding: ${data.rule37.funding}
Consent: ${data.rule37.consent}`;
}

function calculateQualityScores(text: string, data: InterestOfAmicusData): QualityScores {
  const content = text.toLowerCase();
  
  // Unique Value (0-5)
  let uniqueValue = 0;
  if (content.includes(data.amicus.type) && content.includes(data.amicus.mission_or_purpose.toLowerCase())) uniqueValue += 2;
  if (data.amicus.size_scope.members > 0 && content.includes(data.amicus.size_scope.members.toString())) uniqueValue += 1;
  if (data.amicus.empirical_assets.length > 0 && data.amicus.empirical_assets.some(asset => content.includes(asset.toLowerCase()))) uniqueValue += 1;
  if (content.includes('question presented') || content.includes('issue')) uniqueValue += 1;

  // Text First (repurposed as "Specifics First") (0-5)
  let textFirst = 0;
  const specifics = [
    data.amicus.size_scope.members.toString(),
    data.amicus.size_scope.footprint,
    ...data.amicus.credentials,
    ...data.amicus.empirical_assets
  ].filter(s => s && s.length > 0);
  
  const specificsInText = specifics.filter(specific => content.includes(specific.toLowerCase())).length;
  if (specificsInText >= 2) textFirst += 3;
  
  // Check for generic phrases to deduct points
  const genericPhrases = ['cares deeply', 'committed to justice', 'passionate about', 'dedicated to'];
  const hasGenericPhrases = genericPhrases.some(phrase => content.includes(phrase));
  if (!hasGenericPhrases) textFirst += 2;

  // Evidence Fit (0-5)
  let evidenceFit = 0;
  if (data.amicus.credentials.length > 0 && data.amicus.credentials.some(cred => content.includes(cred.toLowerCase()))) evidenceFit += 2;
  if (content.includes(data.amicus.direct_stake.toLowerCase())) evidenceFit += 2;
  if (data.amicus.related_litigation.length > 0 && data.amicus.related_litigation.some(lit => content.includes(lit.toLowerCase()))) evidenceFit += 1;

  // Compliance (0-5)
  let compliance = 0;
  if (content.includes('^1') || content.includes('footnote')) compliance += 2;
  if (content.includes('this court') && !content.includes('the supreme court')) compliance += 1;
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 150 && wordCount <= 300) compliance += 1;
  
  // Check for merits argument language
  const meritsLanguage = ['should overrule', 'should affirm', 'should hold', 'doctrinal standards'];
  const hasMeritsLanguage = meritsLanguage.some(phrase => content.includes(phrase));
  if (!hasMeritsLanguage) compliance += 1;

  // Coherence (0-100%)
  let coherence = 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sharedTerms = ['amicus', 'court', 'case', 'accommodation', 'religious'];
  const termCounts = sharedTerms.map(term => 
    sentences.filter(sentence => sentence.toLowerCase().includes(term)).length
  );
  const avgTermUsage = termCounts.reduce((sum, count) => sum + count, 0) / termCounts.length;
  coherence = Math.min(avgTermUsage * 20, 100);

  return {
    uniqueValue: Math.min(uniqueValue, 5),
    textFirst: Math.min(textFirst, 5),
    evidenceFit: Math.min(evidenceFit, 5),
    compliance: Math.min(compliance, 5),
    coherence: Math.round(coherence)
  };
}

function generateRule37Footnote(data: InterestOfAmicusData): string {
  // Use the provided authorship and funding text, or fall back to standard
  let authorship = data.rule37.authorship;
  let funding = data.rule37.funding;
  
  // If not provided, use standard language
  if (!authorship.trim()) {
    authorship = "No counsel for a party authored this brief in whole or in part";
  }
  if (!funding.trim()) {
    funding = "no person other than amicus and its counsel made a monetary contribution intended to fund the preparation or submission of this brief";
  }
  
  return `${authorship}, and ${funding}.`;
}

function generateTargetedRevisionPrompt(metric: string, scores: QualityScores, text: string, data: InterestOfAmicusData): string {
  const basePrompt = `Revise the following Interest of Amicus Curiae section to improve the ${metric} score. Current score: ${scores[metric as keyof QualityScores]}/5.`;
  
  let specificInstructions = '';
  
  switch (metric) {
    case 'uniqueValue':
      specificInstructions = `Add: (1) Clear statement of amicus type and mission, (2) Specific numbers/scope if missing, (3) Concrete empirical assets or litigation history, (4) Explicit sentence tying uniqueness to the question presented.`;
      break;
    case 'textFirst':
      specificInstructions = `Add: (1) At least two verifiable specifics (numbers, years, jurisdictions, datasets) in first paragraph, (2) Remove generic phrases like "cares deeply" or "committed to justice".`;
      break;
    case 'evidenceFit':
      specificInstructions = `Add: (1) Credentials/examples connected to the question presented, (2) At least one concrete stakeholder impact statement, (3) Prior case citations related by subject matter.`;
      break;
    case 'compliance':
      specificInstructions = `Add: (1) Rule 37.6 footnote properly placed, (2) Use "this Court" instead of "the Supreme Court", (3) Ensure 150-300 word length, (4) Remove any case merits language.`;
      break;
  }
  
  return `${basePrompt}\n\n${specificInstructions}\n\nPreserve all other content. Generate only the revised text.`;
}

export async function POST(request: NextRequest) {
  try {
    const data: InterestOfAmicusData = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'amicus.name',
      'amicus.mission_or_purpose', 
      'amicus.direct_stake',
      'amicus.unique_perspective',
      'rule37.authorship',
      'rule37.funding'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const [section, key] = field.split('.');
      return !data[section as keyof InterestOfAmicusData]?.[key as keyof any];
    });
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate initial content
    const systemPrompt = generateSystemPrompt();
    const instructionPrompt = generateInstructionPrompt(data);
    
    let generatedText = await claude.generateText([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: instructionPrompt }
    ]);

    // Add footnote marker after first mention of amicus name
    const amicusName = data.amicus.name;
    const nameIndex = generatedText.indexOf(amicusName);
    if (nameIndex !== -1) {
      const beforeName = generatedText.substring(0, nameIndex);
      const afterName = generatedText.substring(nameIndex + amicusName.length);
      generatedText = `${beforeName}${amicusName}^1${afterName}`;
    }

    // Calculate quality scores
    const scores = calculateQualityScores(generatedText, data);
    
    // Check if any metric needs revision (score < 4)
    const needsRevision = Object.values(scores).some(score => 
      typeof score === 'number' && score < 4 && score !== scores.coherence
    );
    
    let finalText = generatedText;
    let revisionAttempts = 0;
    const maxRevisions = 2;
    
    while (needsRevision && revisionAttempts < maxRevisions) {
      // Find the lowest scoring metric
      const metrics = ['uniqueValue', 'textFirst', 'evidenceFit', 'compliance'] as const;
      const lowestMetric = metrics.reduce((lowest, metric) => 
        scores[metric] < scores[lowest] ? metric : lowest
      );
      
      if (scores[lowestMetric] < 4) {
        const revisionPrompt = generateTargetedRevisionPrompt(lowestMetric, scores, finalText, data);
        
        const revisedText = await claude.generateText([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: revisionPrompt }
        ]);
        
        // Add footnote marker if needed
        const nameIndex = revisedText.indexOf(amicusName);
        if (nameIndex !== -1 && !revisedText.includes('^1')) {
          const beforeName = revisedText.substring(0, nameIndex);
          const afterName = revisedText.substring(nameIndex + amicusName.length);
          finalText = `${beforeName}${amicusName}^1${afterName}`;
        } else {
          finalText = revisedText;
        }
        
        // Recalculate scores
        const newScores = calculateQualityScores(finalText, data);
        Object.assign(scores, newScores);
        
        revisionAttempts++;
      } else {
        break;
      }
    }

    // Generate final output
    const wordCount = finalText.split(/\s+/).length;
    const rule37Footnote = generateRule37Footnote(data);
    
    const output: InterestOfAmicusOutput = {
      section: 'Interest of Amicus Curiae',
      text_markdown: `INTEREST OF AMICUS CURIAE\n\n${finalText}\n\n`,
      footnotes: [
        {
          marker: '1',
          text: rule37Footnote
        }
      ],
      metadata: {
        word_count: wordCount,
        flags: {
          contains_merits_argument: finalText.toLowerCase().includes('should overrule') || 
                                   finalText.toLowerCase().includes('should affirm'),
          missing_unique_value: scores.uniqueValue < 3,
          missing_rule37: !finalText.includes('^1')
        }
      }
    };

    return NextResponse.json({
      output,
      quality_scores: scores,
      revision_attempts: revisionAttempts
    });

  } catch (error) {
    console.error('Error generating Interest of Amicus Curiae:', error);
    return NextResponse.json(
      { error: 'Failed to generate Interest of Amicus Curiae section' },
      { status: 500 }
    );
  }
}
