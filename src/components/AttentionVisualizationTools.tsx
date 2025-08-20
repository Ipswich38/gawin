import React, { useState, useEffect, useMemo } from 'react';

const AttentionVisualizationTools = () => {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [selectedHead, setSelectedHead] = useState(0);
  const [hoverToken, setHoverToken] = useState<number | null>(null);
  const [analysisMode, setAnalysisMode] = useState('attention');
  const [sentence, setSentence] = useState("How do neural networks learn to understand language patterns?");

  // Simulate attention weights and model analysis
  const tokens = sentence.split(' ');
  const numLayers = 12;
  const numHeads = 8;

  // Generate simulated attention matrices
  const generateAttentionMatrix = (layer: number, head: number, tokens: string[]) => {
    const matrix = [];
    const len = tokens.length;
    
    for (let i = 0; i < len; i++) {
      const row = [];
      for (let j = 0; j < len; j++) {
        // Simulate different attention patterns based on layer/head
        let weight;
        if (head === 0) {
          // Head 0: Focus on adjacent tokens (syntax)
          weight = Math.exp(-Math.abs(i - j) * 0.5) + Math.random() * 0.1;
        } else if (head === 1) {
          // Head 1: Focus on question words and key nouns
          const isQuestionWord = ['how', 'what', 'why', 'when'].includes(tokens[i]?.toLowerCase());
          const isKeyNoun = ['networks', 'language', 'patterns'].includes(tokens[j]?.toLowerCase());
          weight = (isQuestionWord && isKeyNoun) ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3;
        } else if (head === 2) {
          // Head 2: Focus on semantic relationships
          const semanticPairs = [
            ['neural', 'networks'], ['learn', 'understand'], ['language', 'patterns']
          ];
          const isPair = semanticPairs.some(([a, b]) => 
            (tokens[i]?.toLowerCase() === a && tokens[j]?.toLowerCase() === b) ||
            (tokens[i]?.toLowerCase() === b && tokens[j]?.toLowerCase() === a)
          );
          weight = isPair ? 0.7 + Math.random() * 0.3 : Math.random() * 0.2;
        } else {
          // Other heads: Various patterns
          weight = Math.random() * 0.4 + (layer / numLayers) * 0.3;
        }
        
        row.push(Math.max(0.01, Math.min(0.99, weight)));
      }
      
      // Normalize row to sum to 1 (softmax-like)
      const sum = row.reduce((a, b) => a + b, 0);
      matrix.push(row.map(w => w / sum));
    }
    
    return matrix;
  };

  const attentionMatrix = useMemo(() => 
    generateAttentionMatrix(selectedLayer, selectedHead, tokens),
    [selectedLayer, selectedHead, tokens.length]
  );

  // Analyze attention patterns
  const analyzeAttentionPatterns = (matrix: number[][], tokens: string[]) => {
    const patterns = {
      selfAttention: 0,
      localAttention: 0,
      globalAttention: 0,
      semanticAttention: 0
    };

    for (let i = 0; i < matrix.length; i++) {
      // Self-attention (diagonal)
      patterns.selfAttention += matrix[i][i];
      
      // Local attention (nearby tokens)
      for (let j = Math.max(0, i-2); j <= Math.min(matrix.length-1, i+2); j++) {
        if (i !== j) patterns.localAttention += matrix[i][j];
      }
      
      // Global attention (distant tokens)
      for (let j = 0; j < matrix.length; j++) {
        if (Math.abs(i - j) > 2) patterns.globalAttention += matrix[i][j];
      }
    }

    // Normalize
    const total = matrix.length * matrix.length;
    return {
      selfAttention: (patterns.selfAttention / matrix.length * 100).toFixed(1),
      localAttention: (patterns.localAttention / total * 100).toFixed(1),
      globalAttention: (patterns.globalAttention / total * 100).toFixed(1)
    };
  };

  const patterns = analyzeAttentionPatterns(attentionMatrix, tokens);

  // Get attention flow for a specific token
  const getAttentionFlow = (tokenIndex: number | null) => {
    if (tokenIndex === null) return { outgoing: [], incoming: [] };
    
    const outgoing = attentionMatrix[tokenIndex].map((weight, idx) => ({
      target: tokens[idx],
      targetIndex: idx,
      weight: weight,
      type: 'outgoing' as const
    })).filter(item => item.weight > 0.1).sort((a, b) => b.weight - a.weight);

    const incoming = attentionMatrix.map((row, idx) => ({
      source: tokens[idx],
      sourceIndex: idx,
      weight: row[tokenIndex],
      type: 'incoming' as const
    })).filter(item => item.weight > 0.1).sort((a, b) => b.weight - a.weight);

    return { outgoing: outgoing.slice(0, 5), incoming: incoming.slice(0, 5) };
  };

  const attentionFlow = getAttentionFlow(hoverToken);

  // Head specialization analysis
  const analyzeHeadSpecialization = () => {
    const specializations = [
      { head: 0, role: "Syntactic Relations", description: "Focuses on grammatical structure and adjacent words" },
      { head: 1, role: "Question Processing", description: "Connects question words to relevant content" },
      { head: 2, role: "Semantic Relations", description: "Links semantically related concepts" },
      { head: 3, role: "Long-range Dependencies", description: "Connects distant but related elements" },
      { head: 4, role: "Entity Recognition", description: "Identifies and tracks entities" },
      { head: 5, role: "Causal Relations", description: "Traces cause-and-effect relationships" },
      { head: 6, role: "Contextual Integration", description: "Integrates context from multiple sources" },
      { head: 7, role: "Meta-linguistic", description: "Processes language about language" }
    ];
    
    return specializations;
  };

  const headSpecializations = analyzeHeadSpecialization();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🧠 Attention Visualization & Model Interpretability</h1>
        <p className="text-gray-600">Explore how language models process and understand text through attention patterns</p>
      </div>

      {/* Input Controls */}
      <div style={{
        background: 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(24px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white'
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Input & Controls</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Input Sentence:</label>
            <input
              type="text"
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
              placeholder="Enter text to analyze..."
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Layer: {selectedLayer}</label>
              <input
                type="range"
                min="0"
                max={numLayers - 1}
                value={selectedLayer}
                onChange={(e) => setSelectedLayer(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Head: {selectedHead}</label>
              <input
                type="range"
                min="0"
                max={numHeads - 1}
                value={selectedHead}
                onChange={(e) => setSelectedHead(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Analysis Mode:</label>
              <select
                value={analysisMode}
                onChange={(e) => setAnalysisMode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              >
                <option value="attention">Attention Patterns</option>
                <option value="flow">Information Flow</option>
                <option value="specialization">Head Specialization</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Attention Matrix Visualization */}
      <div style={{
        background: 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(24px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white'
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
          Attention Matrix - Layer {selectedLayer}, Head {selectedHead}
        </h3>
        
        <div className="space-y-4">
          {/* Token labels */}
          <div className="flex space-x-1 text-xs">
            <div className="w-16"></div>
            {tokens.map((token, idx) => (
              <div key={idx} className="w-16 text-center font-mono truncate">
                {token}
              </div>
            ))}
          </div>
          
          {/* Attention matrix */}
          <div className="space-y-1">
            {attentionMatrix.map((row, i) => (
              <div key={i} className="flex space-x-1 items-center">
                <div className="w-16 text-xs font-mono text-right pr-2 truncate">
                  {tokens[i]}
                </div>
                {row.map((weight, j) => (
                  <div
                    key={j}
                    className="w-16 h-8 border cursor-pointer relative group"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${weight})`,
                      border: hoverToken === i ? '2px solid #FF6B35' : '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={() => setHoverToken(i)}
                    onMouseLeave={() => setHoverToken(null)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white opacity-0 group-hover:opacity-100">
                      {(weight * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <div className="text-xs text-gray-400">
            💡 Hover over cells to see attention weights. Darker blue = higher attention.
          </div>
        </div>
      </div>

      {/* Analysis Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attention Patterns Analysis */}
        <div style={{
          background: 'rgba(20, 20, 25, 0.95)',
          backdropFilter: 'blur(24px)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Attention Pattern Analysis</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}>
                <div className="text-2xl font-bold text-blue-400">{patterns.selfAttention}%</div>
                <div className="text-sm text-gray-400">Self-Attention</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                <div className="text-2xl font-bold text-green-400">{patterns.localAttention}%</div>
                <div className="text-sm text-gray-400">Local Focus</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '8px' }}>
                <div className="text-2xl font-bold text-purple-400">{patterns.globalAttention}%</div>
                <div className="text-sm text-gray-400">Global Context</div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <p><strong>Processing Strategy:</strong> {
                Number(patterns.selfAttention) > 40 ? "Self-focused processing" :
                Number(patterns.localAttention) > 50 ? "Local context emphasis" :
                "Global context integration"
              }</p>
              
              <p><strong>Reasoning Type:</strong> {
                selectedHead <= 1 ? "Syntactic processing" :
                selectedHead <= 3 ? "Semantic understanding" :
                "Complex reasoning"
              }</p>
            </div>
          </div>
        </div>

        {/* Information Flow */}
        <div style={{
          background: 'rgba(20, 20, 25, 0.95)',
          backdropFilter: 'blur(24px)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
            Information Flow {hoverToken !== null ? `- "${tokens[hoverToken]}"` : ""}
          </h3>
          
          {hoverToken !== null ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">🔍 Attends To:</h4>
                <div className="space-y-1">
                  {attentionFlow.outgoing.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      borderRadius: '8px'
                    }}>
                      <span className="font-mono text-sm">{item.target}</span>
                      <span className="text-sm font-bold">{(item.weight * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">📥 Receives From:</h4>
                <div className="space-y-1">
                  {attentionFlow.incoming.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px'
                    }}>
                      <span className="font-mono text-sm">{item.source}</span>
                      <span className="text-sm font-bold">{(item.weight * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Hover over a token in the attention matrix to see its information flow
            </div>
          )}
        </div>
      </div>

      {/* Head Specialization */}
      <div style={{
        background: 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(24px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white'
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Attention Head Specializations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {headSpecializations.map((spec, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: selectedHead === idx ? '2px solid #FF6B35' : '2px solid rgba(255, 255, 255, 0.2)',
                background: selectedHead === idx ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedHead(idx)}
            >
              <div className="font-semibold text-sm mb-1">Head {idx}</div>
              <div style={{ fontWeight: 'bold', color: '#FF6B35', marginBottom: '8px' }}>{spec.role}</div>
              <div className="text-xs text-gray-400">{spec.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretability Insights */}
      <div style={{
        background: 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(24px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white'
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>🔬 Interpretability Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">What This Reveals About Model Reasoning:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span><strong>Specialized Processing:</strong> Different heads focus on syntax, semantics, and reasoning</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span><strong>Hierarchical Understanding:</strong> Early layers focus on syntax, later layers on meaning</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                <span><strong>Dynamic Attention:</strong> Focus shifts based on context and query requirements</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-400 mr-2">•</span>
                <span><strong>Information Integration:</strong> Multiple attention patterns combine for understanding</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Debugging Model Behavior:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-red-400 mr-2">•</span>
                <span><strong>Attention Collapse:</strong> All attention on one token indicates potential issues</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span><strong>Uniform Distribution:</strong> No clear focus may indicate confusion</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span><strong>Expected Patterns:</strong> Question words should attend to relevant nouns</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span><strong>Layer Progression:</strong> Attention should become more semantic in deeper layers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttentionVisualizationTools;