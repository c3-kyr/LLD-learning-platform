import { NextResponse } from 'next/server';
import { DeterministicEvaluator } from '@/lib/domain/evaluator';
import { createSubmission } from '@/lib/db';
import { Submission } from '@/lib/domain/models';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { problemId, userId, designContent, rationaleContent } = body;

    const submission: Submission = {
      id: crypto.randomUUID(),
      problemId,
      userId: userId || 'anonymous',
      designContent: designContent || '',
      rationaleContent: rationaleContent || '',
      status: 'Submitted',
      createdAt: Date.now()
    };

    const deterministic = new DeterministicEvaluator();
    const result = await deterministic.evaluate(submission);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    createSubmission(submission);

    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
