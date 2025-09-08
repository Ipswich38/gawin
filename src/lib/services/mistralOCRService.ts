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
    this.apiKey = ''; // OCR functionality disabled
    console.log('⚠️ OCR/Vision processing has been disabled.');
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
    return false; // Always return false as OCR is disabled
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
   * Process OCR requests - DISABLED
   */
  async processOCR(request: MistralOCRRequest): Promise<MistralOCRResponse> {
    return {
      success: false,
      error: 'OCR functionality has been disabled. File processing is not available.'
    };
  }

  /**
   * Process images with vision model - DISABLED
   */
  async processVision(images: string[], prompt?: string): Promise<MistralOCRResponse> {
    return {
      success: false,
      error: 'Vision processing functionality has been disabled. Image analysis is not available.'
    };
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