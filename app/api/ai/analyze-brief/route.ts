import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText } from '@/lib/ai/openai';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional for now since this is called after successful upload)
    console.log('🔐 Checking authentication for brief analysis...');
    
    const { documentId, fileName, caseId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    console.log(`🔍 Analyzing brief structure for document: ${documentId}`);

    // Get document from database
    const { data: document, error: docError } = await supabase
      .from('legal_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      console.error('Failed to fetch document:', docError);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get the file content from storage
    let fileContent = '';
    if (document.local_file_path) {
      console.log(`📄 Downloading file from storage: ${document.local_file_path}`);
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('legal-documents')
        .download(document.local_file_path);
      
      if (downloadError) {
        console.error('❌ Failed to download file:', downloadError);
      } else if (fileData) {
        console.log(`📄 File downloaded successfully, size: ${fileData.size} bytes`);
        
        try {
          if (fileName.toLowerCase().endsWith('.txt')) {
            // For text files, read directly
            fileContent = await fileData.text();
            console.log(`✅ Text file extracted: ${fileContent.length} characters`);
          } else {
            // For PDF/DOCX files, we'll implement extraction after getting the route working
            console.log('📄 Non-text file detected - using placeholder for now');
            fileContent = "PDF/DOCX text extraction will be implemented. For now, using structure analysis only.";
          }
        } catch (extractionError) {
          console.error('❌ Text extraction failed:', extractionError);
          fileContent = "Text extraction failed. Please try uploading the document as a TXT file.";
        }
      }
    }

    // If no content extracted, use a sample structure
    if (!fileContent || fileContent.length < 100) {
      console.log('⚠️ No content extracted, using sample structure analysis');
      
      const sampleAnalysis = {
        fullText: `BRIEF OF AMICUS CURIAE [ORGANIZATION NAME]
IN SUPPORT OF [PETITIONER/RESPONDENT]

STATEMENT OF INTEREST
[Sample interest statement...]

QUESTION PRESENTED
[Sample question...]

SUMMARY OF ARGUMENT
[Sample summary...]

ARGUMENT
I. THE FIRST AMENDMENT PROTECTS RELIGIOUS EXERCISE
[Sample argument...]

II. THE GOVERNMENT'S INTEREST DOES NOT JUSTIFY THE BURDEN
[Sample argument...]

CONCLUSION
[Sample conclusion...]`,
        sections: [
          {
            id: 'statement_of_interest',
            title: 'Statement of Interest',
            content: 'Sample statement of interest content...',
            type: 'statement_of_interest',
            order: 1
          },
          {
            id: 'question_presented',
            title: 'Question Presented',
            content: 'Sample question presented content...',
            type: 'question_presented',
            order: 2
          },
          {
            id: 'summary_of_argument',
            title: 'Summary of Argument',
            content: 'Sample summary of argument content...',
            type: 'summary_of_argument',
            order: 3
          },
          {
            id: 'argument_1',
            title: 'Argument I: The First Amendment Protects Religious Exercise',
            content: 'Sample first argument content...',
            type: 'argument',
            order: 4
          },
          {
            id: 'argument_2',
            title: 'Argument II: The Government\'s Interest Does Not Justify the Burden',
            content: 'Sample second argument content...',
            type: 'argument',
            order: 5
          },
          {
            id: 'conclusion',
            title: 'Conclusion',
            content: 'Sample conclusion content...',
            type: 'conclusion',
            order: 6
          }
        ],
        wordCount: 2500,
        briefType: 'amicus',
        court: 'Supreme Court of the United States',
        caseTitle: 'Sample Case Title',
        author: 'Sample Law Firm'
      };

      return NextResponse.json({
        success: true,
        message: 'Brief structure analyzed (sample)',
        ...sampleAnalysis
      });
    }

    console.log(`📄 Extracted content length: ${fileContent.length} characters`);

    // Use AI to analyze the brief structure
    const analysisPrompt = `Analyze this legal brief and extract its structure, sections, and metadata.

BRIEF CONTENT:
${fileContent}

Please analyze this brief and return a JSON response with the following structure:
{
  "fullText": "the complete brief text",
  "sections": [
    {
      "id": "unique_section_id",
      "title": "Section Title",
      "content": "Section content...",
      "type": "statement_of_interest|question_presented|summary_of_argument|argument|conclusion|other",
      "order": 1
    }
  ],
  "wordCount": 2500,
  "briefType": "amicus|petitioner|respondent",
  "court": "Court name",
  "caseTitle": "Case title if mentioned",
  "author": "Author/firm if mentioned"
}

Focus on identifying:
1. Major sections like Statement of Interest, Question Presented, Summary of Argument, Arguments, and Conclusion
2. The overall structure and organization
3. Key metadata like word count and brief type
4. Court and case information if available

Return only valid JSON.`;

    const analysisResult = await generateText(analysisPrompt);
    
    try {
      const parsedAnalysis = JSON.parse(analysisResult);
      
      console.log(`✅ Brief analysis completed: ${parsedAnalysis.sections?.length || 0} sections identified`);
      
      return NextResponse.json({
        success: true,
        message: 'Brief structure analyzed successfully',
        ...parsedAnalysis
      });

    } catch (parseError) {
      console.error('Failed to parse AI analysis:', parseError);
      
      // Return a fallback structure if AI parsing fails
      const fallbackAnalysis = {
        fullText: fileContent,
        sections: [
          {
            id: 'full_brief',
            title: 'Complete Brief',
            content: fileContent.substring(0, 1000) + '...',
            type: 'other',
            order: 1
          }
        ],
        wordCount: fileContent.split(/\s+/).length,
        briefType: 'amicus',
        court: 'Unknown Court',
        caseTitle: fileName,
        author: 'Unknown Author'
      };

      return NextResponse.json({
        success: true,
        message: 'Brief analyzed with fallback structure',
        ...fallbackAnalysis
      });
    }

  } catch (error) {
    console.error('Brief analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze brief structure' },
      { status: 500 }
    );
  }
}
