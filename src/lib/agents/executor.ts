import {
  AgentExecutionContext,
  AgentInput,
  AgentOutput,
  ExecutableAgent,
  AgentExecutionResult,
  ExecutableWorkflow,
  WorkflowExecutionResult,
  WorkflowNode,
  WorkflowConnection
} from './types';
import { UserService } from '@/lib/api/users';
import { UsageService } from '@/lib/api/usage';
import { WorkflowService } from '@/lib/api/workflows';

export class AgentExecutor {
  private static instance: AgentExecutor;
  private mcpClients: Map<string, any> = new Map();

  static getInstance(): AgentExecutor {
    if (!AgentExecutor.instance) {
      AgentExecutor.instance = new AgentExecutor();
    }
    return AgentExecutor.instance;
  }

  async executeAgent(
    agent: ExecutableAgent,
    input: AgentInput,
    context: AgentExecutionContext
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const logs: string[] = [];
    let creditsUsed = 0;

    try {
      logs.push(`Starting execution of agent: ${agent.name} (${agent.type})`);

      // Check user credits
      const user = await UserService.getUser(context.userId);
      if (!user || user.credits_remaining < 1) {
        throw new Error('Insufficient credits');
      }

      // Execute based on agent type
      let output: AgentOutput;
      switch (agent.type) {
        case 'chat':
          output = await this.executeChatAgent(agent, input, context, logs);
          creditsUsed = 1;
          break;
        case 'research':
          output = await this.executeResearchAgent(agent, input, context, logs);
          creditsUsed = 3;
          break;
        case 'vision':
          output = await this.executeVisionAgent(agent, input, context, logs);
          creditsUsed = 2;
          break;
        case 'voice':
          output = await this.executeVoiceAgent(agent, input, context, logs);
          creditsUsed = 2;
          break;
        case 'workflow':
          output = await this.executeWorkflowAgent(agent, input, context, logs);
          creditsUsed = 5;
          break;
        default:
          output = await this.executeGenericAgent(agent, input, context, logs);
          creditsUsed = 1;
      }

      // Update user credits
      await UserService.updateCredits(context.userId, creditsUsed);

      // Record usage
      await UsageService.recordUsage({
        user_id: context.userId,
        organization_id: context.organizationId,
        resource_type: 'agent_execution',
        resource_id: agent.id,
        quantity: 1,
        credits_cost: creditsUsed,
        metadata: {
          agent_type: agent.type,
          workflow_id: context.workflowId,
          execution_id: context.executionId
        }
      });

      const duration = Date.now() - startTime;
      logs.push(`Agent execution completed in ${duration}ms`);

      return {
        success: true,
        output,
        duration,
        creditsUsed,
        logs
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logs.push(`Agent execution failed: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
        duration,
        creditsUsed,
        logs
      };
    }
  }

  async executeWorkflow(
    workflow: ExecutableWorkflow,
    context: AgentExecutionContext
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();
    const outputs: Record<string, AgentOutput> = {};
    const errors: Record<string, string> = {};
    const executionLog: string[] = [];
    let totalCreditsUsed = 0;

    try {
      executionLog.push(`Starting workflow execution: ${workflow.name}`);

      // Create execution graph
      const executionOrder = this.getExecutionOrder(workflow.nodes, workflow.connections);
      executionLog.push(`Execution order determined: ${executionOrder.length} nodes`);

      // Execute nodes in order
      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (!node) {
          errors[nodeId] = 'Node not found';
          continue;
        }

        try {
          // Get agent configuration
          const agent = await this.getAgentById(node.data.agentId);
          if (!agent) {
            errors[nodeId] = 'Agent not found';
            continue;
          }

          // Prepare input from previous nodes
          const input = this.prepareNodeInput(node, outputs, workflow.connections);

          // Execute agent
          const result = await this.executeAgent(agent, input, context);

          if (result.success && result.output) {
            outputs[nodeId] = result.output;
            totalCreditsUsed += result.creditsUsed;
            executionLog.push(`Node ${nodeId} completed successfully`);
          } else {
            errors[nodeId] = result.error || 'Execution failed';
            executionLog.push(`Node ${nodeId} failed: ${result.error}`);
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors[nodeId] = errorMessage;
          executionLog.push(`Node ${nodeId} error: ${errorMessage}`);
        }
      }

      const totalDuration = Date.now() - startTime;
      executionLog.push(`Workflow completed in ${totalDuration}ms`);

      // Update workflow execution record
      await WorkflowService.updateExecution(context.executionId, {
        status: Object.keys(errors).length > 0 ? 'completed' : 'failed',
        output_data: outputs,
        execution_log: executionLog,
        error_message: Object.keys(errors).length > 0 ? JSON.stringify(errors) : null,
        credits_used: totalCreditsUsed,
        duration_ms: totalDuration,
        completed_at: new Date().toISOString()
      });

      return {
        success: Object.keys(errors).length === 0,
        outputs,
        errors,
        totalDuration,
        totalCreditsUsed,
        executionLog
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const totalDuration = Date.now() - startTime;

      executionLog.push(`Workflow execution failed: ${errorMessage}`);

      return {
        success: false,
        outputs: {},
        errors: { workflow: errorMessage },
        totalDuration,
        totalCreditsUsed,
        executionLog
      };
    }
  }

  private async executeChatAgent(
    agent: ExecutableAgent,
    input: AgentInput,
    context: AgentExecutionContext,
    logs: string[]
  ): Promise<AgentOutput> {
    logs.push('Executing chat agent with AI model');

    // This would integrate with your existing AI chat service
    const response = await fetch('/api/clean-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input.data.message || 'Hello',
        historyLength: 0
      })
    });

    const result = await response.json();

    return {
      type: 'text',
      data: {
        message: result.response || 'No response generated',
        model: result.model
      },
      metadata: {
        tokens_used: result.tokens || 0,
        response_time: result.responseTime || 0
      }
    };
  }

  private async executeResearchAgent(
    agent: ExecutableAgent,
    input: AgentInput,
    context: AgentExecutionContext,
    logs: string[]
  ): Promise<AgentOutput> {
    logs.push('Executing research agent');

    // Simulate research execution - would integrate with MCP tools
    return {
      type: 'research_result',
      data: {
        query: input.data.query,
        results: [
          {
            title: 'Research Result 1',
            summary: 'This is a research finding...',
            sources: ['source1.com', 'source2.com']
          }
        ],
        confidence: 0.8
      },
      metadata: {
        sources_checked: 10,
        time_spent: 30
      }
    };
  }

  private async executeVisionAgent(
    agent: ExecutableAgent,
    input: AgentInput,
    context: AgentExecutionContext,
    logs: string[]
  ): Promise<AgentOutput> {
    logs.push('Executing vision agent');

    return {
      type: 'vision_analysis',
      data: {
        image_url: input.data.image_url,
        analysis: {
          objects: ['person', 'chair', 'table'],
          description: 'The image shows a person sitting at a table',
          confidence: 0.9
        }
      },
      metadata: {
        model: 'vision-v1',
        processing_time: 2.5
      }
    };
  }

  private async executeVoiceAgent(
    agent: ExecutableAgent,
    input: AgentInput,
    context: AgentExecutionContext,
    logs: string[]
  ): Promise<AgentOutput> {
    logs.push('Executing voice agent');

    return {
      type: 'voice_synthesis',
      data: {
        text: input.data.text,
        audio_url: '/api/voice/generated-audio.mp3',
        voice_id: agent.config.voice_id || 'default'
      },
      metadata: {
        duration: 10.5,
        voice_model: 'elevenlabs'
      }
    };
  }

  private async executeWorkflowAgent(
    agent: ExecutableAgent,
    input: AgentInput,
    context: AgentExecutionContext,
    logs: string[]
  ): Promise<AgentOutput> {
    logs.push('Executing workflow agent');

    return {
      type: 'workflow_result',
      data: {
        workflow_id: input.data.workflow_id,
        status: 'completed',
        results: {}
      }
    };
  }

  private async executeGenericAgent(
    agent: ExecutableAgent,
    input: AgentInput,
    context: AgentExecutionContext,
    logs: string[]
  ): Promise<AgentOutput> {
    logs.push('Executing generic agent');

    return {
      type: 'generic',
      data: {
        processed: true,
        input_received: input.data
      }
    };
  }

  private getExecutionOrder(nodes: WorkflowNode[], connections: WorkflowConnection[]): string[] {
    // Topological sort for workflow execution
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize graph
    for (const node of nodes) {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    // Build graph from connections
    for (const connection of connections) {
      const dependencies = graph.get(connection.source) || [];
      dependencies.push(connection.target);
      graph.set(connection.source, dependencies);
      inDegree.set(connection.target, (inDegree.get(connection.target) || 0) + 1);
    }

    // Topological sort
    const queue: string[] = [];
    const result: string[] = [];

    // Find nodes with no dependencies
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const dependents = graph.get(current) || [];
      for (const dependent of dependents) {
        const newDegree = (inDegree.get(dependent) || 0) - 1;
        inDegree.set(dependent, newDegree);
        if (newDegree === 0) {
          queue.push(dependent);
        }
      }
    }

    return result;
  }

  private prepareNodeInput(
    node: WorkflowNode,
    outputs: Record<string, AgentOutput>,
    connections: WorkflowConnection[]
  ): AgentInput {
    // Get input connections for this node
    const inputConnections = connections.filter(c => c.target === node.id);

    let inputData: any = node.data.inputs || {};

    // Merge outputs from connected nodes
    for (const connection of inputConnections) {
      const sourceOutput = outputs[connection.source];
      if (sourceOutput) {
        inputData = {
          ...inputData,
          [connection.targetHandle]: sourceOutput.data
        };
      }
    }

    return {
      type: 'workflow_input',
      data: inputData,
      metadata: {
        node_id: node.id,
        node_type: node.type
      }
    };
  }

  private async getAgentById(agentId: string): Promise<ExecutableAgent | null> {
    // This would fetch from your agent registry/database
    // For now, return a mock agent
    return {
      id: agentId,
      name: 'Test Agent',
      type: 'chat',
      version: '1.0.0',
      config: {},
      capabilities: [],
      integrations: []
    };
  }
}