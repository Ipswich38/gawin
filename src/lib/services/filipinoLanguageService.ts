/**
 * Filipino Language Service for Gawin
 * Comprehensive support for Filipino, Tagalog, and Taglish
 * Supports both professional and casual conversation styles
 */

export interface LanguageDetectionResult {
  primary: 'english' | 'filipino' | 'tagalog' | 'taglish';
  confidence: number;
  styleType: 'formal' | 'casual' | 'professional' | 'academic' | 'conversational';
  mixedLanguage: boolean;
  filipinoWords: string[];
  englishWords: string[];
  formality: number; // 0-1 scale
  regionalVariant?: 'metro_manila' | 'cebu' | 'davao' | 'general';
}

export interface ResponseGenerationConfig {
  targetLanguage: 'english' | 'filipino' | 'taglish' | 'auto';
  styleType: 'formal' | 'casual' | 'professional' | 'conversational';
  formality: number;
  useRegionalExpressions: boolean;
  adaptToUserStyle: boolean;
  includeFilipinoCulturalContext: boolean;
}

export interface FilipinoLinguisticProfile {
  preferredLanguage: 'english' | 'filipino' | 'taglish';
  defaultFormality: number;
  commonPhrases: string[];
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced' | 'native';
  regionalInfluence: string;
  codeShiftingPatterns: string[];
  culturalReferences: string[];
}

class FilipinoLanguageService {
  private filipinoVocabulary: Set<string> = new Set();
  private tagalogPhrases: Map<string, string> = new Map();
  private casualExpressions: Map<string, string> = new Map();
  private professionalTerms: Map<string, string> = new Map();
  private culturalContext: Map<string, string> = new Map();
  private commonTaglishPatterns: RegExp[] = [];

  constructor() {
    this.initializeVocabulary();
    this.initializePhrases();
    this.initializeExpressions();
    this.initializeCulturalContext();
    this.initializeTaglishPatterns();
    this.initializeAdvancedTagalog();
  }

  /**
   * Initialize Filipino vocabulary database
   */
  private initializeVocabulary(): void {
    this.filipinoVocabulary = new Set([
      // Basic words
      'ako', 'ikaw', 'siya', 'kami', 'kayo', 'sila', 'tayo',
      'ang', 'ng', 'sa', 'na', 'ay', 'at', 'o', 'pero', 'kasi',
      'oo', 'hindi', 'opo', 'hindi po', 'salamat', 'walang anuman',
      
      // Common verbs
      'kumain', 'uminom', 'tulog', 'gising', 'lakad', 'takbo', 'upo', 'tayo',
      'aral', 'trabaho', 'laro', 'sayaw', 'kanta', 'basag', 'ayos',
      'punta', 'balik', 'uwi', 'dating', 'alis', 'tigil', 'simula',
      
      // Family and relationships
      'pamilya', 'nanay', 'tatay', 'kuya', 'ate', 'bunso', 'lola', 'lolo',
      'asawa', 'anak', 'kapatid', 'pinsan', 'tito', 'tita', 'ninong', 'ninang',
      'kaibigan', 'kasama', 'kapamilya', 'kapitbahay', 'kumpare', 'kumare',
      
      // Emotions and expressions
      'masaya', 'malungkot', 'galit', 'takot', 'gulat', 'pagod', 'tamad',
      'excited', 'nervous', 'proud', 'ashamed', 'inlove', 'heartbroken',
      'stress', 'relax', 'chill', 'enjoy', 'boring', 'fun',
      
      // Filipino cultural terms
      'bayanihan', 'kapamilya', 'pasalip', 'pakikipagkunware', 'utang na loob',
      'hiya', 'amor propio', 'pakikipagkapwa', 'malasakit', 'galang',
      
      // Modern Taglish terms
      'naman', 'talaga', 'diba', 'kaya', 'sige', 'tara', 'yun', 'ganun',
      'parang', 'sobrang', 'super', 'grabe', 'ganda', 'cool', 'nice',
      'okay lang', 'ayos lang', 'pwede na', 'sana all', 'char', 'chos',
      
      // Academic/Professional
      'trabaho', 'opisina', 'meeting', 'presentation', 'report', 'deadline',
      'pag-aaral', 'eskwela', 'unibersidad', 'guro', 'estudyante', 'klase',
      'proyekto', 'assignment', 'eksam', 'graduation', 'scholarship',
      
      // Technology terms (Filipino context)
      'cellphone', 'computer', 'internet', 'wifi', 'facebook', 'messenger',
      'video call', 'online class', 'work from home', 'digital', 'apps',
      
      // Filipino time expressions
      'ngayon', 'kanina', 'mamaya', 'bukas', 'kahapon', 'isang linggo',
      'isang buwan', 'taon', 'umaga', 'tanghali', 'hapon', 'gabi',
      'madaling araw', 'hatinggabi', 'weekend', 'weekdays', 'holiday',
      
      // Filipino expressions
      'salamat po', 'kumusta', 'kumusta ka', 'okay lang', 'walang problema',
      'sige lang', 'tara na', 'halika', 'sandali lang', 'wait lang',
      'ito na', 'ayun na', 'ganito', 'ganyan', 'ganoon',
      
      // Food and dining
      'pagkain', 'ulam', 'kanin', 'sabaw', 'dessert', 'merienda',
      'almusal', 'tanghalian', 'hapunan', 'kain tayo', 'busog na',
      'sarap', 'masarap', 'hindi masarap', 'matamis', 'maalat',
      
      // Casual exclamations
      'wow', 'grabe', 'talaga', 'seryoso', 'totoo', 'hindi nga',
      'paano yan', 'alam mo', 'aba', 'naku', 'sus', 'ayy'
    ]);
  }

  /**
   * Initialize Tagalog phrases and their translations
   */
  private initializePhrases(): void {
    this.tagalogPhrases = new Map([
      // Greetings
      ['kumusta', 'how are you'],
      ['kumusta ka', 'how are you'],
      ['mabuti naman', 'I am fine'],
      ['salamat', 'thank you'],
      ['walang anuman', 'you are welcome'],
      ['paalam', 'goodbye'],
      
      // Common expressions
      ['hindi ko alam', 'I don\'t know'],
      ['alam mo ba', 'do you know'],
      ['saan ka pupunta', 'where are you going'],
      ['anong oras na', 'what time is it'],
      ['gutom na ako', 'I am hungry'],
      ['pagod na ako', 'I am tired'],
      
      // Academic/School
      ['mag-aral tayo', 'let\'s study'],
      ['anong lesson natin', 'what\'s our lesson'],
      ['may klase ba', 'is there class'],
      ['tapos na ang klase', 'class is over'],
      ['magkano ang tuition', 'how much is the tuition'],
      
      // Work/Professional
      ['anong trabaho mo', 'what\'s your job'],
      ['nasaan ang opisina', 'where is the office'],
      ['may meeting tayo', 'we have a meeting'],
      ['deadline bukas', 'deadline is tomorrow'],
      ['overtime ako', 'I\'m working overtime'],
      
      // Technology
      ['walang internet', 'no internet'],
      ['charge mo cellphone mo', 'charge your phone'],
      ['nag-loading pa', 'still loading'],
      ['send mo sa akin', 'send it to me'],
      ['i-download mo', 'download it'],
      
      // Emotions
      ['masaya ako', 'I am happy'],
      ['nalungkot ako', 'I became sad'],
      ['nagalit ako', 'I got angry'],
      ['kinabahan ako', 'I got nervous'],
      ['na-stress ako', 'I got stressed'],
      
      // Filipino cultural expressions
      ['bahala na', 'come what may / let it be'],
      ['pakikipagkunware', 'pretending / acting'],
      ['utang na loob', 'debt of gratitude'],
      ['hiya naman', 'how embarrassing'],
      ['pasalip naman', 'trying to get attention indirectly']
    ]);
  }

