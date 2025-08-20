import React, { useState, useEffect } from 'react';
import { memoryService } from '../services/memoryService';

interface MemoryStatusProps {
  onClose: () => void;
}

const MemoryStatus: React.FC<MemoryStatusProps> = ({ onClose }) => {
  const [stats, setStats] = useState<any>({});
  const [conversationSummary, setConversationSummary] = useState<string>('');

  useEffect(() => {
    loadMemoryStats();
  }, []);

  const loadMemoryStats = () => {
    const memoryStats = memoryService.getMemoryStats();
    const summary = memoryService.getConversationSummary();
    setStats(memoryStats);
    setConversationSummary(summary);
  };

  const clearMemory = () => {
    memoryService.clearMemory();
    loadMemoryStats();
  };

  const startNewSession = () => {
    memoryService.startNewSession();
    loadMemoryStats();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(24px)',
        borderRadius: '20px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(42, 43, 38, 0.15), 0 8px 32px rgba(42, 43, 38, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.9)',
          }}>
            🧠 Memory & Context Status
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            ×
          </button>
        </div>

        {/* Current Session */}
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          marginBottom: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500' }}>
            Current Session
          </h3>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
            Session ID: {stats.currentSession}
          </div>
          {conversationSummary && (
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4' }}>
              {conversationSummary}
            </div>
          )}
        </div>

        {/* Memory Statistics */}
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          marginBottom: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500' }}>
            Memory Statistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Working Memory: <span style={{ color: 'rgba(255, 107, 53, 0.9)', fontWeight: '500' }}>{stats.workingMemory || 0}</span>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Short Term: <span style={{ color: 'rgba(255, 107, 53, 0.9)', fontWeight: '500' }}>{stats.shortTerm || 0}</span>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Medium Term: <span style={{ color: 'rgba(255, 107, 53, 0.9)', fontWeight: '500' }}>{stats.mediumTerm || 0}</span>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Entities: <span style={{ color: 'rgba(255, 107, 53, 0.9)', fontWeight: '500' }}>{stats.entities || 0}</span>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Topics: <span style={{ color: 'rgba(255, 107, 53, 0.9)', fontWeight: '500' }}>{stats.topics || 0}</span>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Sessions: <span style={{ color: 'rgba(255, 107, 53, 0.9)', fontWeight: '500' }}>{stats.sessions || 0}</span>
            </div>
          </div>
        </div>

        {/* Memory Layers Explanation */}
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500' }}>
            Memory System (Inspired by Atlassian Rovo)
          </h3>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.4' }}>
            <div style={{ marginBottom: '6px' }}>
              <strong style={{ color: 'rgba(255, 107, 53, 0.9)' }}>Working Memory:</strong> Current conversation context
            </div>
            <div style={{ marginBottom: '6px' }}>
              <strong style={{ color: 'rgba(255, 107, 53, 0.9)' }}>Short Term:</strong> Last 10 interactions
            </div>
            <div style={{ marginBottom: '6px' }}>
              <strong style={{ color: 'rgba(255, 107, 53, 0.9)' }}>Medium Term:</strong> Session history
            </div>
            <div style={{ marginBottom: '6px' }}>
              <strong style={{ color: 'rgba(255, 107, 53, 0.9)' }}>Long Term:</strong> Knowledge graph with entities and relationships
            </div>
          </div>
        </div>

        {/* Memory Features */}
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500' }}>
            Advanced Features
          </h3>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
            <div style={{ marginBottom: '4px' }}>• Entity extraction and relationship mapping</div>
            <div style={{ marginBottom: '4px' }}>• Topic clustering and context tracking</div>
            <div style={{ marginBottom: '4px' }}>• Sentiment analysis and complexity assessment</div>
            <div style={{ marginBottom: '4px' }}>• Persistent storage with privacy compliance</div>
            <div style={{ marginBottom: '4px' }}>• Context-aware response generation</div>
            <div>• Session management and archiving</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={loadMemoryStats}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '12px 16px',
              background: 'rgba(255, 107, 53, 0.8)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              fontWeight: '500',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.25)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🔄 Refresh
          </button>
          
          <button
            onClick={startNewSession}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              fontWeight: '500',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            🆕 New Session
          </button>
          
          <button
            onClick={clearMemory}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '12px 16px',
              background: 'rgba(255, 0, 0, 0.15)',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: '12px',
              fontWeight: '500',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 0, 0.25)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 0, 0.15)';
            }}
          >
            🗑️ Clear Memory
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryStatus;