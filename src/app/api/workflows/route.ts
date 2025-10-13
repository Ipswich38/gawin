import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WorkflowService } from '@/lib/api/workflows';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'user';

    let workflows;
    if (type === 'public') {
      workflows = await WorkflowService.getPublicWorkflows(20);
    } else {
      workflows = await WorkflowService.getUserWorkflows(session.user.id);
    }

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, nodes, connections, settings } = data;

    if (!name || !nodes || !connections) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const workflow = await WorkflowService.createWorkflow({
      name,
      description: description || '',
      owner_id: session.user.id,
      nodes: nodes,
      connections: connections,
      settings: settings || {},
      is_active: false,
      is_public: false,
      is_template: false,
      tags: data.tags || []
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}