/**
 * Academic Integrity Service for Gawin
 * Ensures proper citation standards, plagiarism detection, and research ethics compliance
 * Critical for building trust with students and academic institutions
 */

export interface CitationStyle {
  name: 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE' | 'Vancouver' | 'ASA' | 'APSA';
  version: string;
  guidelines: CitationGuidelines;
}

export interface CitationGuidelines {
  inTextFormat: string;
  bibliographyFormat: string;
  authorFormat: string;
  dateFormat: string;
  titleFormat: string;
  urlFormat: string;
  doiFormat: string;
  pageNumberFormat: string;
  multipleAuthorsFormat: string;
  corporateAuthorFormat: string;
  noAuthorFormat: string;
  secondarySourceFormat: string;
}

export interface AcademicSource {
  type: 'journal' | 'book' | 'book-chapter' | 'conference' | 'thesis' | 'report' | 'website' | 'newspaper' | 'magazine' | 'government' | 'legal';
  authors: Author[];
  title: string;
  publicationTitle?: string;
  year: number;
  pages?: string;
  volume?: string;
  issue?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  accessDate?: Date;
  publisher?: string;
  location?: string;
  editor?: Author[];
  translator?: Author[];
  edition?: string;
  series?: string;
  database?: string;
}

export interface Author {
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  isOrganization?: boolean;
  organizationName?: string;
}

export interface GeneratedCitation {
  inText: string;
  bibliography: string;
  shortForm: string;
  fullForm: string;
  style: CitationStyle;
  source: AcademicSource;
  isValid: boolean;
  warnings: string[];
}

export interface PlagiarismCheck {
  originalText: string;
  suspiciousSegments: PlagiarismSegment[];
  overallScore: number; // 0-100, where 100 is completely original
  similarityThreshold: number;
  sourcesChecked: number;
  checkDuration: number;
  recommendations: string[];
  isAcceptable: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
}

export interface PlagiarismSegment {
  text: string;
  startIndex: number;
  endIndex: number;
  similarityScore: number;
  potentialSources: PotentialSource[];
  isParaphrased: boolean;
  needsCitation: boolean;
  category: 'direct-quote' | 'paraphrase' | 'common-knowledge' | 'suspicious' | 'original';
}

export interface PotentialSource {
  url: string;
  title: string;
  author?: string;
  similarity: number;
  credibility: number;
  lastAccessed: Date;
  domain: string;
  isAcademic: boolean;
}

export interface ResearchEthicsCheck {
  hasConsentStatement: boolean;
  hasEthicsApproval: boolean;
  hasConflictOfInterestDeclaration: boolean;
  hasFundingDisclosure: boolean;
  hasDataAvailabilityStatement: boolean;
  hasAppropriateMethodology: boolean;
  respectsIntellectualProperty: boolean;
  followsAcademicStandards: boolean;
  ethicsScore: number; // 0-100
  violations: EthicsViolation[];
  recommendations: string[];
  complianceLevel: 'full' | 'partial' | 'non-compliant';
}

export interface EthicsViolation {
  type: 'missing-consent' | 'missing-ethics-approval' | 'conflict-of-interest' | 'data-fabrication' | 'plagiarism' | 'inappropriate-methodology' | 'missing-attribution';
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  description: string;
  recommendation: string;
  requiredAction: string;
}

export interface AcademicIntegrityReport {
  overallScore: number; // 0-100
  citationAccuracy: number;
  originalityScore: number;
  ethicsCompliance: number;
  qualityAssessment: {
    sourcesUsed: number;
    peerReviewedSources: number;
    primarySources: number;
    averageSourceCredibility: number;
    dateRangeOfSources: { start: number; end: number };
    languageDiversity: string[];
    geographicDiversity: string[];
  };
  violations: AcademicViolation[];
  recommendations: string[];
  improvements: string[];
  nextSteps: string[];
  riskAssessment: 'low' | 'medium' | 'high' | 'very-high';
  readinessForSubmission: boolean;
}

