import Groq from 'groq-sdk';

export interface OCRResult {
  extractedText: string;
  confidence: number;
  timestamp: Date;
  modelUsed: string;
  processingTime: number;
}

class OCRService {
  private groq: Groq;
  private readonly GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  constructor() {
    this.groq = new Groq({
      apiKey: this.GROQ_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  /**
   * Extract text from image using Mistral's vision model with OCR capabilities
   */
  async extractTextFromImage(imageUrl: string, prompt?: string): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Starting OCR processing with Mistral...');
      
      // Use Mistral's vision model for OCR through Groq
      const ocrPrompt = prompt || 
        "Please extract all text from this image. Return only the extracted text content, maintaining the original formatting and structure as much as possible. If there's no text in the image, respond with 'No text detected'.";

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: ocrPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        model: "llama-3.2-90b-vision-preview", // Using Llama vision as Mistral vision may not be available
        temperature: 0.1, // Low temperature for accuracy
        max_tokens: 2048,
      });

      const extractedText = completion.choices[0]?.message?.content || 'No text could be extracted';
      const processingTime = Date.now() - startTime;

      console.log('✅ OCR processing completed');
      console.log('📄 Extracted text length:', extractedText.length);

      return {
        extractedText,
        confidence: 0.85, // Estimated confidence
        timestamp: new Date(),
        modelUsed: 'Llama 3.2 90B Vision (OCR)',
        processingTime
      };

    } catch (error) {
      console.error('❌ OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error}`);
    }
  }

  /**
   * Process image from file upload for OCR
   */
  async processImageFile(file: File, prompt?: string): Promise<OCRResult> {
    try {
      // Convert file to base64 data URL
      const imageUrl = await this.fileToDataUrl(file);
      return await this.extractTextFromImage(imageUrl, prompt);
    } catch (error) {
      console.error('❌ Image file processing failed:', error);
      throw new Error(`Image file processing failed: ${error}`);
    }
  }

  /**
   * Convert file to data URL for processing
   */
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Enhanced OCR with document structure analysis
   */
  async extractStructuredText(imageUrl: string): Promise<OCRResult> {
    const structuredPrompt = `
      Please extract all text from this image and organize it in a structured format.
      
      Instructions:
      1. Maintain the original layout and hierarchy
      2. Identify headers, paragraphs, lists, tables, etc.
      3. Preserve formatting like bold, italic if apparent
      4. For tables, use proper markdown table format
      5. For lists, use proper bullet points or numbering
      6. Separate different sections clearly
      
      Return the text in a well-organized, readable format.
    `;

    return await this.extractTextFromImage(imageUrl, structuredPrompt);
  }

  /**
   * OCR with translation capability
   */
  async extractAndTranslate(imageUrl: string, targetLanguage: string = 'English'): Promise<OCRResult> {
    const translationPrompt = `
      Please extract all text from this image and translate it to ${targetLanguage}.
      
      Format your response as:
      
      **Original Text:**
      [extracted text in original language]
      
      **Translation (${targetLanguage}):**
      [translated text]
      
      If the text is already in ${targetLanguage}, just provide the extracted text.
    `;

    return await this.extractTextFromImage(imageUrl, translationPrompt);
  }

  /**
   * Check if OCR service is configured
   */
  isConfigured(): boolean {
    return !!this.GROQ_API_KEY;
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<{ status: 'ready' | 'error'; message: string }> {
    try {
      if (!this.isConfigured()) {
        return { status: 'error', message: 'Groq API key not configured for OCR' };
      }

      // Test API connection with a simple request
      await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'llama-3.2-90b-vision-preview',
        max_tokens: 10
      });

      return { status: 'ready', message: 'OCR service ready' };
    } catch (error) {
      return { status: 'error', message: `OCR service error: ${error}` };
    }
  }
}

export const ocrService = new OCRService();