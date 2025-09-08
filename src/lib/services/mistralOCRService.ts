export interface MistralOCRRequest {
  model: string;
  document?: {
    type: 'document_url' | 'document_base64';
    document_url?: string;
    document_base64?: string;
  };
  messages?: Array<{
    role: 'user' | 'assistant';
    content: string | Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: {
        url: string;
      };
    }>;
  }>;
  include_image_base64?: boolean;
  max_tokens?: number;
  temperature?: number;
}

export interface MistralOCRResponse {
  success: boolean;
  data?: {
    response: string;
    model_used: string;
    task_type: string;
    processing_time?: number;
    extracted_text?: string;
  };
  error?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

class MistralOCRService {
  private static instance: MistralOCRService;
  private apiKey: string;
  private baseURL: string = 'https://api.mistral.ai/v1';

  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ Mistral API key not found. OCR/Vision processing will not work.');
    } else {
      console.log('✅ Mistral API key configured successfully.');
    }
  }

  static getInstance(): MistralOCRService {
    if (!MistralOCRService.instance) {
      MistralOCRService.instance = new MistralOCRService();
    }
    return MistralOCRService.instance;
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.apiKey !== '';
  }

  /**
   * Validate document size before processing
   */
  private validateDocumentSize(documentData: string, documentType: 'pdf' | 'image'): { isValid: boolean; error?: string } {
    // Calculate approximate file size from base64 data
    const base64Data = documentData.split(',')[1] || documentData;
    const sizeInBytes = (base64Data.length * 3) / 4;
    
    // Set different limits based on document type
    const maxSize = documentType === 'pdf' ? 20 * 1024 * 1024 : 5 * 1024 * 1024; // 20MB for PDF, 5MB for images
    
    if (sizeInBytes > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return {
        isValid: false,
        error: `Document too large. Maximum size for ${documentType.toUpperCase()} is ${maxSizeMB}MB. Current size: ${(sizeInBytes / (1024 * 1024)).toFixed(1)}MB`
      };
    }
    
    return { isValid: true };
  }

  /**
   * Process OCR requests using Mistral's OCR API
   */
  async processOCR(request: MistralOCRRequest): Promise<MistralOCRResponse> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Mistral API key not configured'
        };
      }

      const startTime = Date.now();

      // Use OCR endpoint for documents
      if (request.document) {
        // Validate document size before processing
        const documentData = request.document.document_base64 || '';
        if (documentData) {
          const validation = this.validateDocumentSize(documentData, 'pdf'); // Assume PDF for OCR endpoint
          if (!validation.isValid) {
            return {
              success: false,
              error: validation.error
            };
          }
        }

        const response = await fetch(`${this.baseURL}/ocr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: 'mistral-ocr-latest',
            document: request.document,
            include_image_base64: request.include_image_base64 || false
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Mistral OCR API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const processingTime = Date.now() - startTime;

        return {
          success: true,
          data: {
            response: data.content || data.text || 'OCR processing completed',
            model_used: 'mistral-ocr-latest',
            task_type: 'ocr',
            processing_time: processingTime,
            extracted_text: data.content || data.text
          },
          usage: data.usage
        };
      }

      // Use chat/vision endpoint for images
      if (request.messages) {
        // Validate image sizes in messages
        for (const message of request.messages) {
          if (Array.isArray(message.content)) {
            for (const item of message.content) {
              if (item.type === 'image_url' && item.image_url?.url) {
                const imageUrl = item.image_url.url;
                if (imageUrl.startsWith('data:image/')) {
                  const validation = this.validateDocumentSize(imageUrl, 'image');
                  if (!validation.isValid) {
                    return {
                      success: false,
                      error: validation.error
                    };
                  }
                }
              }
            }
          }
        }

        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: 'pixtral-large-2411', // Mistral's latest vision model
            messages: request.messages,
            max_tokens: request.max_tokens || 4096,
            temperature: request.temperature || 0.3
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Mistral Vision API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const processingTime = Date.now() - startTime;

        const responseText = data.choices?.[0]?.message?.content || 'Vision processing completed';

        return {
          success: true,
          data: {
            response: responseText,
            model_used: 'pixtral-large-2411',
            task_type: 'vision',
            processing_time: processingTime,
            extracted_text: responseText
          },
          usage: data.usage
        };
      }

      return {
        success: false,
        error: 'No valid request format provided (document or messages required)'
      };

    } catch (error) {
      console.error('Mistral OCR processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Process images with vision model
   */
  async processVision(images: string[], prompt: string = 'Please analyze this image and extract any text using OCR. If there is text in the image, please extract it accurately and provide any analysis requested.'): Promise<MistralOCRResponse> {
    try {
      const messages = [
        {
          role: 'user' as const,
          content: [
            { type: 'text' as const, text: prompt },
            ...images.map(imageUrl => ({
              type: 'image_url' as const,
              image_url: { url: imageUrl }
            }))
          ]
        }
      ];

      return await this.processOCR({ 
        model: 'pixtral-large-2411', 
        messages,
        max_tokens: 4096,
        temperature: 0.3
      });

    } catch (error) {
      console.error('Mistral vision processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Vision processing failed'
      };
    }
  }

  /**
   * Convert file to base64 for processing
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const mistralOCRService = MistralOCRService.getInstance();