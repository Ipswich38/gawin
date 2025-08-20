import React, { useState, useEffect } from 'react';
import { AIModel } from '../lib/types';
// import { groqApi } from '../lib/services/groqApi'; // REMOVED - service no longer exists
// import { colors, typography, spacing, borderRadius } from theme - DISABLED

interface ModelSelectionScreenProps {
  selectedModelId: string;
  onModelSelect: (model: AIModel) => void;
  onClose: () => void;
}

const ModelSelectionScreen: React.FC<ModelSelectionScreenProps> = ({
  selectedModelId,
  onModelSelect,
  onClose,
}) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      // TEMPORARILY DISABLED - groqApi service removed
      const availableModels: AIModel[] = []; // Empty array for now
      /*
      const availableModels = await groqApi.getAvailableModels();
      */
      setModels(availableModels);
    } catch (error) {
      alert('Failed to load AI models');
      console.error('Load models error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (model: AIModel) => {
    onModelSelect(model);
    onClose();
  };

  const getTypeColor = (type: AIModel['type']) => {
    switch (type) {
      case 'text':
        return "#F59E0B";
      case 'vision':
        return "#00ff00";
      case 'audio':
        return "#3B82F6";
      case 'reasoning':
        return "#F59E0B";
      default:
        return "#9ca3af";
    }
  };

  const getTypeIcon = (type: AIModel['type']) => {
    switch (type) {
      case 'text':
        return '◉';
      case 'vision':
        return '◎';
      case 'audio':
        return '♪';
      case 'reasoning':
        return '◈';
      default:
        return '○';
    }
  };

  const renderModel = (model: AIModel) => {
    const isSelected = model.id === selectedModelId;
    const typeColor = getTypeColor(model.type);
    const typeIcon = getTypeIcon(model.type);

    return (
      <div
        key={model.id}
        onClick={() => handleModelSelect(model)}
        style={{
          backgroundColor: "#1f2937",
          border: "1px solid #374151",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "8px",
          cursor: model.isActive ? 'pointer' : 'not-allowed',
          opacity: model.isActive ? 1 : 0.6,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: "8px",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                color: typeColor,
                fontSize: "16px",
                marginRight: "4px",
              }}
            >
              {typeIcon}
            </span>
            <span
              style={{
                color: typeColor,
                fontSize: "12px",
                fontFamily: "monospace",
                fontWeight: 'bold',
                letterSpacing: '1px',
              }}
            >
              {model.type.toUpperCase()}
            </span>
          </div>
          {isSelected && (
            <div
              style={{
                backgroundColor: "#00ff00",
                color: "#1a1a1a",
                padding: '2px 8px',
                borderRadius: "6px",
                fontSize: "12px",
                fontFamily: "monospace",
                fontWeight: 'bold',
                letterSpacing: '1px',
              }}
            >
              ACTIVE
            </div>
          )}
        </div>

        <h3
          style={{
            color: "#ffffff",
            fontSize: "18px",
            fontFamily: "monospace",
            fontWeight: 'bold',
            margin: "0 0 4px 0",
          }}
        >
          {model.name}
        </h3>
        
        <p
          style={{
            color: "#9ca3af",
            fontSize: "14px",
            fontFamily: "monospace",
            margin: "0 0 4px 0",
            lineHeight: '1.6',
          }}
        >
          {model.description}
        </p>

        <div style={{ display: 'flex', gap: "24px", flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                color: "#9ca3af",
                fontSize: "12px",
                fontFamily: "monospace",
                letterSpacing: '1px',
              }}
            >
              MAX TOKENS
            </div>
            <div
              style={{
                color: "#F59E0B",
                fontSize: "14px",
                fontFamily: "monospace",
                fontWeight: 'bold',
              }}
            >
              {model.maxTokens.toLocaleString()}
            </div>
          </div>
          {model.supportsFunctionCalling && (
            <div>
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  letterSpacing: '1px',
                }}
              >
                FUNCTIONS
              </div>
              <div
                style={{
                  color: "#F59E0B",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  fontWeight: 'bold',
                }}
              >
                ✓
              </div>
            </div>
          )}
        </div>

        {!model.isActive && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: "8px",
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                color: "#F59E0B",
                fontSize: "16px",
                fontFamily: "monospace",
                fontWeight: 'bold',
                letterSpacing: '2px',
              }}
            >
              COMING SOON
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        fontFamily: "monospace",
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: "16px",
          borderBottom: "1px solid #374151",
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: "#F59E0B",
            fontSize: "14px",
            fontFamily: "monospace",
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: "4px",
          }}
        >
          ← BACK
        </button>
        <h1
          style={{
            color: "#ffffff",
            fontSize: "18px",
            fontFamily: "monospace",
            fontWeight: 'bold',
            letterSpacing: '1px',
            margin: 0,
          }}
        >
          AI MODELS
        </h1>
        <div style={{ width: '60px' }} />
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
            }}
          >
            <span
              style={{
                color: "#00ff00",
                fontSize: "18px",
                fontFamily: "monospace",
              }}
            >
              Loading models...
            </span>
          </div>
        ) : (
          <>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "16px",
                fontFamily: "monospace",
                textAlign: 'center',
                marginBottom: "32px",
                lineHeight: '1.6',
              }}
            >
              Choose your AI companion for lightning-fast responses
            </p>

            {/* Group models by type */}
            {['text', 'reasoning', 'vision', 'audio'].map(type => {
              const typeModels = models.filter(model => model.type === type);
              if (typeModels.length === 0) return null;

              return (
                <div key={type} style={{ marginBottom: "24px" }}>
                  <h2
                    style={{
                      color: getTypeColor(type as AIModel['type']),
                      fontSize: "16px",
                      fontFamily: "monospace",
                      fontWeight: 'bold',
                      marginBottom: "8px",
                      letterSpacing: '1px',
                    }}
                  >
                    {getTypeIcon(type as AIModel['type'])} {type.toUpperCase()} MODELS
                  </h2>
                  {typeModels.map(renderModel)}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default ModelSelectionScreen;