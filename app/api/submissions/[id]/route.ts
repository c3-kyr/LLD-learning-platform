import { NextResponse } from 'next/server';
import { getSubmission, getEvaluation } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const submission = getSubmission(id);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    let evaluation = null;
    if (submission.evaluationId) {
      evaluation = getEvaluation(submission.evaluationId);
    }

    return NextResponse.json({ submission, evaluation }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
