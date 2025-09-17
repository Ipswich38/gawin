/**
 * Enhanced Filipino NLP Service for Gawin
 * Provides advanced natural language processing for Filipino language patterns,
 * idioms, colloquialisms, and cultural references
 */

export interface FilipinoLanguageAnalysis {
  language: 'filipino' | 'english' | 'mixed' | 'regional_dialect';
  dialect?: string;
  formality_level: 'casual' | 'formal' | 'respectful' | 'intimate';
  cultural_markers: string[];
  idioms_detected: Array<{
    phrase: string;
    meaning: string;
    cultural_context: string;
  }>;
  emotional_indicators: Array<{
    word: string;
    emotion: string;
    intensity: number;
  }>;
  code_switching: boolean;
  regional_influences: string[];
}

export interface FilipinoResponseAdaptation {
  suggested_tone: 'malasakit' | 'pakikipagkunware' | 'kapamilya' | 'galang' | 'casual';
  appropriate_honorifics: string[];
  cultural_references: string[];
  suggested_expressions: string[];
  formality_adjustments: string[];
}

export interface FilipinoIdiom {
  filipino: string;
  english_translation: string;
  literal_meaning: string;
  cultural_meaning: string;
  usage_context: 'formal' | 'casual' | 'family' | 'professional';
  regional_variant?: string;
  example_usage: string;
}

export interface RegionalDialectInfo {
  name: string;
  regions: string[];
  key_phrases: Array<{
    phrase: string;
    meaning: string;
    pronunciation_guide?: string;
  }>;
  cultural_significance: string;
  mutual_intelligibility: number; // 0-1 scale with Filipino
}

class FilipinoNLPService {
  private static instance: FilipinoNLPService;

  // Comprehensive Filipino idioms and expressions
  private filipinoIdioms: FilipinoIdiom[] = [
    {
      filipino: "Ang hindi marunong lumingon sa pinanggalingan ay hindi makararating sa paroroonan",
      english_translation: "He who does not look back to where he came from will not reach his destination",
      literal_meaning: "Looking back to origins ensures reaching the destination",
      cultural_meaning: "Remember and honor your roots, family, and heritage",
      usage_context: "formal",
      example_usage: "When advising someone about staying connected to family values"
    },
    {
      filipino: "Kapag may tiyaga, may nilaga",
      english_translation: "If there's patience, there's stew",
      literal_meaning: "Patience leads to a cooked meal",
      cultural_meaning: "Persistence and patience lead to success",
      usage_context: "casual",
      example_usage: "Encouraging someone who's struggling with a long-term goal"
    },
    {
      filipino: "Nasa Diyos ang awa, nasa tao ang gawa",
      english_translation: "God provides mercy, humans provide the work",
      literal_meaning: "Divine mercy combined with human effort",
      cultural_meaning: "Faith must be accompanied by action and effort",
      usage_context: "formal",
      example_usage: "Motivating someone to take action while maintaining faith"
    },
    {
      filipino: "Walang matimtimang birhen sa matapat na manalangin",
      english_translation: "No modest virgin can resist sincere prayer",
      literal_meaning: "Persistence in courtship can win hearts",
      cultural_meaning: "Sincere effort and persistence can overcome obstacles",
      usage_context: "casual",
      example_usage: "Encouraging someone not to give up on their goals"
    },
    {
      filipino: "Kung ano ang puno, siya ang bunga",
      english_translation: "As the tree, so is the fruit",
      literal_meaning: "Trees produce fruit of their kind",
      cultural_meaning: "Children reflect their parents' values and character",
      usage_context: "family",
      example_usage: "Discussing family influence on children's behavior"
    }
  ];

  // Regional dialects information
  private regionalDialects: RegionalDialectInfo[] = [
    {
      name: "Cebuano/Bisaya",
      regions: ["Region VII", "Region VIII", "Region X", "Region XI"],
      key_phrases: [
        { phrase: "Kumusta ka?", meaning: "How are you?", pronunciation_guide: "ku-MUS-ta ka" },
        { phrase: "Salamat", meaning: "Thank you", pronunciation_guide: "sa-la-MAT" },
        { phrase: "Asa ka?", meaning: "Where are you?", pronunciation_guide: "a-SA ka" },
        { phrase: "Unsa ni?", meaning: "What is this?", pronunciation_guide: "UN-sa ni" }
      ],
      cultural_significance: "Most widely spoken Visayan language, known for warmth and hospitality",
      mutual_intelligibility: 0.3
    },
    {
      name: "Ilocano",
      regions: ["Region I", "CAR"],
      key_phrases: [
        { phrase: "Kumusta ka?", meaning: "How are you?", pronunciation_guide: "ku-MUS-ta ka" },
        { phrase: "Agyaman", meaning: "Thank you", pronunciation_guide: "ag-ya-MAN" },
        { phrase: "Sadino ka mapan?", meaning: "Where are you going?", pronunciation_guide: "sa-DI-no ka ma-PAN" }
      ],
      cultural_significance: "Known for frugality, hard work, and close family ties",
      mutual_intelligibility: 0.2
    },
    {
      name: "Hiligaynon",
      regions: ["Region VI"],
      key_phrases: [
        { phrase: "Kumusta ka?", meaning: "How are you?", pronunciation_guide: "ku-MUS-ta ka" },
        { phrase: "Salamat", meaning: "Thank you", pronunciation_guide: "sa-la-MAT" },
        { phrase: "Diin ka?", meaning: "Where are you?", pronunciation_guide: "di-IN ka" }
      ],
      cultural_significance: "Sweet-sounding language, known for gentle and refined speech",
      mutual_intelligibility: 0.4
    }
  ];

  // Filipino honorifics and respectful terms
  private filipinoHonorifics = {
    elder_respect: ["po", "opo", "kuya", "ate", "tito", "tita", "lolo", "lola", "ninong", "ninang"],
    professional: ["Sir", "Ma'am", "Boss", "Chief", "Manager", "Doctor", "Engineer", "Teacher"],
    family: ["mama", "papa", "nanay", "tatay", "inay", "itay", "ma", "pa"],
    religious: ["Padre", "Sister", "Brother", "Pastor", "Minister"],
    traditional: ["Ginoo", "Binibini", "Ginang", "Kapitan", "Datu", "Rajah"]
  };

  // Filipino emotional expressions
  private filipinoEmotionalExpressions = {
    excitement: ["Grabe!", "Sobrang saya!", "Ang galing!", "Kilig na kilig ako!", "Sana all!"],
    disappointment: ["Sayang naman", "Hay nako", "Nakakapanghinayang", "Sobrang lungkot"],
    surprise: ["Ay naku!", "Wow ha!", "Hindi ko akalain!", "Seryoso?!", "Totoo ba yan?"],
    agreement: ["Oo nga eh", "Tama ka diyan", "Exactly!", "Korek!", "Totoo yan"],
    empathy: ["Nakakaawa naman", "Kawawa ka naman", "Nakakabahala yan", "Grabe yung pinagdadaanan mo"],
    appreciation: ["Salamat ha", "Ang bait mo naman", "Appreciate ko yan", "Thank you so much"]
  };

  // Modern Filipino slang and trending expressions
  private modernFilipinoSlang = {
    2020s: [
      { term: "bet", meaning: "yes/okay/I like it", usage: "casual agreement or approval" },
      { term: "sana all", meaning: "I wish that for everyone/I'm envious", usage: "expressing envy in a light way" },
      { term: "charot", meaning: "just kidding", usage: "indicating a joke or sarcasm" },
      { term: "periodt", meaning: "period/end of discussion", usage: "emphasizing a point" },
      { term: "ghost mode", meaning: "being unavailable/offline", usage: "describing antisocial behavior" },
      { term: "flex", meaning: "to show off", usage: "displaying achievements or possessions" },
      { term: "lowkey", meaning: "somewhat/secretly", usage: "expressing mild feelings or hidden preferences" },
      { term: "cap/no cap", meaning: "lie/no lie", usage: "indicating truth or falsehood" }
    ],
    social_media: [
      { term: "GGSS", meaning: "Ganda/Gwapo Sa Socmed", usage: "looks good only in social media" },
      { term: "FOMO", meaning: "Fear of Missing Out", usage: "anxiety about missing experiences" },
      { term: "ship", meaning: "relationship/support a couple", usage: "supporting romantic pairings" }
    ]
  };

