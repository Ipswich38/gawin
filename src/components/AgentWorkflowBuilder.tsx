'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Play,
  Pause,
  Save,
  Settings,
  Trash2,
  Copy,
  Zap,
  Brain,
  Search,
  MessageSquare,
  Eye,
  Mic,
  Database,
  Globe,
  Code,
  Image,
  FileText,
  BarChart3,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';
import { NotionCard, NotionButton, NotionInput, NotionModal, NotionTag, NotionToolbar } from './ui/NotionUI';

// Agent types and definitions
interface AgentNode {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  position: { x: number; y: number };
  inputs: ConnectionPoint[];
  outputs: ConnectionPoint[];
  config: Record<string, any>;
  status: 'idle' | 'running' | 'success' | 'error' | 'disabled';
  color: string;
}

interface ConnectionPoint {
  id: string;
  name: string;
  type: 'data' | 'trigger' | 'control';
  required?: boolean;
}

interface Connection {
  id: string;
  fromNode: string;
  fromOutput: string;
  toNode: string;
  toInput: string;
  data?: any;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: AgentNode[];
  connections: Connection[];
  isActive: boolean;
  lastRun?: Date;
}

type AgentType =
  | 'chat'
  | 'research'
  | 'vision'
  | 'voice'
  | 'data'
  | 'api'
  | 'code'
  | 'image'
  | 'text'
  | 'analytics'
  | 'security'
  | 'scheduler'
  | 'trigger';

