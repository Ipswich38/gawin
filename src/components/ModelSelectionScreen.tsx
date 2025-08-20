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
        return colors.amber;
      case 'vision':
        return colors.phosphorGreen;
      case 'audio':
        return colors.info;
      case 'reasoning':
        return colors.warning;
      default:
        return colors.secondaryText;
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
          backgroundColor: colors.terminalGray,
          border: `1px solid ${isSelected ? colors.phosphorGreen : colors.border}`,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
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
            marginBottom: spacing.sm,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                color: typeColor,
                fontSize: typography.md,
                marginRight: spacing.xs,
              }}
            >
              {typeIcon}
            </span>
            <span
              style={{
                color: typeColor,
                fontSize: typography.xs,
                fontFamily: typography.mono,
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
                backgroundColor: colors.phosphorGreen,
                color: colors.terminalBlack,
                padding: '2px 8px',
                borderRadius: borderRadius.sm,
                fontSize: typography.xs,
                fontFamily: typography.mono,
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
            color: colors.primaryText,
            fontSize: typography.lg,
            fontFamily: typography.mono,
            fontWeight: 'bold',
            margin: `0 0 ${spacing.xs} 0`,
          }}
        >
          {model.name}
        </h3>
        
        <p
          style={{
            color: colors.secondaryText,
            fontSize: typography.sm,
            fontFamily: typography.mono,
            margin: `0 0 ${spacing.sm} 0`,
            lineHeight: '1.6',
          }}
        >
          {model.description}
        </p>

        <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                color: colors.secondaryText,
                fontSize: typography.xs,
                fontFamily: typography.mono,
                letterSpacing: '1px',
              }}
            >
              MAX TOKENS
            </div>
            <div
              style={{
                color: colors.amber,
                fontSize: typography.sm,
                fontFamily: typography.mono,
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
                  color: colors.secondaryText,
                  fontSize: typography.xs,
                  fontFamily: typography.mono,
                  letterSpacing: '1px',
                }}
              >
                FUNCTIONS
              </div>
              <div
                style={{
                  color: colors.amber,
                  fontSize: typography.sm,
                  fontFamily: typography.mono,
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
              borderRadius: borderRadius.md,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                color: colors.warning,
                fontSize: typography.md,
                fontFamily: typography.mono,
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
        backgroundColor: colors.terminalBlack,
        color: colors.primaryText,
        fontFamily: typography.mono,
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: spacing.md,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: colors.amber,
            fontSize: typography.sm,
            fontFamily: typography.mono,
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: spacing.xs,
          }}
        >
          ← BACK
        </button>
        <h1
          style={{
            color: colors.primaryText,
            fontSize: typography.lg,
            fontFamily: typography.mono,
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
      <div style={{ padding: spacing.md }}>
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
                color: colors.phosphorGreen,
                fontSize: typography.lg,
                fontFamily: typography.mono,
              }}
            >
              Loading models...
            </span>
          </div>
        ) : (
          <>
            <p
              style={{
                color: colors.secondaryText,
                fontSize: typography.md,
                fontFamily: typography.mono,
                textAlign: 'center',
                marginBottom: spacing.xl,
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
                <div key={type} style={{ marginBottom: spacing.lg }}>
                  <h2
                    style={{
                      color: getTypeColor(type as AIModel['type']),
                      fontSize: typography.md,
                      fontFamily: typography.mono,
                      fontWeight: 'bold',
                      marginBottom: spacing.sm,
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