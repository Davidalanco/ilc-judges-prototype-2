// Citation parsing utility for legal case citations
// Supports common citation formats like "Miller v. McDonald, 944 F.3d 1050"

export interface ParsedCitation {
  caseName: string;
  reporter: string;
  volume: string;
  page: string;
  year?: string;
  court?: string;
  fullCitation: string;
  isValid: boolean;
}

export interface CitationSearchQuery {
  caseName?: string;
  citation?: string;
  federal_cite_one?: string;
  court?: string;
  yearStart?: number;
  yearEnd?: number;
}

// Common legal reporters and their court mappings
const REPORTER_COURTS: Record<string, string[]> = {
  'F.3d': ['Federal Circuit Courts'],
  'F.2d': ['Federal Circuit Courts'],
  'F.': ['Federal Circuit Courts'],
  'F.Supp.3d': ['Federal District Courts'],
  'F.Supp.2d': ['Federal District Courts'],
  'F.Supp.': ['Federal District Courts'],
  'U.S.': ['Supreme Court'],
  'S.Ct.': ['Supreme Court'],
  'L.Ed.2d': ['Supreme Court'],
  'L.Ed.': ['Supreme Court']
};

// Parse a legal citation into its components
export function parseCitation(citation: string): ParsedCitation {
  const trimmed = citation.trim();
  
  // Regex to match common citation patterns
  // Examples: "Miller v. McDonald, 944 F.3d 1050 (9th Cir. 2020)"
  const patterns = [
    // Full citation with year and court
    /^(.+?),\s*(\d+)\s+([A-Za-z0-9.]+)\s+(\d+)\s*\(([^)]+)\s+(\d{4})\)$/,
    // Citation with year in parentheses
    /^(.+?),\s*(\d+)\s+([A-Za-z0-9.]+)\s+(\d+)\s*\((\d{4})\)$/,
    // Basic citation format
    /^(.+?),\s*(\d+)\s+([A-Za-z0-9.]+)\s+(\d+)$/,
    // Alternative format with case name first
    /^(.+?)\s+(\d+)\s+([A-Za-z0-9.]+)\s+(\d+)$/
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const [, caseName, volume, reporter, page, courtOrYear, year] = match;
      
      return {
        caseName: caseName.trim(),
        reporter: reporter.trim(),
        volume: volume.trim(),
        page: page.trim(),
        year: year || (courtOrYear && /^\d{4}$/.test(courtOrYear) ? courtOrYear : undefined),
        court: year ? courtOrYear : undefined,
        fullCitation: trimmed,
        isValid: true
      };
    }
  }

  // If no pattern matches, try to extract just case name
  const caseNameMatch = trimmed.match(/^(.+?)(?:,|\s+\d)/);
  
  return {
    caseName: caseNameMatch ? caseNameMatch[1].trim() : trimmed,
    reporter: '',
    volume: '',
    page: '',
    fullCitation: trimmed,
    isValid: false
  };
}

// Generate search queries for different legal databases
export function generateSearchQueries(citation: ParsedCitation): CitationSearchQuery[] {
  const queries: CitationSearchQuery[] = [];

  // Primary search by case name
  if (citation.caseName) {
    queries.push({
      caseName: citation.caseName,
      citation: citation.fullCitation
    });
  }

  // Search by citation components if valid
  if (citation.isValid && citation.reporter && citation.volume && citation.page) {
    queries.push({
      citation: `${citation.volume} ${citation.reporter} ${citation.page}`
    });
  }

  // Search by court if identified
  if (citation.court) {
    queries.push({
      caseName: citation.caseName,
      court: citation.court
    });
  }

  // Search by year range if provided
  if (citation.year) {
    const year = parseInt(citation.year);
    queries.push({
      caseName: citation.caseName,
      yearStart: year - 1,
      yearEnd: year + 1
    });
  }

  return queries;
}

// Validate citation format
export function validateCitation(citation: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const parsed = parseCitation(citation);

  if (!parsed.caseName) {
    errors.push('Case name is required');
  }

  if (!parsed.isValid) {
    errors.push('Citation format not recognized. Try: "Case Name, Volume Reporter Page (Year)"');
  }

  if (parsed.reporter && !REPORTER_COURTS[parsed.reporter]) {
    errors.push(`Reporter "${parsed.reporter}" not recognized`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Suggest possible corrections for invalid citations
export function suggestCitationCorrections(citation: string): string[] {
  const suggestions: string[] = [];
  
  // Common formatting issues
  if (!citation.includes(',')) {
    suggestions.push('Try adding a comma after the case name: "Case Name, Volume Reporter Page"');
  }

  if (!/\d+\s+[A-Za-z.]+\s+\d+/.test(citation)) {
    suggestions.push('Citation should include volume, reporter, and page: "Volume Reporter Page"');
  }

  // Common reporter abbreviations
  const commonReporters = ['F.3d', 'F.Supp.3d', 'U.S.', 'S.Ct.'];
  suggestions.push(`Common reporters: ${commonReporters.join(', ')}`);

  return suggestions;
}

// Get court information from reporter
export function getCourtFromReporter(reporter: string): string[] {
  return REPORTER_COURTS[reporter] || [];
} 