  /**
   * Initialize casual and formal expressions
   */
  private initializeExpressions(): void {
    this.casualExpressions = new Map([
      // Casual responses
      ['oo', 'yes / yeah'],
      ['hindi', 'no / nah'],
      ['sige', 'okay / sure'],
      ['ayos', 'cool / alright'],
      ['grabe', 'wow / amazing'],
      ['sobra', 'so much / very'],
      ['talaga', 'really'],
      ['diba', 'right? / isn\'t it?'],
      ['parang', 'like / seems like'],
      ['yun', 'that'],
      ['ganun', 'like that'],
      ['char', 'just kidding'],
      ['chos', 'joke'],
      ['sana all', 'wish it was me too'],
      
      // Casual transitions
      ['kaya', 'so / that\'s why'],
      ['tapos', 'then / and then'],
      ['pero', 'but'],
      ['kasi', 'because'],
      ['eh', 'well / uhm'],
      ['ano', 'what / uhm'],
      
      // Casual time expressions
      ['ngayon', 'now'],
      ['mamaya', 'later'],
      ['kanina', 'earlier'],
      ['kahapon', 'yesterday'],
      ['bukas', 'tomorrow'],
      
      // Casual agreement
      ['tama', 'correct / right'],
      ['exactly', 'exactly'],
      ['true', 'true'],
      ['same', 'same'],
      ['gets', 'I understand'],
      ['copy', 'understood']
    ]);

    this.professionalTerms = new Map([
      // Professional responses
      ['opo', 'yes (formal)'],
      ['hindi po', 'no (formal)'],
      ['salamat po', 'thank you (formal)'],
      ['pasensya na po', 'sorry (formal)'],
      ['makakakuha po ba', 'can I get (formal)'],
      
      // Professional work terms
      ['pulong', 'meeting'],
      ['ulat', 'report'],
      ['proyekto', 'project'],
      ['deadline', 'deadline'],
      ['presentasyon', 'presentation'],
      ['budget', 'budget'],
      ['proposal', 'proposal'],
      
      // Academic formal
      ['pag-aaral', 'studies'],
      ['pananaliksik', 'research'],
      ['thesis', 'thesis'],
      ['dissertation', 'dissertation'],
      ['curriculum', 'curriculum'],
      ['syllabus', 'syllabus']
    ]);
  }

  /**
   * Initialize cultural context mapping
   */
  private initializeCulturalContext(): void {
    this.culturalContext = new Map([
      ['bayanihan', 'Community spirit of helping each other'],
      ['kapamilya', 'Family member / someone treated as family'],
      ['malasakit', 'Compassionate care and concern'],
      ['pakikipagkapwa', 'Shared identity and interconnectedness'],
      ['utang na loob', 'Debt of gratitude that creates lasting bonds'],
      ['hiya', 'Shame that guides proper behavior'],
      ['amor propio', 'Self-esteem and dignity'],
      ['galang', 'Respect, especially for elders'],
      ['po at opo', 'Respectful particles used with elders'],
      ['mano', 'Traditional greeting of respect to elders'],
      ['fiesta', 'Community celebration, usually religious'],
      ['salu-salo', 'Gathering with food and family'],
      ['pasalubong', 'Gifts brought home from travels'],
      ['kainan', 'Mealtime as family bonding'],
      ['tsinelas', 'Slippers worn indoors'],
      ['jeepney', 'Iconic Filipino public transport'],
      ['barkada', 'Close group of friends'],
      ['tambay', 'Hanging out with friends'],
      ['gimmick', 'Fun outing or party'],
      ['inuman', 'Drinking session with friends']
    ]);
  }

  /**
   * Initialize Taglish patterns
   */
  private initializeTaglishPatterns(): void {
    this.commonTaglishPatterns = [
      // Code-switching patterns
      /\b(naman|talaga|kasi|pero|tapos|sige|ayos|okay lang)\b/gi,
      /\b(diba|parang|yung|yun|ganun|ganito)\b/gi,
      /\b(grabe|sobra|super|very|ang|ng|sa)\b/gi,
      /\b(mag|nag|um|in|an)\w+/gi, // Filipino verb prefixes
      /\b\w+(ng|an|in|han|hin)\b/gi, // Filipino suffixes
      /(po|opo)\s+(pero|but|kasi|because)/gi, // Politeness + English
      /\b(hindi|not)\s+(naman|talaga|kasi)\b/gi,
      /\b(mag|let's)\s+\w+\s+(na|naman|muna)\b/gi
    ];
  }

  /**
   * Detect language and style from user input
   */
  detectLanguage(text: string): LanguageDetectionResult {
    const words = text.toLowerCase().split(/\s+/);
    const filipinoWords: string[] = [];
    const englishWords: string[] = [];
    
    let filipinoCount = 0;
    let englishCount = 0;
    
    // Count Filipino vs English words
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (this.filipinoVocabulary.has(cleanWord)) {
        filipinoWords.push(cleanWord);
        filipinoCount++;
      } else if (cleanWord.match(/^[a-zA-Z]+$/)) {
        englishWords.push(cleanWord);
        englishCount++;
      }
    });
    
