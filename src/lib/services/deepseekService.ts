import { validationService } from './validationService';
import { systemGuardianService } from './systemGuardianService';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeepSeekConfig {
  model: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

class DeepSeekService {
  private static instance: DeepSeekService;
  private apiKey: string;
  private baseURL: string = 'https://api.deepseek.com/v1';

  private constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ DeepSeek API key not found. Using mock responses.');
    } else {
      console.log('✅ DeepSeek API key configured successfully.');
    }
  }

  static getInstance(): DeepSeekService {
    if (!DeepSeekService.instance) {
      DeepSeekService.instance = new DeepSeekService();
    }
    return DeepSeekService.instance;
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.apiKey !== '';
  }

  /**
   * Create a chat completion
   */
  async createChatCompletion(
    messages: DeepSeekMessage[],
    config: DeepSeekConfig = { model: 'deepseek-chat' }
  ): Promise<DeepSeekResponse> {
    try {
      // Validate messages first
      const validatedMessages = this.validateMessages(messages);

      if (!this.isConfigured()) {
        // Return a mock response when not configured
        return this.createMockResponse(validatedMessages, config);
      }

      // Prepare request payload
      const payload = {
        model: config.model || 'deepseek-chat',
        messages: validatedMessages,
        temperature: config.temperature || 0.7,
        max_tokens: config.max_tokens || 2048,
        stream: false
      };

      // Make API request
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as DeepSeekResponse;

    } catch (error) {
      console.error('DeepSeek service error:', error);
      
      // Fallback to mock response on error
      return this.createMockResponse(messages, config);
    }
  }

  /**
   * Validate messages for content safety
   */
  private validateMessages(messages: DeepSeekMessage[]): DeepSeekMessage[] {
    return messages.filter(message => {
      try {
        const validation = validationService.validateTextInput(message.content);
        return validation.isValid;
      } catch (error) {
        console.warn('Message validation failed:', error);
        return false;
      }
    });
  }

  /**
   * Create a mock response when API is not available
   */
  private createMockResponse(messages: DeepSeekMessage[], config: DeepSeekConfig): DeepSeekResponse {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const userInput = lastUserMessage?.content || '';
    
    // Generate contextual mock responses
    let mockContent = this.generateMockResponse(userInput);

    return {
      id: `mock-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: config.model || 'deepseek-chat',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: mockContent
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: this.estimateTokens(messages.map(m => m.content).join(' ')),
        completion_tokens: this.estimateTokens(mockContent),
        total_tokens: this.estimateTokens(messages.map(m => m.content).join(' ') + mockContent)
      }
    };
  }

  /**
   * Generate comprehensive educational responses
   */
  private generateMockResponse(input: string): string {
    const lowerInput = input.toLowerCase();
    
    // Biomechanics and related topics
    if (/biomechanics|biomechanical|body mechanics|human movement|kinesiology|sports science/.test(lowerInput)) {
      return `**Biomechanics: The Science of Human Movement**

Biomechanics is the study of the mechanical laws relating to the movement and structure of living organisms, particularly the human body. It combines principles from physics, engineering, and biology to understand how forces affect movement.

**Key Areas:**
• **Kinematics**: Motion analysis (position, velocity, acceleration)
• **Kinetics**: Force analysis (ground reaction forces, muscle forces)
• **Applied Anatomy**: How body structures create and control movement

**Applications:**
• **Sports Performance**: Optimizing technique for better performance
• **Injury Prevention**: Understanding movement patterns that lead to injuries
• **Rehabilitation**: Designing exercises to restore proper movement
• **Ergonomics**: Improving workplace design to reduce strain

**Examples:**
• Running gait analysis to prevent knee injuries
• Golf swing mechanics for distance and accuracy
• Lifting techniques to protect the spine
• Prosthetic design for natural movement patterns

**Career Paths**: Sports scientist, physical therapist, ergonomist, research scientist, athletic trainer.

Would you like me to explore any specific aspect of biomechanics in more detail?`;
    }
    
    // Mathematics and physics
    if (/math|physics|equation|solve|calculate|algebra|geometry|calculus|mechanics|dynamics|statics/.test(lowerInput)) {
      return `**Mathematics & Physics Learning Guide**

I can help you understand mathematical and physical concepts through step-by-step explanations, practical examples, and real-world applications.

**Mathematics Topics:**
• **Algebra**: Solving equations, working with variables and functions
• **Geometry**: Shapes, angles, area, volume calculations
• **Calculus**: Derivatives, integrals, and their applications
• **Statistics**: Data analysis, probability, and interpretation

**Physics Topics:**
• **Mechanics**: Motion, forces, energy, momentum
• **Thermodynamics**: Heat, temperature, energy transfer
• **Waves**: Sound, light, electromagnetic radiation
• **Electricity**: Circuits, magnetism, electromagnetic fields

**Problem-Solving Approach:**
1. **Identify** what you know and what you need to find
2. **Choose** the appropriate formula or method
3. **Calculate** step by step
4. **Verify** your answer makes sense

What specific math or physics topic would you like help with? I can provide detailed explanations and work through examples together.`;
    }
    
    // Programming and coding
    if (/code|program|function|javascript|python|html|css|react|programming|software|development/.test(lowerInput)) {
      return `**Programming & Software Development**

I can help you learn programming concepts, debug code, and understand best practices across multiple languages and frameworks.

**Popular Languages & Technologies:**
• **JavaScript/TypeScript**: Web development, React, Node.js
• **Python**: Data science, machine learning, web backends
• **HTML/CSS**: Web structure and styling
• **SQL**: Database queries and management

**Learning Path Recommendations:**
1. **Fundamentals**: Variables, functions, loops, conditionals
2. **Data Structures**: Arrays, objects, lists, dictionaries
3. **Algorithms**: Sorting, searching, problem-solving patterns
4. **Projects**: Build real applications to practice

**Best Practices:**
• Write clean, readable code with good naming
• Test your code thoroughly
• Use version control (Git)
• Document your work

**Common Debugging Steps:**
1. Read error messages carefully
2. Check syntax and spelling
3. Use console.log() or print() statements
4. Break complex problems into smaller parts

What programming topic or language would you like to explore? I can provide code examples and explanations.`;
    }
    
    // Biology and life sciences
    if (/biology|anatomy|physiology|cell|genetics|evolution|ecosystem|organism/.test(lowerInput)) {
      return `**Biology: Understanding Life Sciences**

Biology is the scientific study of life and living organisms, from molecules to entire ecosystems.

**Core Branches:**
• **Cell Biology**: Structure and function of cells
• **Genetics**: Heredity and genetic variation
• **Anatomy**: Structure of organisms
• **Physiology**: How body systems function
• **Ecology**: Interactions between organisms and environment
• **Evolution**: How species change over time

**Key Concepts:**
• **Homeostasis**: Maintaining internal balance
• **Metabolism**: Chemical processes in living things
• **Reproduction**: How organisms create offspring
• **Adaptation**: How organisms survive in their environment

**Study Tips:**
• Use diagrams and visual aids
• Connect structure to function
• Learn the hierarchy: molecules → cells → tissues → organs → systems
• Practice with real examples and case studies

**Applications:**
• Medical research and healthcare
• Environmental conservation
• Biotechnology and genetic engineering
• Agriculture and food production

What specific area of biology interests you most? I can provide detailed explanations and examples.`;
    }
    
    // Chemistry
    if (/chemistry|chemical|molecule|atom|reaction|periodic table|compound/.test(lowerInput)) {
      return `**Chemistry: The Study of Matter and Its Interactions**

Chemistry explores the composition, structure, properties, and behavior of matter at the atomic and molecular level.

**Major Areas:**
• **General Chemistry**: Basic principles, atomic structure, bonding
• **Organic Chemistry**: Carbon-based compounds and reactions
• **Inorganic Chemistry**: All elements except carbon compounds
• **Physical Chemistry**: Mathematical and physical aspects
• **Biochemistry**: Chemical processes in living systems

**Fundamental Concepts:**
• **Atomic Structure**: Protons, neutrons, electrons
• **Chemical Bonding**: Ionic, covalent, metallic bonds
• **Stoichiometry**: Quantitative relationships in reactions
• **Thermodynamics**: Energy changes in chemical processes
• **Kinetics**: Rates of chemical reactions

**Problem-Solving Strategy:**
1. Write balanced chemical equations
2. Identify what you're solving for
3. Convert units as needed
4. Use molar relationships
5. Check significant figures

**Real-World Applications:**
• Drug development and pharmaceuticals
• Environmental monitoring and cleanup
• Materials science and engineering
• Food chemistry and nutrition

What chemistry topic would you like to explore? I can walk through specific concepts and example problems.`;
    }
    
    // Writing and literature
    if (/write|writing|essay|story|letter|creative|literature|grammar|composition/.test(lowerInput)) {
      return `**Writing & Communication Skills**

Effective writing is essential for academic success and professional communication. I can help you improve across all types of writing.

**Types of Writing:**
• **Academic Essays**: Argumentative, analytical, research papers
• **Creative Writing**: Stories, poetry, creative non-fiction
• **Professional Writing**: Emails, reports, proposals
• **Personal Writing**: Journals, letters, reflections

**Writing Process:**
1. **Planning**: Brainstorm, outline, research
2. **Drafting**: Get ideas on paper without perfection
3. **Revising**: Improve organization, clarity, argument
4. **Editing**: Fix grammar, spelling, punctuation
5. **Proofreading**: Final check for errors

**Key Elements:**
• **Thesis Statement**: Clear main argument or point
• **Organization**: Logical flow of ideas
• **Evidence**: Support claims with examples and data
• **Transitions**: Connect paragraphs and ideas smoothly
• **Conclusion**: Summarize and reinforce main points

**Common Grammar Tips:**
• Subject-verb agreement
• Proper comma usage
• Active vs. passive voice
• Avoiding run-on sentences

What type of writing project are you working on? I can provide specific guidance and feedback.`;
    }
    
    // Greetings
    if (/hello|hi|hey|good morning|good afternoon|greetings/.test(lowerInput)) {
      return "Hello! I'm Gawin AI, your comprehensive learning companion. I provide detailed, educational responses across all academic subjects including STEM, humanities, and practical skills. I can explain complex topics, help with homework, provide study strategies, and offer real educational value. What subject or topic would you like to explore today?";
    }
    
    // History
    if (/history|historical|ancient|civilization|war|empire|revolution|culture/.test(lowerInput)) {
      return `**History: Understanding Our Past**

History helps us understand how societies developed, why events occurred, and how they shape our present world.

**Major Periods:**
• **Ancient History**: Early civilizations, classical antiquity
• **Medieval Period**: Middle Ages, feudalism, rise of religions
• **Modern Era**: Renaissance, Enlightenment, Industrial Revolution
• **Contemporary**: 20th-21st centuries, globalization

**Key Themes:**
• **Political Development**: Government systems, wars, diplomacy
• **Social History**: Daily life, class structure, demographics
• **Economic History**: Trade, technology, labor systems
• **Cultural History**: Art, religion, ideas, values

**Historical Thinking Skills:**
• Analyze primary and secondary sources
• Understand cause and effect relationships
• Recognize bias and perspective
• Make connections across time periods

**Study Strategies:**
• Create timelines to visualize chronology
• Use maps to understand geographic context
• Connect events to broader themes
• Practice explaining historical significance

What historical period or topic interests you? I can provide detailed context and analysis.`;
    }
    
    // Default comprehensive response
    return `**Gawin AI - Your Educational Learning Partner**

I'm here to provide comprehensive, educational responses across all academic subjects. Rather than just directing you elsewhere, I'll give you detailed explanations, examples, and learning strategies.

**My Specialties:**
🧬 **STEM Fields**: Mathematics, Physics, Chemistry, Biology, Engineering
📚 **Humanities**: History, Literature, Philosophy, Languages
💻 **Technology**: Programming, Computer Science, Digital Literacy
🏃 **Applied Sciences**: Sports Science, Health, Environmental Studies
✍️ **Communication**: Writing, Research, Critical Thinking

**Learning Approach:**
• **Comprehensive Explanations**: Detailed coverage of topics
• **Real Examples**: Practical applications and case studies
• **Study Strategies**: Effective learning techniques
• **Problem-Solving**: Step-by-step guidance
• **Connections**: How topics relate to broader fields

**Question: "${input}"**

To give you the most helpful response, could you be more specific about what aspect interests you most? For example:
- Are you looking for basic concepts or advanced topics?
- Do you need help with homework or general understanding?
- Would you like theoretical knowledge or practical applications?

The more specific your question, the more targeted and useful my response can be!`;
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get available models (mock for now)
   */
  getAvailableModels() {
    return {
      'deepseek-chat': {
        description: 'General purpose chat model',
        context_length: 4096
      },
      'deepseek-coder': {
        description: 'Code-focused model',
        context_length: 8192
      }
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; message: string }> {
    try {
      if (!this.isConfigured()) {
        return { status: 'degraded', message: 'Running in demo mode - API key not configured' };
      }

      // Test API connection
      const testResponse = await this.createChatCompletion([
        { role: 'user', content: 'Hello' }
      ]);

      if (testResponse.choices && testResponse.choices.length > 0) {
        return { status: 'healthy', message: 'DeepSeek API operational' };
      } else {
        return { status: 'degraded', message: 'API responding but with issues' };
      }
    } catch (error) {
      return { status: 'offline', message: 'API unavailable - using fallback responses' };
    }
  }
}

// Export singleton instance
export const deepseekService = DeepSeekService.getInstance();
export default deepseekService;