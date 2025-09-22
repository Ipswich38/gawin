/**
 * Gawin AI Agent - Main Export Module
 * Provides a unified interface to the autonomous agent system
 */

import GawinAgent from './gawinAgent';
import { ServiceIntegrator, createServiceIntegrator } from './integration/serviceIntegrator';
import { PlanningEngine } from './planning/planningEngine';
import { ToolOrchestrator } from './tools/toolOrchestrator';
import { GoalManager } from './goals/goalManager';
import { ReflectionEngine } from './reflection/reflectionEngine';

// Core types
export * from './types';

// Core agent
export { GawinAgent };
export default GawinAgent;

// Component exports
export { ServiceIntegrator, createServiceIntegrator };
export { PlanningEngine };
export { ToolOrchestrator };
export { GoalManager };
export { ReflectionEngine };

// Agent instance creation helper
export const createGawinAgent = (initialContext: any): GawinAgent => {
  return new GawinAgent(initialContext);
};

// Agent system status checker
export const getAgentSystemStatus = () => {
  return {
    version: '1.0.0',
    features: [
      'autonomous_planning',
      'intelligent_tool_orchestration',
      'persistent_goal_management',
      'self_reflection_learning',
      'service_integration',
      'cultural_adaptation',
      'voice_interaction_enhancement'
    ],
    capabilities: [
      'natural_conversation',
      'multimodal_perception',
      'web_research',
      'document_analysis',
      'voice_synthesis',
      'speech_recognition',
      'cultural_adaptation',
      'emotional_intelligence',
      'memory_management',
      'learning_adaptation',
      'tool_orchestration',
      'goal_planning',
      'self_reflection'
    ],
    status: 'ready'
  };
};