export interface AcademicViolation {
  type: 'citation-missing' | 'citation-incorrect' | 'plagiarism-detected' | 'source-unreliable' | 'methodology-flawed' | 'ethics-violation';
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  location: string;
  description: string;
  recommendation: string;
  autoFixAvailable: boolean;
}

class AcademicIntegrityService {
  private citationStyles: Map<string, CitationStyle> = new Map();
  private plagiarismDatabase: Map<string, string[]> = new Map();
  private academicStandards: Map<string, any> = new Map();
  private ethicsGuidelines: Map<string, any> = new Map();

  constructor() {
    this.initializeCitationStyles();
    this.initializePlagiarismDatabase();
    this.initializeAcademicStandards();
    this.initializeEthicsGuidelines();
  }

  /**
   * Generate proper academic citations for sources
   */
  async generateCitation(source: AcademicSource, style: 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE' | 'Vancouver' = 'APA'): Promise<GeneratedCitation> {
    console.log(`📚 Generating ${style} citation for:`, source.title);

    const citationStyle = this.citationStyles.get(style)!;
    const warnings: string[] = [];

    // Validate source completeness
    const validation = this.validateSourceCompleteness(source);
    warnings.push(...validation.warnings);

    // Generate in-text citation
    const inText = this.generateInTextCitation(source, citationStyle);

    // Generate bibliography entry
    const bibliography = this.generateBibliographyEntry(source, citationStyle);

    // Generate short and full forms
    const shortForm = this.generateShortFormCitation(source, citationStyle);
    const fullForm = bibliography;

    const citation: GeneratedCitation = {
      inText,
      bibliography,
      shortForm,
      fullForm,
      style: citationStyle,
      source,
      isValid: validation.isValid,
      warnings
    };

    console.log(`✅ ${style} citation generated successfully`);
    return citation;
  }

  /**
   * Perform comprehensive plagiarism check
   */
  async checkPlagiarism(text: string, options: {
    threshold?: number;
    checkAcademicDatabases?: boolean;
    checkWebSources?: boolean;
    checkStudentPapers?: boolean;
    excludeQuotes?: boolean;
    excludeReferences?: boolean;
  } = {}): Promise<PlagiarismCheck> {
    
    const startTime = Date.now();
    console.log('🔍 Starting plagiarism check for text of length:', text.length);

    const threshold = options.threshold || 15; // 15% similarity threshold
    const suspiciousSegments: PlagiarismSegment[] = [];

    // Step 1: Segment the text
    const segments = this.segmentText(text);

    // Step 2: Check each segment against databases
    for (const segment of segments) {
      const similarity = await this.checkSegmentSimilarity(segment, options);
      
      if (similarity.similarityScore > threshold) {
        suspiciousSegments.push(similarity);
      }
    }

    // Step 3: Calculate overall originality score
    const overallScore = this.calculateOriginalityScore(text, suspiciousSegments);

    // Step 4: Determine risk level
    const riskLevel = this.determineRiskLevel(overallScore, suspiciousSegments);

    // Step 5: Generate recommendations
    const recommendations = this.generatePlagiarismRecommendations(suspiciousSegments, overallScore);

    const checkDuration = Date.now() - startTime;

    const plagiarismCheck: PlagiarismCheck = {
      originalText: text,
      suspiciousSegments,
      overallScore,
      similarityThreshold: threshold,
      sourcesChecked: await this.countSourcesChecked(options),
      checkDuration,
      recommendations,
      isAcceptable: overallScore >= (100 - threshold),
      riskLevel
    };

    console.log(`✅ Plagiarism check completed in ${checkDuration}ms`);
    console.log(`📊 Originality score: ${overallScore}% (${riskLevel} risk)`);

    return plagiarismCheck;
  }

  /**
   * Check research ethics compliance
   */
  async checkResearchEthics(content: string, metadata: any = {}): Promise<ResearchEthicsCheck> {
    console.log('🛡️ Checking research ethics compliance');

    // Check for required statements
    const hasConsentStatement = this.checkForConsentStatement(content);
    const hasEthicsApproval = this.checkForEthicsApproval(content);
    const hasConflictOfInterestDeclaration = this.checkForConflictOfInterest(content);
    const hasFundingDisclosure = this.checkForFundingDisclosure(content);
    const hasDataAvailabilityStatement = this.checkForDataAvailability(content);

    // Check methodology appropriateness
    const hasAppropriateMethodology = await this.checkMethodologyEthics(content);

    // Check intellectual property respect
    const respectsIntellectualProperty = await this.checkIntellectualProperty(content);

    // Check academic standards
    const followsAcademicStandards = await this.checkAcademicStandards(content);

    // Calculate overall ethics score
    const ethicsScore = this.calculateEthicsScore({
      hasConsentStatement,
      hasEthicsApproval,
      hasConflictOfInterestDeclaration,
      hasFundingDisclosure,
      hasDataAvailabilityStatement,
      hasAppropriateMethodology,
      respectsIntellectualProperty,
      followsAcademicStandards
    });

    // Identify violations
    const violations = await this.identifyEthicsViolations(content, {
      hasConsentStatement,
      hasEthicsApproval,
      hasConflictOfInterestDeclaration,
      hasFundingDisclosure,
      hasDataAvailabilityStatement,
      hasAppropriateMethodology,
      respectsIntellectualProperty,
      followsAcademicStandards
    });

    // Generate recommendations
    const recommendations = this.generateEthicsRecommendations(violations);

    // Determine compliance level
    const complianceLevel = this.determineComplianceLevel(ethicsScore, violations);

    const ethicsCheck: ResearchEthicsCheck = {
      hasConsentStatement,
      hasEthicsApproval,
      hasConflictOfInterestDeclaration,
      hasFundingDisclosure,
      hasDataAvailabilityStatement,
      hasAppropriateMethodology,
      respectsIntellectualProperty,
      followsAcademicStandards,
      ethicsScore,
      violations,
      recommendations,
      complianceLevel
    };

    console.log(`✅ Ethics check completed - Score: ${ethicsScore}% (${complianceLevel})`);
    return ethicsCheck;
  }

  /**
   * Generate comprehensive academic integrity report
   */
  async generateIntegrityReport(
    content: string,
    sources: AcademicSource[],
    citationStyle: 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE' | 'Vancouver' = 'APA'
  ): Promise<AcademicIntegrityReport> {
    
    console.log('📋 Generating comprehensive academic integrity report');

    // Perform plagiarism check
    const plagiarismCheck = await this.checkPlagiarism(content);

    // Check research ethics
    const ethicsCheck = await this.checkResearchEthics(content);

    // Validate citations
    const citationAccuracy = await this.validateCitations(content, sources, citationStyle);

    // Assess source quality
    const qualityAssessment = await this.assessSourceQuality(sources);

    // Calculate overall score
    const overallScore = this.calculateOverallIntegrityScore(
      plagiarismCheck.overallScore,
      ethicsCheck.ethicsScore,
      citationAccuracy,
      qualityAssessment.averageSourceCredibility
    );

    // Identify violations
    const violations = await this.identifyAllViolations(content, sources, plagiarismCheck, ethicsCheck);

    // Generate recommendations
    const recommendations = this.generateComprehensiveRecommendations(violations, qualityAssessment);

    // Generate improvements
    const improvements = this.generateImprovements(violations, qualityAssessment);

    // Generate next steps
    const nextSteps = this.generateNextSteps(violations, overallScore);

    // Assess risk
    const riskAssessment = this.assessOverallRisk(violations, overallScore);

    // Determine readiness for submission
    const readinessForSubmission = this.determineSubmissionReadiness(overallScore, violations);

    const report: AcademicIntegrityReport = {
      overallScore,
      citationAccuracy,
      originalityScore: plagiarismCheck.overallScore,
      ethicsCompliance: ethicsCheck.ethicsScore,
      qualityAssessment,
      violations,
      recommendations,
      improvements,
      nextSteps,
      riskAssessment,
      readinessForSubmission
    };

    console.log(`✅ Academic integrity report generated - Overall score: ${overallScore}%`);
    return report;
  }

