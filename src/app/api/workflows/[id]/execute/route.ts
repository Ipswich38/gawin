import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WorkflowService } from '@/lib/api/workflows';
import { AgentExecutor } from '@/lib/agents/executor';
import { AgentExecutionContext } from '@/lib/agents/types';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inputData } = await request.json();

    // Get workflow
    const workflows = await WorkflowService.getUserWorkflows(session.user.id);
    const workflow = workflows.find(w => w.id === params.id);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Create execution record
    const execution = await WorkflowService.executeWorkflow({
      workflow_id: params.id,
      user_id: session.user.id,
      status: 'pending',
      input_data: inputData || {},
      output_data: {},
      execution_log: [],
      credits_used: 0
    });

    if (!execution) {
      return NextResponse.json({ error: 'Failed to create execution' }, { status: 500 });
    }

    // Start execution asynchronously
    const context: AgentExecutionContext = {
      userId: session.user.id,
      workflowId: params.id,
      executionId: execution.id,
      organizationId: workflow.organization_id || undefined,
      credits: session.user.credits_remaining || 0
    };

    const executor = AgentExecutor.getInstance();

    // Execute workflow in background
    executor.executeWorkflow({
      id: workflow.id,
      name: workflow.name,
      nodes: Array.isArray(workflow.nodes) ? workflow.nodes : [],
      connections: Array.isArray(workflow.connections) ? workflow.connections : [],
      settings: workflow.settings || {}
    }, context).catch(error => {
      console.error('Workflow execution error:', error);
      // Update execution with error
      WorkflowService.updateExecution(execution.id, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      });
    });

    return NextResponse.json({
      executionId: execution.id,
      status: 'started',
      message: 'Workflow execution started'
    });

  } catch (error) {
    console.error('Error starting workflow execution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}