// Pre-defined agent templates
const AGENT_TEMPLATES: Record<AgentType, Omit<AgentNode, 'id' | 'position'>> = {
  chat: {
    type: 'chat',
    name: 'AI Chat Agent',
    description: 'Intelligent conversation and Q&A capabilities',
    icon: MessageSquare,
    inputs: [
      { id: 'message', name: 'Message', type: 'data', required: true },
      { id: 'context', name: 'Context', type: 'data' }
    ],
    outputs: [
      { id: 'response', name: 'Response', type: 'data' },
      { id: 'complete', name: 'Complete', type: 'trigger' }
    ],
    config: { model: 'llama-3.3-70b-versatile', temperature: 0.7 },
    status: 'idle',
    color: 'blue'
  },
  research: {
    type: 'research',
    name: 'Research Agent',
    description: 'Web search and information gathering',
    icon: Search,
    inputs: [
      { id: 'query', name: 'Search Query', type: 'data', required: true },
      { id: 'depth', name: 'Depth Level', type: 'data' }
    ],
    outputs: [
      { id: 'results', name: 'Results', type: 'data' },
      { id: 'summary', name: 'Summary', type: 'data' },
      { id: 'complete', name: 'Complete', type: 'trigger' }
    ],
    config: { sources: ['web', 'academic', 'news'], maxResults: 10 },
    status: 'idle',
    color: 'green'
  },
  vision: {
    type: 'vision',
    name: 'Vision Agent',
    description: 'Image analysis and computer vision',
    icon: Eye,
    inputs: [
      { id: 'image', name: 'Image', type: 'data', required: true },
      { id: 'prompt', name: 'Analysis Prompt', type: 'data' }
    ],
    outputs: [
      { id: 'analysis', name: 'Analysis', type: 'data' },
      { id: 'objects', name: 'Objects Found', type: 'data' },
      { id: 'complete', name: 'Complete', type: 'trigger' }
    ],
    config: { model: 'gpt-4-vision', confidence: 0.8 },
    status: 'idle',
    color: 'purple'
  },
  voice: {
    type: 'voice',
    name: 'Voice Agent',
    description: 'Speech recognition and synthesis',
    icon: Mic,
    inputs: [
      { id: 'audio', name: 'Audio Input', type: 'data' },
      { id: 'text', name: 'Text to Speak', type: 'data' }
    ],
    outputs: [
      { id: 'transcript', name: 'Transcript', type: 'data' },
      { id: 'audio', name: 'Audio Output', type: 'data' },
      { id: 'complete', name: 'Complete', type: 'trigger' }
    ],
    config: { voice: 'eleven_labs', language: 'en' },
    status: 'idle',
    color: 'orange'
  },
  data: {
    type: 'data',
    name: 'Data Agent',
    description: 'Data processing and transformation',
    icon: Database,
    inputs: [
      { id: 'data', name: 'Input Data', type: 'data', required: true },
      { id: 'transform', name: 'Transform Rules', type: 'data' }
    ],
    outputs: [
      { id: 'output', name: 'Processed Data', type: 'data' },
      { id: 'complete', name: 'Complete', type: 'trigger' }
    ],
    config: { format: 'json', validate: true },
    status: 'idle',
    color: 'cyan'
  },
  api: {
    type: 'api',
    name: 'API Agent',
    description: 'External API calls and integrations',
    icon: Globe,
    inputs: [
      { id: 'endpoint', name: 'API Endpoint', type: 'data', required: true },
      { id: 'payload', name: 'Payload', type: 'data' }
    ],
    outputs: [
      { id: 'response', name: 'API Response', type: 'data' },
      { id: 'error', name: 'Error', type: 'data' },
      { id: 'complete', name: 'Complete', type: 'trigger' }
    ],
    config: { method: 'GET', timeout: 30000 },
    status: 'idle',
    color: 'indigo'
  },
  code: {
    type: 'code',
    name: 'Code Agent',
    description: 'Code generation and execution',
    icon: Code,
    inputs: [
      { id: 'prompt', name: 'Code Prompt', type: 'data', required: true },
      { id: 'language', name: 'Language', type: 'data' }
    ],
    outputs: [
      { id: 'code', name: 'Generated Code', type: 'data' },
      { id: 'result', name: 'Execution Result', type: 'data' },
      { id: 'complete', name: 'Complete', type: 'trigger' }
    ],
    config: { language: 'javascript', execute: false },
    status: 'idle',
    color: 'red'
  },
  image: {
    type: 'image',
    name: 'Image Agent',
    description: 'Image generation and editing',
    icon: Image,
    inputs: [
      { id: 'prompt', name: 'Image Prompt', type: 'data', required: true },
      { id: 'style', name: 'Style', type: 'data' }
    ],
    outputs: [
      { id: 'image', name: 'Generated Image', type: 'data' },
      { id: 'complete', name: 'Complete', type: 'trigger' }
    ],
    config: { model: 'dall-e-3', size: '1024x1024' },
    status: 'idle',
    color: 'pink'
  },
  text: {
    type: 'text',
    name: 'Text Agent',
    description: 'Text processing and analysis',
    icon: FileText,
    inputs: [
      { id: 'text', name: 'Input Text', type: 'data', required: true },
      { id: 'operation', name: 'Operation', type: 'data' }
    ],
    outputs: [
      { id: 'result', name: 'Processed Text', type: 'data' },
      { id: 'metrics', name: 'Text Metrics', type: 'data' },
      { id: 'complete', name: 'Complete', type: 'trigger' }
    ],
    config: { operation: 'summarize', language: 'auto' },
    status: 'idle',
    color: 'gray'
  },
  analytics: {
    type: 'analytics',
    name: 'Analytics Agent',
    description: 'Data analysis and insights',
    icon: BarChart3,
    inputs: [
      { id: 'data', name: 'Data Set', type: 'data', required: true },
      { id: 'query', name: 'Analysis Query', type: 'data' }
    ],
    outputs: [
      { id: 'insights', name: 'Insights', type: 'data' },
      { id: 'charts', name: 'Charts', type: 'data' },
      { id: 'complete', name: 'Complete', type: 'trigger' }
    ],
    config: { chartType: 'auto', includeML: true },
    status: 'idle',
    color: 'emerald'
  },
  security: {
    type: 'security',
    name: 'Security Agent',
    description: 'Security scanning and validation',
    icon: Shield,
    inputs: [
      { id: 'input', name: 'Input to Check', type: 'data', required: true },
      { id: 'rules', name: 'Security Rules', type: 'data' }
    ],
    outputs: [
      { id: 'result', name: 'Security Result', type: 'data' },
      { id: 'alerts', name: 'Security Alerts', type: 'data' },
      { id: 'complete', name: 'Complete', type: 'trigger' }
    ],
    config: { scanLevel: 'standard', blockMalicious: true },
    status: 'idle',
    color: 'yellow'
  },
  scheduler: {
    type: 'scheduler',
    name: 'Scheduler Agent',
    description: 'Time-based triggers and delays',
    icon: Clock,
    inputs: [
      { id: 'schedule', name: 'Schedule', type: 'data', required: true }
    ],
    outputs: [
      { id: 'trigger', name: 'Scheduled Trigger', type: 'trigger' }
    ],
    config: { type: 'interval', interval: '1h' },
    status: 'idle',
    color: 'slate'
  },
  trigger: {
    type: 'trigger',
    name: 'Manual Trigger',
    description: 'Manual workflow trigger point',
    icon: Zap,
    inputs: [],
    outputs: [
      { id: 'start', name: 'Start', type: 'trigger' },
      { id: 'data', name: 'Initial Data', type: 'data' }
    ],
    config: { autoStart: false },
    status: 'idle',
    color: 'amber'
  }
};

const AgentWorkflowBuilder: React.FC = () => {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'default',
    name: 'New Workflow',
    description: 'Drag agents from the sidebar to build your workflow',
    nodes: [],
    connections: [],
    isActive: false
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showAgentPalette, setShowAgentPalette] = useState(false);
  const [draggedAgent, setDraggedAgent] = useState<AgentType | null>(null);
  const [connectionMode, setConnectionMode] = useState<{
    active: boolean;
    fromNode?: string;
    fromOutput?: string;
  }>({ active: false });

  const canvasRef = useRef<HTMLDivElement>(null);

  const addAgent = useCallback((type: AgentType, position: { x: number; y: number }) => {
    const template = AGENT_TEMPLATES[type];
    const newNode: AgentNode = {
      ...template,
      id: `${type}-${Date.now()}`,
      position
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedAgent || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    addAgent(draggedAgent, position);
    setDraggedAgent(null);
  }, [draggedAgent, addAgent]);

  const runWorkflow = useCallback(async () => {
    setIsRunning(true);

    // Simulate workflow execution
    for (const node of workflow.nodes) {
      setWorkflow(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === node.id ? { ...n, status: 'running' } : n
        )
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));

      setWorkflow(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === node.id ? { ...n, status: 'success' } : n
        )
      }));
    }

    setIsRunning(false);
    setWorkflow(prev => ({ ...prev, lastRun: new Date() }));
  }, [workflow.nodes]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <NotionToolbar sticky>
        <div className="flex-1 flex items-center gap-4">
          <NotionInput
            value={workflow.name}
            onChange={(name) => setWorkflow(prev => ({ ...prev, name }))}
            placeholder="Workflow name"
            className="font-semibold text-lg border-none bg-transparent hover:bg-gray-100 focus:bg-white"
          />
          <NotionTag color="gray">{workflow.nodes.length} agents</NotionTag>
          <NotionTag color="blue">{workflow.connections.length} connections</NotionTag>
        </div>

        <div className="flex items-center gap-2">
          <NotionButton
            variant="ghost"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAgentPalette(true)}
          >
            Add Agent
          </NotionButton>

          <NotionButton
            variant={isRunning ? "danger" : "primary"}
            icon={isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            onClick={isRunning ? () => setIsRunning(false) : runWorkflow}
            disabled={workflow.nodes.length === 0}
          >
            {isRunning ? 'Stop' : 'Run'}
          </NotionButton>

          <NotionButton
            variant="secondary"
            icon={<Save className="w-4 h-4" />}
          >
            Save
          </NotionButton>
        </div>
      </NotionToolbar>

      <div className="flex-1 flex">
        {/* Agent Palette Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Available Agents</h3>
            <div className="space-y-2">
              {Object.entries(AGENT_TEMPLATES).map(([type, template]) => (
                <motion.div
                  key={type}
                  draggable
                  onDragStart={() => setDraggedAgent(type as AgentType)}
                  onDragEnd={() => setDraggedAgent(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <NotionCard
                    padding="sm"
                    className="cursor-grab active:cursor-grabbing hover:border-gray-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${template.color}-100 flex items-center justify-center`}>
                        <template.icon className={`w-5 h-5 text-${template.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{template.name}</h4>
                        <p className="text-sm text-gray-600 truncate">{template.description}</p>
                      </div>
                    </div>
                  </NotionCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto bg-gray-50"
          onDrop={handleCanvasDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {/* Workflow Nodes */}
          {workflow.nodes.map((node) => (
            <motion.div
              key={node.id}
              drag
              dragMomentum={false}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                position: 'absolute',
                left: node.position.x,
                top: node.position.y
              }}
              onDragEnd={(_, info) => {
                setWorkflow(prev => ({
                  ...prev,
                  nodes: prev.nodes.map(n =>
                    n.id === node.id
                      ? {
                          ...n,
                          position: {
                            x: node.position.x + info.offset.x,
                            y: node.position.y + info.offset.y
                          }
                        }
                      : n
                  )
                }));
              }}
            >
              <NotionCard
                className={`
                  w-64 cursor-move border-2
                  ${selectedNode === node.id ? 'border-gray-900' : 'border-gray-200'}
                  ${node.status === 'running' ? 'animate-pulse' : ''}
                  ${node.status === 'success' ? 'border-green-500' : ''}
                  ${node.status === 'error' ? 'border-red-500' : ''}
                `}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                hover={false}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-${node.color}-100 flex items-center justify-center`}>
                    <node.icon className={`w-5 h-5 text-${node.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{node.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{node.status}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Settings className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWorkflow(prev => ({
                          ...prev,
                          nodes: prev.nodes.filter(n => n.id !== node.id),
                          connections: prev.connections.filter(c =>
                            c.fromNode !== node.id && c.toNode !== node.id
                          )
                        }));
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Connection Points */}
                <div className="space-y-2">
                  {node.inputs.map((input) => (
                    <div key={input.id} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                      <span className="text-gray-700">{input.name}</span>
                      {input.required && <span className="text-red-500">*</span>}
                    </div>
                  ))}

                  {node.outputs.map((output) => (
                    <div key={output.id} className="flex items-center justify-end gap-2 text-sm">
                      <span className="text-gray-700">{output.name}</span>
                      <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                    </div>
                  ))}
                </div>
              </NotionCard>
            </motion.div>
          ))}

          {/* Empty State */}
          {workflow.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building Your Workflow</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Drag agents from the sidebar to create your AI automation workflow.
                  Connect them with lines to define how data flows between agents.
                </p>
                <NotionButton
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowAgentPalette(true)}
                >
                  Add Your First Agent
                </NotionButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Palette Modal */}
      <NotionModal
        isOpen={showAgentPalette}
        onClose={() => setShowAgentPalette(false)}
        title="Choose an Agent"
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(AGENT_TEMPLATES).map(([type, template]) => (
            <NotionCard
              key={type}
              className="cursor-pointer hover:border-gray-400"
              onClick={() => {
                addAgent(type as AgentType, { x: 400, y: 200 });
                setShowAgentPalette(false);
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-lg bg-${template.color}-100 flex items-center justify-center`}>
                  <template.icon className={`w-6 h-6 text-${template.color}-600`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <NotionTag color="gray" className="text-xs">
                  {template.inputs.length} inputs
                </NotionTag>
                <NotionTag color="gray" className="text-xs">
                  {template.outputs.length} outputs
                </NotionTag>
              </div>
            </NotionCard>
          ))}
        </div>
      </NotionModal>
    </div>
  );
};

export default AgentWorkflowBuilder;