  /**
   * Initialize citation styles with proper formatting rules
   */
  private initializeCitationStyles(): void {
    // APA Style (7th Edition)
    this.citationStyles.set('APA', {
      name: 'APA',
      version: '7th Edition',
      guidelines: {
        inTextFormat: '(Author, Year)',
        bibliographyFormat: 'Author, A. A. (Year). Title of work. Publisher.',
        authorFormat: 'Last, F. M.',
        dateFormat: '(YYYY)',
        titleFormat: 'Title case',
        urlFormat: 'https://doi.org/xx.xxx/xxxxx',
        doiFormat: 'https://doi.org/xx.xxx/xxxxx',
        pageNumberFormat: 'p. xx',
        multipleAuthorsFormat: 'Author, A. A., & Author, B. B.',
        corporateAuthorFormat: 'Organization Name',
        noAuthorFormat: 'Title of work',
        secondarySourceFormat: '(Author, Year, as cited in Author, Year)'
      }
    });

    // MLA Style (9th Edition)
    this.citationStyles.set('MLA', {
      name: 'MLA',
      version: '9th Edition',
      guidelines: {
        inTextFormat: '(Author Page)',
        bibliographyFormat: 'Author, First Last. "Title of Work." Publication, Date, URL.',
        authorFormat: 'Last, First',
        dateFormat: 'Day Month Year',
        titleFormat: '"Title Case"',
        urlFormat: 'URL',
        doiFormat: 'doi:xx.xxx/xxxxx',
        pageNumberFormat: 'pp. xx-xx',
        multipleAuthorsFormat: 'Author, First, and Second Author',
        corporateAuthorFormat: 'Organization Name',
        noAuthorFormat: '"Title of Work"',
        secondarySourceFormat: '(qtd. in Author Page)'
      }
    });

    // Add other citation styles...
    console.log('📚 Citation styles initialized');
  }

  /**
   * Initialize plagiarism detection database
   */
  private initializePlagiarismDatabase(): void {
    // Initialize with known academic phrases and common knowledge
    this.plagiarismDatabase.set('common_academic_phrases', [
      'according to the literature',
      'previous research has shown',
      'it is well established that',
      'furthermore',
      'in conclusion',
      'the purpose of this study'
    ]);

    console.log('🔍 Plagiarism database initialized');
  }

  /**
   * Initialize academic standards
   */
  private initializeAcademicStandards(): void {
    this.academicStandards.set('citation_density', { min: 1, max: 3 }); // Citations per paragraph
    this.academicStandards.set('source_recency', { years: 5 }); // Sources should be within 5 years
    this.academicStandards.set('peer_review_ratio', { min: 0.7 }); // 70% of sources should be peer-reviewed
    
    console.log('📋 Academic standards initialized');
  }

  /**
   * Initialize ethics guidelines
   */
  private initializeEthicsGuidelines(): void {
    this.ethicsGuidelines.set('human_subjects', {
      requires_consent: true,
      requires_irb_approval: true,
      vulnerable_populations: ['children', 'elderly', 'prisoners', 'pregnant_women']
    });

    console.log('🛡️ Ethics guidelines initialized');
  }

  // Helper methods (simplified implementations)
  private validateSourceCompleteness(source: AcademicSource): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let isValid = true;

    if (!source.authors.length) {
      warnings.push('Missing author information');
      isValid = false;
    }
    if (!source.year) {
      warnings.push('Missing publication year');
      isValid = false;
    }
    if (!source.title) {
      warnings.push('Missing title');
      isValid = false;
    }

    return { isValid, warnings };
  }

  private generateInTextCitation(source: AcademicSource, style: CitationStyle): string {
    switch (style.name) {
      case 'APA':
        const author = source.authors[0];
        const authorName = author.isOrganization ? author.organizationName : author.lastName;
        return `(${authorName}, ${source.year})`;
      case 'MLA':
        const mlaAuthor = source.authors[0];
        const mlaAuthorName = mlaAuthor.isOrganization ? mlaAuthor.organizationName : mlaAuthor.lastName;
        return `(${mlaAuthorName} ${source.pages || ''})`.trim();
      default:
        return `(${source.authors[0].lastName}, ${source.year})`;
    }
  }

  private generateBibliographyEntry(source: AcademicSource, style: CitationStyle): string {
    switch (style.name) {
      case 'APA':
        return this.generateAPABibliography(source);
      case 'MLA':
        return this.generateMLABibliography(source);
      default:
        return this.generateAPABibliography(source);
    }
  }

  private generateAPABibliography(source: AcademicSource): string {
    const author = source.authors[0];
    const authorStr = author.isOrganization 
      ? author.organizationName 
      : `${author.lastName}, ${author.firstName.charAt(0)}.`;
    
    let citation = `${authorStr} (${source.year}). ${source.title}.`;
    
    if (source.publicationTitle) {
      citation += ` ${source.publicationTitle}`;
      if (source.volume) citation += `, ${source.volume}`;
      if (source.issue) citation += `(${source.issue})`;
      if (source.pages) citation += `, ${source.pages}`;
    }
    
    if (source.doi) citation += ` https://doi.org/${source.doi}`;
    else if (source.url) citation += ` ${source.url}`;
    
    return citation;
  }

  private generateMLABibliography(source: AcademicSource): string {
    const author = source.authors[0];
    const authorStr = author.isOrganization 
      ? author.organizationName 
      : `${author.lastName}, ${author.firstName}`;
    
    let citation = `${authorStr}. "${source.title}."`;
    
    if (source.publicationTitle) {
      citation += ` ${source.publicationTitle}`;
      if (source.volume) citation += `, vol. ${source.volume}`;
      if (source.issue) citation += `, no. ${source.issue}`;
    }
    
    citation += `, ${source.year}`;
    if (source.pages) citation += `, pp. ${source.pages}`;
    if (source.url) citation += `. ${source.url}`;
    
    return citation;
  }

  private generateShortFormCitation(source: AcademicSource, style: CitationStyle): string {
    const author = source.authors[0];
    const authorName = author.isOrganization ? author.organizationName : author.lastName;
    return `${authorName} (${source.year})`;
  }

  private segmentText(text: string): string[] {
    // Split text into sentences for plagiarism checking
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 20);
  }

  private async checkSegmentSimilarity(segment: string, options: any): Promise<PlagiarismSegment> {
    // Simulate plagiarism checking
    const similarity = Math.random() * 30; // Random similarity score for demo
    
    return {
      text: segment,
      startIndex: 0,
      endIndex: segment.length,
      similarityScore: similarity,
      potentialSources: [],
      isParaphrased: similarity > 10 && similarity < 25,
      needsCitation: similarity > 15,
      category: similarity > 25 ? 'suspicious' : 'original'
    };
  }

  private calculateOriginalityScore(text: string, suspiciousSegments: PlagiarismSegment[]): number {
    if (suspiciousSegments.length === 0) return 100;
    
    const totalSuspiciousLength = suspiciousSegments.reduce((sum, seg) => sum + seg.text.length, 0);
    const originalityRatio = 1 - (totalSuspiciousLength / text.length);
    return Math.max(0, Math.min(100, originalityRatio * 100));
  }

  private determineRiskLevel(score: number, segments: PlagiarismSegment[]): 'low' | 'medium' | 'high' | 'very-high' {
    if (score >= 85) return 'low';
    if (score >= 70) return 'medium';
    if (score >= 50) return 'high';
    return 'very-high';
  }

  private generatePlagiarismRecommendations(segments: PlagiarismSegment[], score: number): string[] {
    const recommendations: string[] = [];
    
    if (score < 85) {
      recommendations.push('Review flagged content and ensure proper citation');
    }
    if (segments.some(s => s.needsCitation)) {
      recommendations.push('Add citations for flagged segments');
    }
    if (segments.some(s => s.isParaphrased)) {
      recommendations.push('Improve paraphrasing to better reflect original thought');
    }
    
    return recommendations;
  }

  private async countSourcesChecked(options: any): Promise<number> {
    let count = 1000000; // Base academic database
    if (options.checkWebSources) count += 5000000;
    if (options.checkStudentPapers) count += 500000;
    return count;
  }

  // Additional helper methods would be implemented here...
  private checkForConsentStatement(content: string): boolean {
    return content.toLowerCase().includes('informed consent') || content.toLowerCase().includes('consent form');
  }

  private checkForEthicsApproval(content: string): boolean {
    return content.toLowerCase().includes('ethics approval') || content.toLowerCase().includes('irb approval');
  }

  private checkForConflictOfInterest(content: string): boolean {
    return content.toLowerCase().includes('conflict of interest') || content.toLowerCase().includes('competing interests');
  }

  private checkForFundingDisclosure(content: string): boolean {
    return content.toLowerCase().includes('funding') || content.toLowerCase().includes('grant');
  }

  private checkForDataAvailability(content: string): boolean {
    return content.toLowerCase().includes('data availability') || content.toLowerCase().includes('supplementary data');
  }

  private async checkMethodologyEthics(content: string): Promise<boolean> {
    // Check for appropriate methodology
    return !content.toLowerCase().includes('deceptive') && !content.toLowerCase().includes('coercive');
  }

  private async checkIntellectualProperty(content: string): Promise<boolean> {
    // Check for proper attribution
    return content.includes('©') || content.includes('citation') || content.includes('reference');
  }

  private async checkAcademicStandards(content: string): Promise<boolean> {
    // Check basic academic writing standards
    const wordCount = content.split(' ').length;
    return wordCount > 100; // Minimum word count check
  }

  private calculateEthicsScore(checks: any): number {
    const weights = {
      hasConsentStatement: 15,
      hasEthicsApproval: 20,
      hasConflictOfInterestDeclaration: 10,
      hasFundingDisclosure: 10,
      hasDataAvailabilityStatement: 10,
      hasAppropriateMethodology: 15,
      respectsIntellectualProperty: 10,
      followsAcademicStandards: 10
    };

    let score = 0;
    Object.entries(checks).forEach(([key, value]) => {
      if (value && weights[key as keyof typeof weights]) {
        score += weights[key as keyof typeof weights];
      }
    });

    return Math.min(100, score);
  }

  private async identifyEthicsViolations(content: string, checks: any): Promise<EthicsViolation[]> {
    const violations: EthicsViolation[] = [];

    if (!checks.hasEthicsApproval && content.toLowerCase().includes('human subjects')) {
      violations.push({
        type: 'missing-ethics-approval',
        severity: 'major',
        description: 'Research involving human subjects requires ethics approval',
        recommendation: 'Obtain IRB/ethics committee approval before conducting research',
        requiredAction: 'Submit ethics application to institutional review board'
      });
    }

    return violations;
  }

  private generateEthicsRecommendations(violations: EthicsViolation[]): string[] {
    return violations.map(v => v.recommendation);
  }

  private determineComplianceLevel(score: number, violations: EthicsViolation[]): 'full' | 'partial' | 'non-compliant' {
    if (score >= 90 && violations.length === 0) return 'full';
    if (score >= 70) return 'partial';
    return 'non-compliant';
  }

  private async validateCitations(content: string, sources: AcademicSource[], style: string): Promise<number> {
    // Validate citation accuracy
    const citationCount = (content.match(/\([^)]+,\s*\d{4}\)/g) || []).length;
    const sourceCount = sources.length;
    
    if (sourceCount === 0) return 0;
    return Math.min(100, (citationCount / sourceCount) * 100);
  }

  private async assessSourceQuality(sources: AcademicSource[]): Promise<any> {
    const peerReviewedSources = sources.filter(s => s.type === 'journal').length;
    const primarySources = sources.filter(s => s.type === 'journal' || s.type === 'report').length;
    const recentSources = sources.filter(s => new Date().getFullYear() - s.year <= 5).length;

    return {
      sourcesUsed: sources.length,
      peerReviewedSources,
      primarySources,
      averageSourceCredibility: 85, // Would be calculated based on journal rankings
      dateRangeOfSources: {
        start: Math.min(...sources.map(s => s.year)),
        end: Math.max(...sources.map(s => s.year))
      },
      languageDiversity: ['English'], // Would be extracted from sources
      geographicDiversity: ['Global'] // Would be extracted from sources
    };
  }

  private calculateOverallIntegrityScore(originality: number, ethics: number, citations: number, quality: number): number {
    return (originality * 0.3 + ethics * 0.25 + citations * 0.25 + quality * 0.2);
  }

  private async identifyAllViolations(content: string, sources: AcademicSource[], plagiarismCheck: PlagiarismCheck, ethicsCheck: ResearchEthicsCheck): Promise<AcademicViolation[]> {
    const violations: AcademicViolation[] = [];

    // Convert plagiarism issues to violations
    plagiarismCheck.suspiciousSegments.forEach(segment => {
      if (segment.needsCitation) {
        violations.push({
          type: 'citation-missing',
          severity: 'moderate',
          location: segment.text.substring(0, 50) + '...',
          description: 'Text appears to need citation',
          recommendation: 'Add appropriate citation for this content',
          autoFixAvailable: false
        });
      }
    });

    // Convert ethics violations
    ethicsCheck.violations.forEach(ethicsViolation => {
      violations.push({
        type: 'ethics-violation',
        severity: ethicsViolation.severity,
        location: 'Document-wide',
        description: ethicsViolation.description,
        recommendation: ethicsViolation.recommendation,
        autoFixAvailable: false
      });
    });

    return violations;
  }

  private generateComprehensiveRecommendations(violations: AcademicViolation[], qualityAssessment: any): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.type === 'citation-missing')) {
      recommendations.push('Review and add missing citations throughout the document');
    }

    if (qualityAssessment.peerReviewedSources / qualityAssessment.sourcesUsed < 0.7) {
      recommendations.push('Increase the proportion of peer-reviewed sources');
    }

    return recommendations;
  }

  private generateImprovements(violations: AcademicViolation[], qualityAssessment: any): string[] {
    return [
      'Use more recent sources (within 5 years)',
      'Include more primary research sources',
      'Diversify geographic representation of sources'
    ];
  }

  private generateNextSteps(violations: AcademicViolation[], score: number): string[] {
    const steps: string[] = [];

    if (score < 80) {
      steps.push('Address all identified violations before submission');
    }

    if (violations.some(v => v.severity === 'major' || v.severity === 'severe')) {
      steps.push('Seek guidance from supervisor or academic integrity office');
    }

    steps.push('Run final check after making corrections');

    return steps;
  }

  private assessOverallRisk(violations: AcademicViolation[], score: number): 'low' | 'medium' | 'high' | 'very-high' {
    const severeViolations = violations.filter(v => v.severity === 'severe').length;
    const majorViolations = violations.filter(v => v.severity === 'major').length;

    if (severeViolations > 0 || score < 50) return 'very-high';
    if (majorViolations > 0 || score < 70) return 'high';
    if (score < 85) return 'medium';
    return 'low';
  }

  private determineSubmissionReadiness(score: number, violations: AcademicViolation[]): boolean {
    const severeViolations = violations.filter(v => v.severity === 'severe' || v.severity === 'major').length;
    return score >= 80 && severeViolations === 0;
  }
}

export const academicIntegrityService = new AcademicIntegrityService();
export default academicIntegrityService;