  // Code-switching patterns (Filipino-English mixing)
  private codeSwitchingPatterns = [
    {
      pattern: /\b(kasi|pero|tapos|sabi)\s+\w+/gi,
      type: "filipino_connector_english_content",
      example: "Kasi I was thinking..., Pero actually..., Tapos suddenly..."
    },
    {
      pattern: /\b(very|super|sobrang)\s+([\w\s]+)/gi,
      type: "intensifier_mixing",
      example: "very ganda, super tired, sobrang excited"
    },
    {
      pattern: /\b(na|nga|naman|pa)\s*$/gi,
      type: "filipino_particle_addition",
      example: "beautiful naman, tired na, excited pa"
    }
  ];

  static getInstance(): FilipinoNLPService {
    if (!FilipinoNLPService.instance) {
      FilipinoNLPService.instance = new FilipinoNLPService();
    }
    return FilipinoNLPService.instance;
  }

  /**
   * Analyze Filipino language patterns in text
   */
  analyzeFilipinoLanguage(text: string): FilipinoLanguageAnalysis {
    const language = this.detectLanguage(text);
    const dialect = this.detectDialect(text);
    const formality = this.analyzeFormalityLevel(text);
    const culturalMarkers = this.extractCulturalMarkers(text);
    const idioms = this.detectIdioms(text);
    const emotions = this.extractEmotionalIndicators(text);
    const codeSwitching = this.detectCodeSwitching(text);
    const regionalInfluences = this.detectRegionalInfluences(text);

    return {
      language,
      dialect,
      formality_level: formality,
      cultural_markers: culturalMarkers,
      idioms_detected: idioms,
      emotional_indicators: emotions,
      code_switching: codeSwitching,
      regional_influences: regionalInfluences
    };
  }

  /**
   * Generate culturally appropriate response adaptations
   */
  generateResponseAdaptation(analysis: FilipinoLanguageAnalysis, context: 'casual' | 'formal' | 'family' | 'professional' = 'casual'): FilipinoResponseAdaptation {
    const tone = this.suggestCulturalTone(analysis, context);
    const honorifics = this.suggestHonorifics(analysis, context);
    const culturalRefs = this.suggestCulturalReferences(analysis);
    const expressions = this.suggestExpressions(analysis, context);
    const formalityAdjustments = this.suggestFormalityAdjustments(analysis, context);

    return {
      suggested_tone: tone,
      appropriate_honorifics: honorifics,
      cultural_references: culturalRefs,
      suggested_expressions: expressions,
      formality_adjustments: formalityAdjustments
    };
  }

  /**
   * Translate Filipino idioms and explain cultural context
   */
  explainFilipinoExpression(expression: string): { explanation: string; cultural_context: string; usage_tips: string[] } | null {
    const idiom = this.filipinoIdioms.find(i => 
      expression.toLowerCase().includes(i.filipino.toLowerCase()) ||
      i.filipino.toLowerCase().includes(expression.toLowerCase())
    );

    if (idiom) {
      return {
        explanation: `"${idiom.filipino}" means "${idiom.english_translation}". ${idiom.cultural_meaning}`,
        cultural_context: idiom.cultural_meaning,
        usage_tips: [
          `Best used in ${idiom.usage_context} settings`,
          `Example: ${idiom.example_usage}`,
          `This expression reflects Filipino values of ${this.getReflectedValues(idiom)}`
        ]
      };
    }

    return null;
  }

