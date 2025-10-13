import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WorkflowService } from '@/lib/api/workflows';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflows = await WorkflowService.getUserWorkflows(session.user.id);
    const workflow = workflows.find(w => w.id === params.id);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, nodes, connections, settings, is_active, is_public } = data;

    const workflow = await WorkflowService.updateWorkflow(params.id, {
      name,
      description,
      nodes,
      connections,
      settings,
      is_active,
      is_public
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await WorkflowService.deleteWorkflow(params.id, session.user.id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}