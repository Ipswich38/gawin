'use client';

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle,
  Position,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Play,
  Save,
  Settings,
  MessageSquare,
  Search,
  Eye,
  Mic,
  Brain,
  Database,
  Globe,
  Code,
  Image,
  FileText,
  BarChart3,
  Zap,
  X,
  Edit3,
  ChevronRight,
  Activity
} from 'lucide-react';
import { NotionCard, NotionButton, NotionInput, NotionModal, NotionTag } from './ui/NotionUI';

// Enhanced Agent Types
interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  inputs: { id: string; name: string; type: string; required?: boolean }[];
  outputs: { id: string; name: string; type: string }[];
  settings: { name: string; type: string; defaultValue: any; description: string }[];
}

// Agent Templates with full configuration
const AGENT_CONFIGS: Record<string, AgentConfig> = {
  chat: {
    id: 'chat',
    name: 'AI Chat Agent',
    description: 'Intelligent conversation and Q&A capabilities',
    icon: MessageSquare,
    color: 'blue',
    inputs: [
      { id: 'message', name: 'Message', type: 'text', required: true },
      { id: 'context', name: 'Context', type: 'text' },
      { id: 'system_prompt', name: 'System Prompt', type: 'text' }
    ],
    outputs: [
      { id: 'response', name: 'Response', type: 'text' },
      { id: 'tokens_used', name: 'Tokens Used', type: 'number' }
    ],
    settings: [
      { name: 'model', type: 'select', defaultValue: 'gpt-4', description: 'AI model to use' },
      { name: 'temperature', type: 'number', defaultValue: 0.7, description: 'Response creativity (0-1)' },
      { name: 'max_tokens', type: 'number', defaultValue: 1000, description: 'Maximum response length' }
    ]
  },
  research: {
    id: 'research',
    name: 'Research Agent',
    description: 'Web search and research capabilities',
    icon: Search,
    color: 'green',
    inputs: [
      { id: 'query', name: 'Search Query', type: 'text', required: true },
      { id: 'sources', name: 'Specific Sources', type: 'array' }
    ],
    outputs: [
      { id: 'results', name: 'Research Results', type: 'array' },
      { id: 'summary', name: 'Summary', type: 'text' },
      { id: 'sources_count', name: 'Sources Found', type: 'number' }
    ],
    settings: [
      { name: 'max_results', type: 'number', defaultValue: 10, description: 'Maximum search results' },
      { name: 'include_images', type: 'boolean', defaultValue: false, description: 'Include image results' },
      { name: 'time_range', type: 'select', defaultValue: 'any', description: 'Time range for results' }
    ]
  },
  vision: {
    id: 'vision',
    name: 'Vision Agent',
    description: 'Image analysis and computer vision',
    icon: Eye,
    color: 'indigo',
    inputs: [
      { id: 'image_url', name: 'Image URL', type: 'url', required: true },
      { id: 'analysis_type', name: 'Analysis Type', type: 'text' }
    ],
    outputs: [
      { id: 'description', name: 'Description', type: 'text' },
      { id: 'objects', name: 'Objects Found', type: 'array' },
      { id: 'confidence', name: 'Confidence Score', type: 'number' }
    ],
    settings: [
      { name: 'detail_level', type: 'select', defaultValue: 'medium', description: 'Analysis detail level' },
      { name: 'include_text', type: 'boolean', defaultValue: true, description: 'Extract text from image' }
    ]
  },
  voice: {
    id: 'voice',
    name: 'Voice Agent',
    description: 'Text-to-speech and voice synthesis',
    icon: Mic,
    color: 'orange',
    inputs: [
      { id: 'text', name: 'Text to Speak', type: 'text', required: true },
      { id: 'voice_id', name: 'Voice ID', type: 'text' }
    ],
    outputs: [
      { id: 'audio_url', name: 'Audio URL', type: 'url' },
      { id: 'duration', name: 'Duration (seconds)', type: 'number' }
    ],
    settings: [
      { name: 'voice', type: 'select', defaultValue: 'default', description: 'Voice to use' },
      { name: 'speed', type: 'number', defaultValue: 1.0, description: 'Speaking speed' },
      { name: 'pitch', type: 'number', defaultValue: 0, description: 'Voice pitch adjustment' }
    ]
  },
  data: {
    id: 'data',
    name: 'Data Agent',
    description: 'Data processing and transformation',
    icon: Database,
    color: 'purple',
    inputs: [
      { id: 'data', name: 'Input Data', type: 'json', required: true },
      { id: 'schema', name: 'Data Schema', type: 'json' }
    ],
    outputs: [
      { id: 'processed_data', name: 'Processed Data', type: 'json' },
      { id: 'summary', name: 'Data Summary', type: 'text' }
    ],
    settings: [
      { name: 'operation', type: 'select', defaultValue: 'transform', description: 'Data operation' },
      { name: 'format', type: 'select', defaultValue: 'json', description: 'Output format' }
    ]
  }
};