    // Detect Taglish patterns
    const taglishPatternCount = this.commonTaglishPatterns.reduce((count, pattern) => {
      const matches = text.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Calculate language confidence
    const totalWords = filipinoCount + englishCount;
    const filipinoRatio = totalWords > 0 ? filipinoCount / totalWords : 0;
    const englishRatio = totalWords > 0 ? englishCount / totalWords : 0;
    
    // Determine primary language
    let primary: 'english' | 'filipino' | 'tagalog' | 'taglish';
    let confidence: number;
    
    if (taglishPatternCount > 0 && filipinoRatio > 0.2 && englishRatio > 0.2) {
      primary = 'taglish';
      confidence = Math.min(0.9, (taglishPatternCount / words.length) + 0.5);
    } else if (filipinoRatio > englishRatio && filipinoRatio > 0.6) {
      primary = filipinoRatio > 0.8 ? 'tagalog' : 'filipino';
      confidence = filipinoRatio;
    } else if (englishRatio > 0.8) {
      primary = 'english';
      confidence = englishRatio;
    } else {
      primary = 'taglish';
      confidence = 0.6;
    }
    
    // Detect style type
    const formalMarkers = ['po', 'opo', 'salamat po', 'pasensya po', 'pwede po ba'];
    const casualMarkers = ['char', 'chos', 'grabe', 'sana all', 'gets', 'yun'];
    const professionalMarkers = ['meeting', 'deadline', 'project', 'proposal', 'report'];
    
    const hasFormal = formalMarkers.some(marker => text.toLowerCase().includes(marker));
    const hasCasual = casualMarkers.some(marker => text.toLowerCase().includes(marker));
    const hasProfessional = professionalMarkers.some(marker => text.toLowerCase().includes(marker));
    
    let styleType: 'formal' | 'casual' | 'professional' | 'academic' | 'conversational';
    let formality: number;
    
    if (hasFormal) {
      styleType = 'formal';
      formality = 0.8;
    } else if (hasProfessional) {
      styleType = 'professional';
      formality = 0.7;
    } else if (hasCasual) {
      styleType = 'casual';
      formality = 0.3;
    } else {
      styleType = 'conversational';
      formality = 0.5;
    }
    
    return {
      primary,
      confidence,
      styleType,
      mixedLanguage: taglishPatternCount > 0 || (filipinoRatio > 0.1 && englishRatio > 0.1),
      filipinoWords,
      englishWords,
      formality,
      regionalVariant: 'general'
    };
  }

  /**
   * Generate Filipino-aware system prompt
   */
  generateFilipinoSystemPrompt(
    basePrompt: string,
    languageDetection: LanguageDetectionResult,
    userPreferences?: FilipinoLinguisticProfile
  ): string {
    const languageInstructions = this.getLanguageInstructions(languageDetection, userPreferences);
    const culturalContext = this.getCulturalContextInstructions();
    const styleGuidelines = this.getStyleGuidelines(languageDetection.styleType, languageDetection.formality);
    
    return `${basePrompt}

## 🇵🇭 FILIPINO LANGUAGE & CULTURAL AWARENESS

${languageInstructions}

${culturalContext}

${styleGuidelines}

## Response Language Guidelines:
- **Detected Input**: ${languageDetection.primary} (${Math.round(languageDetection.confidence * 100)}% confidence)
- **Style Type**: ${languageDetection.styleType}
- **Formality Level**: ${Math.round(languageDetection.formality * 100)}%
- **Mixed Language**: ${languageDetection.mixedLanguage ? 'Yes' : 'No'}

CRITICAL: Match the user's language style and formality level. If they use Taglish, respond in Taglish. If they're formal, be formal. If they're casual, be casual. Always be culturally appropriate and respectful.`;
  }

  /**
   * Get language-specific instructions
   */
  private getLanguageInstructions(
    detection: LanguageDetectionResult,
    preferences?: FilipinoLinguisticProfile
  ): string {
    switch (detection.primary) {
      case 'tagalog':
        return `**TAGALOG MODE ACTIVE**
- Respond primarily in Tagalog
- Use proper Filipino grammar and sentence structure
- Include appropriate Filipino cultural references
- Use respectful language (po/opo when appropriate)
- Maintain natural Filipino conversation flow`;

      case 'taglish':
        return `**TAGLISH MODE ACTIVE**
- Seamlessly mix English and Filipino like a native speaker
- Use natural code-switching patterns
- Include Filipino expressions (naman, talaga, kasi, diba)
- Balance both languages naturally
- Use casual Filipino particles and expressions
- Example: "Grabe talaga, ang ganda ng idea mo! Very nice naman yan."`;

      case 'filipino':
        return `**FILIPINO MODE ACTIVE**
- Respond in Filipino/Tagalog with some English words
- Use natural Filipino expressions and idioms
- Include cultural context when relevant
- Adapt formality based on user's tone
- Use Filipino sentence patterns and structures`;

      default:
        return `**ENGLISH WITH FILIPINO AWARENESS**
- Respond in English but with Filipino cultural sensitivity
- Include Filipino context when relevant
- Use Filipino expressions when natural
- Be aware of Filipino communication patterns
- Respect Filipino values and perspectives`;
    }
  }

  /**
   * Get cultural context instructions
   */
  private getCulturalContextInstructions(): string {
    return `## Filipino Cultural Awareness:
- **Respect for Family**: Family (pamilya) is central to Filipino culture
- **Hospitality**: Filipinos are naturally welcoming and hospitable
- **Respect for Elders**: Use po/opo with older people
- **Bayanihan Spirit**: Community cooperation and mutual help
- **Hiya (Shame)**: Be sensitive to face-saving and embarrassment
- **Utang na Loob**: Recognize gratitude and debt relationships
- **Religious Influence**: Many Filipinos are religious (Catholic mainly)
- **Education Value**: High respect for learning and teachers
- **Food Culture**: Food is central to gatherings and hospitality
- **Regional Diversity**: Respect different regional cultures and languages`;
  }

  /**
   * Get style-specific guidelines
   */
  private getStyleGuidelines(styleType: string, formality: number): string {
    switch (styleType) {
      case 'formal':
        return `## Formal Filipino Style:
- Always use "po" and "opo" 
- Use complete sentences and proper grammar
- Avoid slang and casual expressions
- Show respect through language choices
- Example: "Salamat po sa tanong ninyo. Masaya po akong makatulong."`;

      case 'casual':
        return `## Casual Filipino Style:
- Use relaxed Taglish mixing
- Include casual expressions (grabe, diba, yun)
- Use contractions and informal speech
- Be friendly and approachable
- Example: "Ay grabe, ang cool naman nun! Sige, help kita dyan."`;

      case 'professional':
        return `## Professional Filipino Style:
- Balance respect with efficiency
- Use business-appropriate language
- Include English professional terms
- Maintain courtesy without being overly formal
- Example: "Good point yan! Mag-research tayo ng more details para sa presentation."`;

      default:
        return `## Conversational Filipino Style:
- Match the user's energy and tone
- Use natural Filipino conversation patterns
- Include appropriate expressions and particles
- Be warm and engaging
- Example: "Interesting naman yan! Tell me more about it."`;
    }
  }

  /**
   * Enhance response with Filipino linguistic patterns
   */
  enhanceResponseWithFilipino(
    response: string,
    detection: LanguageDetectionResult,
    config: ResponseGenerationConfig
  ): string {
    if (config.targetLanguage === 'english' && !detection.mixedLanguage) {
      return response;
    }

    let enhanced = response;

    // Add Filipino particles and expressions
    if (detection.primary === 'taglish' || config.targetLanguage === 'taglish') {
      enhanced = this.addTaglishElements(enhanced, detection.formality);
    }

    // Add cultural context if enabled
    if (config.includeFilipinoCulturalContext) {
      enhanced = this.addCulturalReferences(enhanced);
    }

    // Adjust formality
    if (config.adaptToUserStyle) {
      enhanced = this.adjustFormality(enhanced, detection.formality);
    }

    return enhanced;
  }

  /**
   * Add Taglish elements to response
   */
  private addTaglishElements(response: string, formality: number): string {
    let enhanced = response;

    // Add Filipino particles
    if (formality < 0.6) {
      enhanced = enhanced.replace(/\byes\b/gi, 'oo');
      enhanced = enhanced.replace(/\bno\b/gi, 'hindi');
      enhanced = enhanced.replace(/\breally\b/gi, 'talaga');
      enhanced = enhanced.replace(/\bbut\b/gi, 'pero');
      enhanced = enhanced.replace(/\bbecause\b/gi, 'kasi');
      enhanced = enhanced.replace(/\bso\b/gi, 'kaya');
      enhanced = enhanced.replace(/\bthen\b/gi, 'tapos');
      enhanced = enhanced.replace(/\bright\b/gi, 'diba');
    }

    // Add Filipino expressions
    const expressions = [
      'naman', 'talaga', 'kasi', 'diba', 'ganun', 'yun', 'parang'
    ];

    if (Math.random() < 0.3) {
      const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
      enhanced = enhanced.replace(/\!/, ` ${randomExpression}!`);
    }

    return enhanced;
  }

  /**
   * Add cultural references when appropriate
   */
  private addCulturalReferences(response: string): string {
    // This would add relevant cultural context based on the topic
    // For now, just ensure cultural sensitivity
    return response;
  }

  /**
   * Adjust formality level
   */
  private adjustFormality(response: string, targetFormality: number): string {
    let adjusted = response;

    if (targetFormality > 0.7) {
      // Make more formal
      adjusted = adjusted.replace(/\byeah\b/gi, 'yes po');
      adjusted = adjusted.replace(/\bok\b/gi, 'sige po');
      adjusted = adjusted.replace(/\bthanks\b/gi, 'salamat po');
    } else if (targetFormality < 0.4) {
      // Make more casual
      adjusted = adjusted.replace(/\byes\b/gi, 'oo');
      adjusted = adjusted.replace(/\bthank you\b/gi, 'salamat');
      adjusted = adjusted.replace(/\bokay\b/gi, 'sige');
    }

    return adjusted;
  }

  /**
   * Get language statistics for analytics
   */
  getLanguageStats(): any {
    return {
      vocabularySize: this.filipinoVocabulary.size,
      phrasesCount: this.tagalogPhrases.size,
      casualExpressions: this.casualExpressions.size,
      professionalTerms: this.professionalTerms.size,
      culturalTerms: this.culturalContext.size,
      taglishPatterns: this.commonTaglishPatterns.length
    };
  }

  /**
   * Check if text contains Filipino content
   */
  hasFilipino(text: string): boolean {
    const words = text.toLowerCase().split(/\s+/);
    return words.some(word => this.filipinoVocabulary.has(word.replace(/[^\w]/g, '')));
  }

  /**
   * Get Filipino word definitions
   */
  getDefinition(word: string): string | null {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    
    // Check phrases first
    for (const [phrase, definition] of this.tagalogPhrases) {
      if (phrase.includes(cleanWord)) {
        return definition;
      }
    }
    
    // Check expressions
    if (this.casualExpressions.has(cleanWord)) {
      return this.casualExpressions.get(cleanWord) || null;
    }
    
    if (this.professionalTerms.has(cleanWord)) {
      return this.professionalTerms.get(cleanWord) || null;
    }
    
    // Check cultural context
    if (this.culturalContext.has(cleanWord)) {
      return this.culturalContext.get(cleanWord) || null;
    }
    
    return null;
  }

  /**
   * Initialize advanced Tagalog functionality for fluent speaking
   */
  private initializeAdvancedTagalog(): void {
    // Advanced conversational patterns
    this.tagalogPhrases.set('kumusta ka', 'How are you?');
    this.tagalogPhrases.set('salamat ha', 'Thank you very much');
    this.tagalogPhrases.set('ingat ka', 'Take care');
    this.tagalogPhrases.set('pakinggan mo', 'Listen to this');
    this.tagalogPhrases.set('ano ba yan', 'What is that?');
    this.tagalogPhrases.set('talaga ba', 'Really?');
    this.tagalogPhrases.set('hindi nga', 'No way');
    this.tagalogPhrases.set('pwede ba', 'Is it possible?');
    this.tagalogPhrases.set('saan ka na', 'Where are you now?');
    this.tagalogPhrases.set('anong nangyari', 'What happened?');
    
    // Filipino research and academic terms
    this.professionalTerms.set('pananaliksik', 'research');
    this.professionalTerms.set('pagsusuri', 'analysis');
    this.professionalTerms.set('kasaysayan', 'history');
    this.professionalTerms.set('agham', 'science');
    this.professionalTerms.set('teknolohiya', 'technology');
    this.professionalTerms.set('kabanalan', 'literature');
    this.professionalTerms.set('kultura', 'culture');
    this.professionalTerms.set('lipunan', 'society');
    this.professionalTerms.set('ekonomiya', 'economy');
    this.professionalTerms.set('politika', 'politics');
    this.professionalTerms.set('kalikasan', 'nature/environment');
    this.professionalTerms.set('edukasyon', 'education');
    
    // Modern Filipino expressions
    this.casualExpressions.set('grabe naman', 'That\'s too much!');
    this.casualExpressions.set('ang galing', 'Amazing/Great!');
    this.casualExpressions.set('sulit na sulit', 'Very worth it');
    this.casualExpressions.set('perfect na', 'That\'s perfect');
    this.casualExpressions.set('hindi ko alam', 'I don\'t know');
    this.casualExpressions.set('pakiusap', 'Please');
    this.casualExpressions.set('walang problema', 'No problem');
    this.casualExpressions.set('matagal na', 'It\'s been a long time');
    this.casualExpressions.set('salamat naman', 'Thank goodness');
    this.casualExpressions.set('ayan na nga', 'There it is');
    
    // Filipino cultural context for research
    this.culturalContext.set('bayanihan', 'Community spirit of helping one another');
    this.culturalContext.set('kapamilya', 'Family/close relationships');
    this.culturalContext.set('utang na loob', 'Debt of gratitude');
    this.culturalContext.set('pakikipagkapwa', 'Shared identity and interconnectedness');
    this.culturalContext.set('malasakit', 'Deep care and concern for others');
  }

  /**
   * Generate fluent Tagalog responses for research queries
   */
  generateTagalogResearchResponse(englishResponse: string, topic: string): string {
    const tagalogIntros = [
      'Ayon sa aking pananaliksik,',
      'Base sa mga natuklasan ko,',
      'Ang mga datos ay nagpapakita na,',
      'Sa aking pagsusuri,',
      'Ang mga eksperto ay nagsasabi na,',
      'Sa mga pag-aaral,',
      'Ang mga ebidensya ay nagpapatunay na,'
    ];

    const tagalogTransitions = [
      'Dagdag pa dito,',
      'Bukod pa riyan,',
      'Isa pang mahalagang punto,',
      'Kaugnay nito,',
      'Higit pa sa lahat,',
      'Sa katunayan,',
      'Halimbawa,'
    ];

    const tagalogClosings = [
      'Sana nakatulong ito sa inyong pag-unawa.',
      'Iyan ang mga natuklasan ko tungkol sa paksa.',
      'Marami pang pwedeng pag-aralan dito.',
      'Salamat sa pagtatanong tungkol dito.',
      'Napakahalagang paksa ito para sa ating lipunan.',
      'Patuloy nating pag-aralan ang paksang ito.'
    ];

    // Basic translation patterns for key terms
    const termMap = new Map([
      ['research', 'pananaliksik'],
      ['study', 'pag-aaral'],
      ['analysis', 'pagsusuri'],
      ['data', 'datos'],
      ['information', 'impormasyon'],
      ['knowledge', 'kaalaman'],
      ['education', 'edukasyon'],
      ['technology', 'teknolohiya'],
      ['science', 'agham'],
      ['culture', 'kultura'],
      ['society', 'lipunan'],
      ['development', 'pag-unlad'],
      ['important', 'mahalaga'],
      ['significant', 'makabuluhan'],
      ['effective', 'epektibo'],
      ['successful', 'matagumpay']
    ]);

    let tagalogResponse = englishResponse;

    // Apply term translations
    for (const [english, tagalog] of termMap) {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      tagalogResponse = tagalogResponse.replace(regex, tagalog);
    }

    // Add Filipino intro
    const intro = tagalogIntros[Math.floor(Math.random() * tagalogIntros.length)];
    
    // Add transition words
    const sentences = tagalogResponse.split('. ');
    if (sentences.length > 1) {
      const transition = tagalogTransitions[Math.floor(Math.random() * tagalogTransitions.length)];
      sentences[1] = transition + ' ' + sentences[1];
    }

    // Add closing
    const closing = tagalogClosings[Math.floor(Math.random() * tagalogClosings.length)];
    
    return `${intro} ${sentences.join('. ')} ${closing}`;
  }

  /**
   * Enhance voice pronunciation for Tagalog
   */
  optimizeTagalogPronunciation(text: string): string {
    // SSML-like adjustments for better Tagalog pronunciation
    let optimized = text;

    // Fix common Tagalog pronunciation issues
    const pronunciationMap = new Map([
      ['ng', '<phoneme alphabet="ipa" ph="ŋ">ng</phoneme>'],
      ['mga', '<phoneme alphabet="ipa" ph="maŋa">mga</phoneme>'],
      ['kay', '<phoneme alphabet="ipa" ph="kai">kay</phoneme>'],
      ['ako', '<phoneme alphabet="ipa" ph="akoʔ">ako</phoneme>'],
      ['ikaw', '<phoneme alphabet="ipa" ph="ikaʔʊ">ikaw</phoneme>'],
      ['siya', '<phoneme alphabet="ipa" ph="ʃija">siya</phoneme>'],
      ['tayo', '<phoneme alphabet="ipa" ph="tajoʔ">tayo</phoneme>'],
      ['kayo', '<phoneme alphabet="ipa" ph="kajoʔ">kayo</phoneme>'],
      ['sila', '<phoneme alphabet="ipa" ph="ʃila">sila</phoneme>']
    ]);

    // Apply pronunciation optimizations
    for (const [tagalog, ssml] of pronunciationMap) {
      const regex = new RegExp(`\\b${tagalog}\\b`, 'gi');
      optimized = optimized.replace(regex, ssml);
    }

    // Add Filipino intonation markers
    optimized = optimized.replace(/\?/g, '<prosody pitch="+20%">?</prosody>');
    optimized = optimized.replace(/!/g, '<prosody volume="+10%">!</prosody>');

    return optimized;
  }

  /**
   * Generate contextual Taglish for natural conversation
   */
  generateNaturalTaglish(englishText: string, formality: number = 0.5): string {
    const taglishPatterns = [
      { english: 'but', taglish: 'pero', probability: 0.8 },
      { english: 'and', taglish: 'at', probability: 0.6 },
      { english: 'very', taglish: 'sobrang', probability: 0.7 },
      { english: 'really', taglish: 'talaga', probability: 0.9 },
      { english: 'maybe', taglish: 'siguro', probability: 0.8 },
      { english: 'because', taglish: 'kasi', probability: 0.7 },
      { english: 'just', taglish: 'lang', probability: 0.6 },
      { english: 'already', taglish: 'na', probability: 0.5 },
      { english: 'also', taglish: 'din', probability: 0.6 },
      { english: 'now', taglish: 'ngayon', probability: 0.4 },
      { english: 'here', taglish: 'dito', probability: 0.5 },
      { english: 'there', taglish: 'doon', probability: 0.5 }
    ];

    let taglishText = englishText;

    // Apply Taglish patterns based on formality
    taglishPatterns.forEach(pattern => {
      const shouldApply = Math.random() < (pattern.probability * (1 - formality * 0.5));
      if (shouldApply) {
        const regex = new RegExp(`\\b${pattern.english}\\b`, 'gi');
        taglishText = taglishText.replace(regex, pattern.taglish);
      }
    });

    // Add Filipino sentence enders for casual conversation
    if (formality < 0.5) {
      taglishText = taglishText.replace(/\./g, match => {
        const enders = ['.', ' naman.', ' ha.', ' no.', ' eh.'];
        return Math.random() < 0.3 ? enders[Math.floor(Math.random() * enders.length)] : match;
      });
    }

    return taglishText;
  }
}

export const filipinoLanguageService = new FilipinoLanguageService();