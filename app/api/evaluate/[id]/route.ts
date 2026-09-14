import { NextResponse } from 'next/server';
import { getSubmission, updateSubmissionStatus, saveEvaluation } from '@/lib/db';
import { SubmissionStateMachine, Evaluation } from '@/lib/domain/models';
import { AIEvaluator, EvaluationPipeline } from '@/lib/domain/evaluator';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const submission = getSubmission(id);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (!SubmissionStateMachine.canTransition(submission.status, 'Evaluating')) {
      return NextResponse.json({ error: 'Submission cannot be evaluated at this time.' }, { status: 400 });
    }

    // Update state to Evaluating
    updateSubmissionStatus(id, 'Evaluating');

    // Trigger AI Evaluation asynchronously
    // Note: In local dev, this promise runs in the background. 
    // In serverless environments, this might be terminated early unless wrapped in `waitUntil`.
    const pipeline = new EvaluationPipeline([new AIEvaluator()]);
    pipeline.evaluate(submission).then(result => {
      if (result.success && result.evaluation) {
        const evalRecord: Evaluation = {
          id: crypto.randomUUID(),
          submissionId: id,
          rubric: result.evaluation.rubric,
          overallScore: result.evaluation.overallScore,
          createdAt: Date.now()
        };
        saveEvaluation(evalRecord, id);
      } else {
        updateSubmissionStatus(id, 'Failed');
      }
    }).catch(e => {
      console.error("Evaluation failed:", e);
      updateSubmissionStatus(id, 'Failed');
    });

    return NextResponse.json({ success: true, status: 'Evaluating' }, { status: 202 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