  /**
   * Get regional dialect information
   */
  getDialectInfo(dialectName: string): RegionalDialectInfo | null {
    return this.regionalDialects.find(d => 
      d.name.toLowerCase().includes(dialectName.toLowerCase())
    ) || null;
  }

  /**
   * Suggest appropriate Filipino greetings based on context
   */
  suggestGreetings(timeOfDay: 'morning' | 'afternoon' | 'evening', formality: 'casual' | 'formal', relationship: 'stranger' | 'friend' | 'family' | 'elder'): string[] {
    const greetings: string[] = [];

    // Time-based greetings
    const timeGreetings = {
      morning: formality === 'formal' ? 'Magandang umaga po' : 'Good morning',
      afternoon: formality === 'formal' ? 'Magandang hapon po' : 'Good afternoon', 
      evening: formality === 'formal' ? 'Magandang gabi po' : 'Good evening'
    };

    greetings.push(timeGreetings[timeOfDay]);

    // Relationship-based additions
    if (relationship === 'elder') {
      greetings.push('Kumusta po kayo?', 'Mabuti naman po kayo?');
    } else if (relationship === 'family') {
      greetings.push('Kumusta ka?', 'Okay ka lang?', 'Musta na?');
    } else if (relationship === 'friend') {
      greetings.push('Kumusta na?', 'Hey, musta?', 'Kamusta bro/sis?');
    }

    return greetings;
  }

  /**
   * Generate culturally sensitive responses for emotional states
   */
  generateEmpathyResponse(emotion: string, culturalContext: 'filipino' | 'neutral' = 'filipino'): string[] {
    const responses: string[] = [];

    if (culturalContext === 'filipino') {
      switch (emotion.toLowerCase()) {
        case 'sad':
        case 'nalulungkot':
          responses.push(
            "Naiintindihan ko ang nararamdaman mo. Hindi ka nag-iisa sa pagdadanas na ito.",
            "Kawawa ka naman. Alam mo, everything happens for a reason din.",
            "Hay, ang hirap pala ng pinagdadaanan mo. I'm here for you ha."
          );
          break;
          
        case 'stressed':
        case 'pagod':
          responses.push(
            "Grabe naman ang workload mo. Pahinga ka muna, important ang health.",
            "Sobrang stressed mo na ah. Kailangan mo ng break, seriously.",
            "Nakakagutom yang stress na yan. Rest muna tayo."
          );
          break;
          
        case 'homesick':
          responses.push(
            "Ay, namimiss mo na ang family mo no? Ang hirap talaga kapag malayo sa mga mahal sa buhay.",
            "Normal lang na ma-homesick, especially when you're far from loved ones.",
            "Video call mo sila minsan, mas magiging okay ang feeling mo."
          );
          break;
          
        case 'excited':
        case 'masaya':
          responses.push(
            "Ang saya mo naman! Nakaka-good vibes yung energy mo!",
            "Grabe ang excitement! Share naman the good news!",
            "Kilig much? Haha, nakaka-happy naman yang ganyang energy!"
          );
          break;
      }
    }

    return responses;
  }

  // Private helper methods
  private detectLanguage(text: string): 'filipino' | 'english' | 'mixed' | 'regional_dialect' {
    const filipinoWords = /\b(ang|ng|sa|na|ay|mga|ako|ka|siya|kami|kayo|sila|po|opo|hindi|oo|kung|kapag)\b/gi;
    const englishWords = /\b(the|and|or|but|with|for|from|they|this|that|what|when|where|how)\b/gi;

    const filipinoMatches = (text.match(filipinoWords) || []).length;
    const englishMatches = (text.match(englishWords) || []).length;
    const totalWords = text.split(/\s+/).length;

    const filipinoRatio = filipinoMatches / totalWords;
    const englishRatio = englishMatches / totalWords;

    if (filipinoRatio > 0.3 && englishRatio > 0.2) return 'mixed';
    if (filipinoRatio > englishRatio) return 'filipino';
    if (englishRatio > filipinoRatio) return 'english';
    
    // Check for regional dialect markers
    const cebuanoMarkers = /\b(unsa|asa|kinsa|nganong|bitaw|lagi)\b/gi;
    if (cebuanoMarkers.test(text)) return 'regional_dialect';

    return 'mixed';
  }