// Custom Node Component
const AgentNode: React.FC<{ data: any }> = ({ data }) => {
  const { config, settings, isSelected, onEdit } = data;
  const IconComponent = config.icon;

  return (
    <div className={`
      bg-white rounded-lg border-2 transition-all duration-200 min-w-[200px]
      ${isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 shadow-sm hover:shadow-md'}
    `}>
      {/* Header */}
      <div className={`p-3 bg-${config.color}-50 rounded-t-lg border-b border-gray-200`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 bg-${config.color}-500 text-white rounded-lg flex items-center justify-center`}>
            <IconComponent size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {settings.name || config.name}
            </h3>
            <p className="text-xs text-gray-600 truncate">{config.description}</p>
          </div>
          <NotionButton
            variant="ghost"
            size="sm"
            onClick={onEdit}
            icon={<Edit3 className="w-3 h-3" />}
          />
        </div>
      </div>

      {/* Input Handles */}
      <div className="relative">
        {config.inputs.map((input: any, index: number) => (
          <Handle
            key={input.id}
            type="target"
            position={Position.Left}
            id={input.id}
            style={{
              top: 60 + index * 20,
              width: '12px',
              height: '12px',
              backgroundColor: input.required ? '#ef4444' : '#6b7280',
              border: '2px solid white'
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Input Labels */}
        {config.inputs.map((input: any, index: number) => (
          <div key={input.id} className="text-xs text-gray-600 pl-4">
            <span className={input.required ? 'text-red-600' : ''}>{input.name}</span>
          </div>
        ))}

        {/* Status Indicator */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <span className="text-xs text-gray-500">Idle</span>
        </div>
      </div>

      {/* Output Handles */}
      <div className="relative">
        {config.outputs.map((output: any, index: number) => (
          <Handle
            key={output.id}
            type="source"
            position={Position.Right}
            id={output.id}
            style={{
              top: 60 + index * 20,
              width: '12px',
              height: '12px',
              backgroundColor: '#10b981',
              border: '2px solid white'
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Main Component
const EnhancedWorkflowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState({
    name: 'Untitled Workflow',
    description: 'A new AI agent workflow'
  });

  const nodeTypes: NodeTypes = useMemo(() => ({
    agentNode: AgentNode,
  }), []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      style: { stroke: '#6b7280', strokeWidth: 2 },
      animated: true
    }, eds)),
    [setEdges]
  );

  const addAgent = useCallback((agentType: string) => {
    const config = AGENT_CONFIGS[agentType];
    if (!config) return;

    const newNode: Node = {
      id: `${agentType}-${Date.now()}`,
      type: 'agentNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        config,
        settings: { name: config.name },
        isSelected: false,
        onEdit: () => {
          setSelectedNode(newNode.id);
          setShowTaskPanel(true);
        }
      }
    };

    setNodes((nds) => nds.concat(newNode));
    setShowAgentPanel(false);
  }, [setNodes]);

  const saveWorkflow = useCallback(async () => {
    const workflowData = {
      name: currentWorkflow.name,
      description: currentWorkflow.description,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data
      })),
      connections: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      }))
    };

    console.log('Saving workflow:', workflowData);
    // Here you would call your API to save the workflow
  }, [nodes, edges, currentWorkflow]);

  const runWorkflow = useCallback(async () => {
    console.log('Running workflow with', nodes.length, 'agents');
    // Here you would call your execution engine
  }, [nodes]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{currentWorkflow.name}</h1>
            <p className="text-sm text-gray-600">{currentWorkflow.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <NotionButton
              variant="outline"
              onClick={() => setShowAgentPanel(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Agent
            </NotionButton>
            <NotionButton
              variant="secondary"
              onClick={saveWorkflow}
              icon={<Save className="w-4 h-4" />}
            >
              Save
            </NotionButton>
            <NotionButton
              variant="primary"
              onClick={runWorkflow}
              icon={<Play className="w-4 h-4" />}
            >
              Run Workflow
            </NotionButton>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#f3f4f6" gap={20} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Agent Selection Panel */}
      <AnimatePresence>
        {showAgentPanel && (
          <NotionModal
            isOpen={showAgentPanel}
            onClose={() => setShowAgentPanel(false)}
            title="Add Agent"
            subtitle="Choose an agent type to add to your workflow"
          >
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(AGENT_CONFIGS).map(([key, config]) => {
                const IconComponent = config.icon;
                return (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <NotionCard
                      className="cursor-pointer hover:border-blue-300"
                      onClick={() => addAgent(key)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 bg-${config.color}-100 rounded-lg flex items-center justify-center`}>
                          <IconComponent className={`w-6 h-6 text-${config.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            {config.name}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2">
                            {config.description}
                          </p>
                          <div className="flex items-center gap-1">
                            <NotionTag color={config.color} className="text-xs">
                              {config.inputs.length} inputs
                            </NotionTag>
                            <NotionTag color="gray" className="text-xs">
                              {config.outputs.length} outputs
                            </NotionTag>
                          </div>
                        </div>
                      </div>
                    </NotionCard>
                  </motion.div>
                );
              })}
            </div>
          </NotionModal>
        )}
      </AnimatePresence>

      {/* Task Configuration Panel */}
      <AnimatePresence>
        {showTaskPanel && selectedNode && (
          <TaskConfigPanel
            nodeId={selectedNode}
            nodes={nodes}
            onClose={() => {
              setShowTaskPanel(false);
              setSelectedNode(null);
            }}
            onSave={(nodeId, config) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === nodeId
                    ? { ...node, data: { ...node.data, settings: config } }
                    : node
                )
              );
              setShowTaskPanel(false);
              setSelectedNode(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Task Configuration Panel Component
interface TaskConfigPanelProps {
  nodeId: string;
  nodes: Node[];
  onClose: () => void;
  onSave: (nodeId: string, config: any) => void;
}

const TaskConfigPanel: React.FC<TaskConfigPanelProps> = ({
  nodeId,
  nodes,
  onClose,
  onSave
}) => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;

  const { config, settings } = node.data;
  const [formData, setFormData] = useState(settings || {});

  const handleSave = () => {
    onSave(nodeId, formData);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Configure Agent</h2>
            <p className="text-sm text-gray-600">{config.name}</p>
          </div>
          <NotionButton
            variant="ghost"
            onClick={onClose}
            icon={<X className="w-4 h-4" />}
          />
        </div>

        <div className="space-y-6">
          {/* Basic Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent Name
            </label>
            <NotionInput
              value={formData.name || config.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter agent name"
            />
          </div>

          {/* Input Configuration */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Task Inputs</h3>
            <div className="space-y-3">
              {config.inputs.map((input: any) => (
                <div key={input.id}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {input.name} {input.required && <span className="text-red-500">*</span>}
                  </label>
                  {input.type === 'text' ? (
                    <NotionInput
                      value={formData[input.id] || ''}
                      onChange={(e) => setFormData({ ...formData, [input.id]: e.target.value })}
                      placeholder={`Enter ${input.name.toLowerCase()}`}
                      className="text-sm"
                    />
                  ) : input.type === 'json' ? (
                    <textarea
                      value={formData[input.id] || '{}'}
                      onChange={(e) => setFormData({ ...formData, [input.id]: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      rows={3}
                      placeholder="Enter JSON data"
                    />
                  ) : (
                    <NotionInput
                      value={formData[input.id] || ''}
                      onChange={(e) => setFormData({ ...formData, [input.id]: e.target.value })}
                      placeholder={`Enter ${input.name.toLowerCase()}`}
                      className="text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Advanced Settings</h3>
            <div className="space-y-3">
              {config.settings.map((setting: any) => (
                <div key={setting.name}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {setting.name}
                  </label>
                  <p className="text-xs text-gray-500 mb-1">{setting.description}</p>
                  {setting.type === 'select' ? (
                    <select
                      value={formData[setting.name] || setting.defaultValue}
                      onChange={(e) => setFormData({ ...formData, [setting.name]: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    >
                      <option value={setting.defaultValue}>{setting.defaultValue}</option>
                    </select>
                  ) : setting.type === 'boolean' ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData[setting.name] || setting.defaultValue}
                        onChange={(e) => setFormData({ ...formData, [setting.name]: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Enable</span>
                    </label>
                  ) : (
                    <NotionInput
                      type={setting.type}
                      value={formData[setting.name] || setting.defaultValue}
                      onChange={(e) => setFormData({ ...formData, [setting.name]: e.target.value })}
                      className="text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
          <NotionButton variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </NotionButton>
          <NotionButton variant="primary" onClick={handleSave} className="flex-1">
            Save Configuration
          </NotionButton>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedWorkflowBuilder;