/**
 * Comprehensive Content Filter Service for Gawin
 * Provides multi-language content filtering including Filipino/Tagalog
 * Blocks inappropriate content while allowing academic context
 */

export interface ContentFilterResult {
  isBlocked: boolean;
  category: 'sexual' | 'profanity' | 'explicit' | 'clean' | 'academic_context';
  confidence: number;
  detectedLanguage: string;
  reason?: string;
  suggestedResponse?: string;
}

export interface FilteredContent {
  original: string;
  filtered: string;
  wasFiltered: boolean;
  filterResult: ContentFilterResult;
}

class ContentFilterService {

  // Filipino/Tagalog sexual content and slang
  private filipinoSexualTerms = [
    // Male anatomy (vulgar)
    'titi', 'burat', 'tarugo', 'bayag', 'itlog',
    'tite', 'burat', 'etits', 'alaga', 'junior',

    // Female anatomy (vulgar)
    'puke', 'kepyas', 'bilbil', 'tarat', 'pekpek',
    'hiyas', 'puday', 'kuwat', 'pepe', 'keps',

    // Sexual acts (vulgar)
    'kantot', 'kantutan', 'jakol', 'salsal', 'chupa',
    'tsupa', 'oral', 'blow', 'finger', 'doggy',
    'missionary', 'cowgirl', 'reverse', 'anal',
    'creampie', 'cumshot', 'facial', 'threesome',

    // Sexual descriptors
    'libog', 'malibog', 'nalibugan', 'kalibugan',
    'horny', 'hot', 'sexy', 'maputi', 'malaki',
    'maliit', 'masarap', 'mainit', 'masikip'
  ];

  // Filipino/Tagalog profanity and curse words
  private filipinoProfanity = [
    // Strong profanity
    'putang ina', 'putangina', 'puta', 'gago', 'gaga',
    'tangina', 'tanginamo', 'kingina', 'leche',
    'peste', 'bwisit', 'hudas', 'ulol', 'bobo',
    'tanga', 'kupal', 'hinayupak', 'hayup',
    'pokpok', 'malandi', 'pokpok', 'saging',

    // Moderate profanity
    'shit', 'fuck', 'damn', 'hell', 'crap',
    'bitch', 'asshole', 'dick', 'pussy',

    // Religious profanity
    'susmariosep', 'jusko', 'diyos ko', 'santo nino'
  ];

  // English sexual content (comprehensive)
  private englishSexualTerms = [
    // Anatomy
    'penis', 'vagina', 'breast', 'nipple', 'clitoris',
    'labia', 'scrotum', 'testicles', 'anus', 'buttocks',
    'dick', 'cock', 'pussy', 'tits', 'ass', 'boobs',

    // Acts
    'sex', 'intercourse', 'masturbation', 'oral sex',
    'anal sex', 'foreplay', 'orgasm', 'climax',
    'fuck', 'screw', 'bang', 'nail', 'pound',

    // Slang
    'horny', 'wet', 'hard', 'cum', 'jizz', 'sperm',
    'blow job', 'hand job', 'finger', 'lick', 'suck'
  ];

  // Academic/medical context keywords
  private academicContexts = [
    'anatomy', 'biology', 'medical', 'health', 'education',
    'research', 'study', 'scientific', 'clinical', 'textbook',
    'academic', 'university', 'school', 'learning', 'reproductive',
    'physiology', 'psychology', 'sociology', 'anthropology'
  ];

  // Educational content that should bypass filtering
  private educationalBypass = [
    'quiz', 'questions', 'generate', 'mathematics', 'physics',
    'chemistry', 'biology', 'computer science', 'engineering',
    'test', 'exam', 'practice', 'multiple choice', 'mcq',
    'difficulty', 'easy', 'medium', 'hard', 'explanation'
  ];

  // Academic clarification questions
  private academicClarifications = [
    "I understand you're asking about anatomy. Is this for educational, medical, or academic purposes?",
    "This seems like a health or biology question. Can you clarify the academic context?",
    "Are you asking this for educational research or medical information?",
    "Is this question related to your studies, health education, or medical consultation?",
    "I can help with educational content. What's the academic or medical context of your question?"
  ];

  // Blocked response templates
  private blockedResponses = {
    sexual: [
      "I'm designed to keep our conversations respectful and appropriate. Let's talk about something else!",
      "I prefer to keep our chats clean and helpful. What else can I assist you with?",
      "Let's keep our conversation appropriate. Is there something else I can help you with?",
      "I'm here to have respectful conversations. What other topics can I help you explore?"
    ],
    profanity: [
      "Let's keep our conversation respectful. I'm here to help with positive discussions!",
      "I prefer positive and respectful language. What can I help you with today?",
      "Let's maintain a respectful tone. How else can I assist you?",
      "I'm here for helpful and respectful conversations. What else would you like to discuss?"
    ],
    explicit: [
      "I'm designed to keep our conversations respectful and appropriate. Let's discuss something else!",
      "Let's keep our conversation appropriate and helpful. What other topics can I assist with?",
      "I prefer to maintain respectful discussions. How else can I help you today?",
      "I'm here for appropriate and constructive conversations. What would you like to explore?"
    ],
    academic_context: [
      "I notice you may be asking for academic or educational purposes. Could you clarify the context?",
      "For academic discussions, I'd appreciate more context about your educational needs.",
      "I want to ensure I provide appropriate academic support. Could you provide more details?",
      "For educational purposes, please clarify the specific academic context you need help with."
    ],
    general: [
      "I'd prefer to keep our conversation appropriate and helpful. What else can I assist you with?",
      "Let's focus on positive and constructive topics. How can I help you today?",
      "I'm here to have respectful and helpful conversations. What would you like to explore?"
    ]
  };

  /**
   * Main content filtering method
   */
  filterContent(input: string): FilteredContent {
    const lowerInput = input.toLowerCase().trim();

    // Check for educational bypass first (quiz generation, etc.)
    if (this.isEducationalContent(lowerInput)) {
      return {
        original: input,
        filtered: input,
        wasFiltered: false,
        filterResult: {
          isBlocked: false,
          category: 'clean',
          confidence: 0.95,
          detectedLanguage: this.detectLanguage(input),
          reason: 'Educational content - bypassed filtering'
        }
      };
    }

    // Check for academic context first
    const hasAcademicContext = this.hasAcademicContext(lowerInput);

    // If academic context detected, ask for clarification instead of blocking
    if (hasAcademicContext && this.containsInappropriateContent(lowerInput)) {
      const clarification = this.getRandomClarification();
      return {
        original: input,
        filtered: clarification,
        wasFiltered: true,
        filterResult: {
          isBlocked: false,
          category: 'academic_context',
          confidence: 0.8,
          detectedLanguage: this.detectLanguage(input),
          reason: 'Academic context detected - requesting clarification',
          suggestedResponse: clarification
        }
      };
    }

    // Check for inappropriate content
    const filterResult = this.analyzeContent(lowerInput);

    if (filterResult.isBlocked && filterResult.category !== 'clean') {
      const category = filterResult.category as 'sexual' | 'profanity' | 'explicit' | 'academic_context';
      const blockedResponse = this.getBlockedResponse(category);
      return {
        original: input,
        filtered: blockedResponse,
        wasFiltered: true,
        filterResult: {
          ...filterResult,
          suggestedResponse: blockedResponse
        }
      };
    }

    // Content is clean
    return {
      original: input,
      filtered: input,
      wasFiltered: false,
      filterResult
    };
  }

  /**
   * Analyze content for inappropriate material
   */
  private analyzeContent(input: string): ContentFilterResult {
    const detectedLanguage = this.detectLanguage(input);

    // Check Filipino sexual content
    const filipinoSexualMatch = this.filipinoSexualTerms.find(term =>
      input.includes(term) || this.fuzzyMatch(input, term)
    );

    if (filipinoSexualMatch) {
      return {
        isBlocked: true,
        category: 'sexual',
        confidence: 0.9,
        detectedLanguage,
        reason: `Filipino sexual content detected: ${filipinoSexualMatch}`
      };
    }

    // Check Filipino profanity
    const filipinoProfanityMatch = this.filipinoProfanity.find(term =>
      input.includes(term) || this.fuzzyMatch(input, term)
    );

    if (filipinoProfanityMatch) {
      return {
        isBlocked: true,
        category: 'profanity',
        confidence: 0.9,
        detectedLanguage,
        reason: `Filipino profanity detected: ${filipinoProfanityMatch}`
      };
    }

    // Check English sexual content
    const englishSexualMatch = this.englishSexualTerms.find(term =>
      input.includes(term) || this.fuzzyMatch(input, term)
    );

    if (englishSexualMatch) {
      return {
        isBlocked: true,
        category: 'sexual',
        confidence: 0.8,
        detectedLanguage,
        reason: `English sexual content detected: ${englishSexualMatch}`
      };
    }

    // Check for explicit patterns
    const explicitPatterns = [
      /\b(malaki|maliit)\s+(ba|ang)?\s*(titi|burat|penis)\b/i,
      /\b(masarap|mainit)\s+(ba|ang)?\s*(puke|pussy)\b/i,
      /\b(gusto|want)\s+(ko|mo|niya)?\s*(kantot|sex|fuck)\b/i,
      /\b(how|paano)\s+(big|malaki|to|para)\s+(cum|labasan)\b/i
    ];

    for (const pattern of explicitPatterns) {
      if (pattern.test(input)) {
        return {
          isBlocked: true,
          category: 'explicit',
          confidence: 0.95,
          detectedLanguage,
          reason: 'Explicit pattern detected'
        };
      }
    }

    return {
      isBlocked: false,
      category: 'clean',
      confidence: 0.9,
      detectedLanguage
    };
  }

  /**
   * Check if content is educational and should bypass filtering
   */
  private isEducationalContent(input: string): boolean {
    const educationalTermCount = this.educationalBypass.filter(term =>
      input.includes(term)
    ).length;

    // If multiple educational terms are present, it's likely educational content
    return educationalTermCount >= 2;
  }

  /**
   * Check if content contains academic context
   */
  private hasAcademicContext(input: string): boolean {
    return this.academicContexts.some(term => input.includes(term));
  }

  /**
   * Check if content contains inappropriate material (for academic context check)
   */
  private containsInappropriateContent(input: string): boolean {
    return [...this.filipinoSexualTerms, ...this.englishSexualTerms].some(term =>
      input.includes(term) || this.fuzzyMatch(input, term)
    );
  }

  /**
   * Fuzzy matching for variations and typos
   */
  private fuzzyMatch(input: string, term: string): boolean {
    // Simple fuzzy matching - can be enhanced with Levenshtein distance
    const variations = this.generateVariations(term);
    return variations.some(variation => input.includes(variation));
  }

  /**
   * Generate common variations of a term
   */
  private generateVariations(term: string): string[] {
    const variations = [term];

    // Add with numbers replacing letters
    variations.push(term.replace(/i/g, '1').replace(/o/g, '0').replace(/a/g, '@'));

    // Add with extra letters
    variations.push(term.replace(/(.)/g, '$1$1')); // Double letters

    // Add with spaces
    variations.push(term.split('').join(' '));

    // Add reversed
    variations.push(term.split('').reverse().join(''));

    return variations;
  }

  /**
   * Detect language of input
   */
  private detectLanguage(input: string): string {
    const filipinoWords = ['ba', 'ka', 'mo', 'ko', 'ang', 'sa', 'na', 'ng', 'at', 'para', 'kung'];
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of'];

    const filipinoCount = filipinoWords.filter(word => input.includes(` ${word} `) || input.includes(`${word} `) || input.includes(` ${word}`)).length;
    const englishCount = englishWords.filter(word => input.includes(` ${word} `) || input.includes(`${word} `) || input.includes(` ${word}`)).length;

    if (filipinoCount > englishCount) return 'filipino';
    if (englishCount > filipinoCount) return 'english';
    return 'mixed';
  }

  /**
   * Get random academic clarification
   */
  private getRandomClarification(): string {
    return this.academicClarifications[Math.floor(Math.random() * this.academicClarifications.length)];
  }

  /**
   * Get appropriate blocked response
   */
  private getBlockedResponse(category: 'sexual' | 'profanity' | 'explicit' | 'academic_context'): string {
    const responses = this.blockedResponses[category] || this.blockedResponses.general;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Quick check if input should be blocked
   */
  isInappropriate(input: string): boolean {
    return this.analyzeContent(input.toLowerCase()).isBlocked;
  }

  /**
   * Check if response should be allowed with academic clarification
   */
  shouldRequestAcademicClarification(input: string): boolean {
    const lowerInput = input.toLowerCase();
    return this.hasAcademicContext(lowerInput) && this.containsInappropriateContent(lowerInput);
  }
}

export const contentFilterService = new ContentFilterService();
export default ContentFilterService;