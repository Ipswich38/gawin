'use client';

import React from 'react';
import { UniversalDocumentFormatter, DocumentType } from '@/lib/formatters/universalDocumentFormatter';

interface UniversalDocumentRendererProps {
  content: string;
  documentType: DocumentType;
  showDocumentInfo?: boolean;
}

export default function UniversalDocumentRenderer({
  content,
  documentType,
  showDocumentInfo = false
}: UniversalDocumentRendererProps) {

  // Apply document-specific formatting
  const formattedContent = UniversalDocumentFormatter.applySpecialFormatting(content, documentType);

  // Get document-specific styles
  const documentStyles = UniversalDocumentFormatter.getDocumentStyles(documentType);

  // Document type display names
  const documentTypeNames = {
    script: 'Movie Script',
    feasibility: 'Feasibility Study',
    business_report: 'Business Report',
    research_paper: 'Research Paper',
    proposal: 'Business Proposal',
    resume: 'Resume/CV',
    letter: 'Formal Letter',
    manual: 'User Manual',
    presentation: 'Presentation',
    contract: 'Contract/Agreement',
    poem: 'Poem',
    lyrics: 'Song Lyrics',
    list: 'List/Instructions',
    recipe: 'Recipe',
    essay: 'Essay/Article',
    text: 'General Text'
  };

  // Professional document container styles
  const containerStyles = `
    .universal-document-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      margin: 20px 0;
      overflow: hidden;
    }

    .document-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 25px;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border-bottom: 3px solid #4f46e5;
    }

    .document-content {
      padding: 30px;
      min-height: 200px;
      background: #fafafa;
      background-image:
        linear-gradient(90deg, #f0f0f0 1px, transparent 1px),
        linear-gradient(180deg, #f0f0f0 1px, transparent 1px);
      background-size: 20px 20px;
    }

    .document-content-inner {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: inset 0 0 0 1px #e5e7eb;
      min-height: 300px;
    }

    /* Document-specific styles */
    .script-style {
      font-family: 'Courier New', monospace;
      background: #fefefe;
    }

    .business-style {
      font-family: 'Times New Roman', serif;
      background: #ffffff;
    }

    .presentation-style {
      font-family: 'Arial', sans-serif;
      background: #f8fafc;
    }

    .creative-style {
      font-family: 'Georgia', serif;
      background: #fffdf7;
    }

    /* Print styles */
    @media print {
      .universal-document-container {
        box-shadow: none;
        border: none;
        margin: 0;
      }

      .document-header {
        background: #333 !important;
        -webkit-print-color-adjust: exact;
      }

      .document-content {
        background: white !important;
        padding: 20px;
      }
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .document-content {
        padding: 20px;
      }

      .document-content-inner {
        padding: 25px;
      }

      .document-header {
        padding: 12px 20px;
        font-size: 12px;
      }
    }
  `;

  // Get document-specific container class
  const getDocumentClass = (type: DocumentType): string => {
    const classMap = {
      script: 'script-style',
      feasibility: 'business-style',
      business_report: 'business-style',
      research_paper: 'business-style',
      proposal: 'business-style',
      resume: 'business-style',
      letter: 'business-style',
      manual: 'business-style',
      presentation: 'presentation-style',
      contract: 'business-style',
      poem: 'creative-style',
      lyrics: 'creative-style',
      list: 'business-style',
      recipe: 'creative-style',
      essay: 'business-style',
      text: 'business-style'
    };

    return classMap[type] || 'business-style';
  };

  return (
    <>
      {/* Inject styles */}
      <style dangerouslySetInnerHTML={{ __html: containerStyles }} />

      <div className="universal-document-container">
        {/* Document type header */}
        {showDocumentInfo && (
          <div className="document-header">
            📄 {documentTypeNames[documentType]} Document
          </div>
        )}

        {/* Document content */}
        <div className="document-content">
          <div className={`document-content-inner ${getDocumentClass(documentType)}`}>
            <div
              style={{
                ...Object.fromEntries(
                  documentStyles
                    .split(';')
                    .filter(rule => rule.trim())
                    .map(rule => {
                      const [key, value] = rule.split(':').map(s => s.trim());
                      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                      return [camelKey, value];
                    })
                )
              }}
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          </div>
        </div>
      </div>
    </>
  );
}