  private detectDialect(text: string): string | undefined {
    for (const dialect of this.regionalDialects) {
      const dialectPhrases = dialect.key_phrases.map(p => p.phrase.toLowerCase());
      const textLower = text.toLowerCase();
      
      if (dialectPhrases.some(phrase => textLower.includes(phrase))) {
        return dialect.name;
      }
    }
    return undefined;
  }

  private analyzeFormalityLevel(text: string): 'casual' | 'formal' | 'respectful' | 'intimate' {
    const formalMarkers = /\b(po|opo|kayo|ninyo|kayo|Sir|Ma'am|salamat po|magandang)\b/gi;
    const casualMarkers = /\b(tara|dude|bro|sis|musta|lol|haha|grabe|sobra)\b/gi;
    const intimateMarkers = /\b(mahal|love|hun|baby|darling|dear)\b/gi;

    const formalCount = (text.match(formalMarkers) || []).length;
    const casualCount = (text.match(casualMarkers) || []).length;
    const intimateCount = (text.match(intimateMarkers) || []).length;

    if (intimateCount > 0) return 'intimate';
    if (formalCount > casualCount) return formalCount > 2 ? 'formal' : 'respectful';
    return 'casual';
  }

  private extractCulturalMarkers(text: string): string[] {
    const markers: string[] = [];
    
    // Family markers
    if (/\b(pamilya|family|magulang|anak|kapatid|kamag-anak)\b/gi.test(text)) {
      markers.push('family_oriented');
    }
    
    // Religious markers
    if (/\b(Diyos|Lord|Jesus|church|simbahan|pray|dasal)\b/gi.test(text)) {
      markers.push('religious_reference');
    }
    
    // Community markers
    if (/\b(bayanihan|community|kapitbahay|neighbor|tulong|help)\b/gi.test(text)) {
      markers.push('community_oriented');
    }

    // Respect markers
    if (/\b(po|opo|respect|galang|pakikipagkunware)\b/gi.test(text)) {
      markers.push('respectful_communication');
    }

    return markers;
  }

  private detectIdioms(text: string): Array<{ phrase: string; meaning: string; cultural_context: string }> {
    const detected: Array<{ phrase: string; meaning: string; cultural_context: string }> = [];
    
    for (const idiom of this.filipinoIdioms) {
      if (text.toLowerCase().includes(idiom.filipino.toLowerCase())) {
        detected.push({
          phrase: idiom.filipino,
          meaning: idiom.english_translation,
          cultural_context: idiom.cultural_meaning
        });
      }
    }

    return detected;
  }

  private extractEmotionalIndicators(text: string): Array<{ word: string; emotion: string; intensity: number }> {
    const indicators: Array<{ word: string; emotion: string; intensity: number }> = [];

    // Check emotional expressions
    Object.entries(this.filipinoEmotionalExpressions).forEach(([emotion, expressions]) => {
      expressions.forEach(expr => {
        if (text.toLowerCase().includes(expr.toLowerCase())) {
          indicators.push({
            word: expr,
            emotion,
            intensity: this.calculateEmotionalIntensity(expr)
          });
        }
      });
    });

    return indicators;
  }

  private detectCodeSwitching(text: string): boolean {
    return this.codeSwitchingPatterns.some(pattern => pattern.pattern.test(text));
  }

  private detectRegionalInfluences(text: string): string[] {
    const influences: string[] = [];
    
    for (const dialect of this.regionalDialects) {
      if (dialect.key_phrases.some(phrase => 
        text.toLowerCase().includes(phrase.phrase.toLowerCase())
      )) {
        influences.push(dialect.name);
      }
    }

    return influences;
  }

  private suggestCulturalTone(analysis: FilipinoLanguageAnalysis, context: string): 'malasakit' | 'pakikipagkunware' | 'kapamilya' | 'galang' | 'casual' {
    if (analysis.formality_level === 'formal') return 'galang';
    if (analysis.cultural_markers.includes('family_oriented')) return 'kapamilya';
    if (analysis.emotional_indicators.some(e => ['sad', 'worried'].includes(e.emotion))) return 'malasakit';
    if (context === 'professional') return 'pakikipagkunware';
    return 'casual';
  }

  private suggestHonorifics(analysis: FilipinoLanguageAnalysis, context: string): string[] {
    const honorifics: string[] = [];

    if (analysis.formality_level === 'formal' || analysis.formality_level === 'respectful') {
      honorifics.push(...this.filipinoHonorifics.elder_respect);
    }

    if (context === 'professional') {
      honorifics.push(...this.filipinoHonorifics.professional);
    }

    if (analysis.cultural_markers.includes('family_oriented')) {
      honorifics.push(...this.filipinoHonorifics.family);
    }

    return [...new Set(honorifics)];
  }

  private suggestCulturalReferences(analysis: FilipinoLanguageAnalysis): string[] {
    const references: string[] = [];

    if (analysis.cultural_markers.includes('family_oriented')) {
      references.push('family bonds', 'kapamilya spirit', 'family first');
    }

    if (analysis.cultural_markers.includes('community_oriented')) {
      references.push('bayanihan spirit', 'helping neighbors', 'community unity');
    }

    if (analysis.cultural_markers.includes('religious_reference')) {
      references.push('faith and hope', 'God\'s blessings', 'spiritual guidance');
    }

    return references;
  }

  private suggestExpressions(analysis: FilipinoLanguageAnalysis, context: string): string[] {
    const expressions: string[] = [];

    if (analysis.language === 'filipino' || analysis.language === 'mixed') {
      if (context === 'casual') {
        expressions.push(...this.modernFilipinoSlang['2020s'].map(s => s.term));
      }
    }

    // Add emotional expressions based on detected emotions
    analysis.emotional_indicators.forEach(indicator => {
      const relatedExpressions = this.filipinoEmotionalExpressions[indicator.emotion as keyof typeof this.filipinoEmotionalExpressions];
      if (relatedExpressions) {
        expressions.push(...relatedExpressions.slice(0, 2));
      }
    });

    return [...new Set(expressions)];
  }

  private suggestFormalityAdjustments(analysis: FilipinoLanguageAnalysis, context: string): string[] {
    const adjustments: string[] = [];

    if (analysis.formality_level === 'casual' && context === 'formal') {
      adjustments.push('Add "po" and "opo" for respect', 'Use complete sentences', 'Avoid slang terms');
    }

    if (analysis.formality_level === 'formal' && context === 'casual') {
      adjustments.push('Can use contractions', 'More relaxed language okay', 'Some slang acceptable');
    }

    return adjustments;
  }

  private calculateEmotionalIntensity(expression: string): number {
    // Simple intensity calculation based on expression characteristics
    if (expression.includes('sobra') || expression.includes('grabe')) return 0.9;
    if (expression.includes('!')) return 0.8;
    if (expression.includes('naman') || expression.includes('talaga')) return 0.7;
    return 0.6;
  }

  private getReflectedValues(idiom: FilipinoIdiom): string {
    // Analyze idiom to determine reflected Filipino values
    if (idiom.cultural_meaning.includes('family') || idiom.cultural_meaning.includes('roots')) {
      return 'family importance and ancestral respect';
    }
    if (idiom.cultural_meaning.includes('persistence') || idiom.cultural_meaning.includes('effort')) {
      return 'perseverance and hard work';
    }
    if (idiom.cultural_meaning.includes('faith')) {
      return 'spirituality and divine guidance';
    }
    return 'traditional Filipino wisdom';
  }
}

export const filipinoNLPService = FilipinoNLPService.getInstance();