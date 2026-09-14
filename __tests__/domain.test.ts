import { describe, it, expect } from 'vitest';
import { SubmissionStateMachine, Submission } from '../lib/domain/models';
import { DeterministicEvaluator, EvaluatorResult } from '../lib/domain/evaluator';

describe('Domain State Transitions', () => {
  it('should allow transition from Submitted to Evaluating', () => {
    expect(SubmissionStateMachine.canTransition('Submitted', 'Evaluating')).toBe(true);
  });

  it('should allow transition from Submitted to Failed', () => {
    expect(SubmissionStateMachine.canTransition('Submitted', 'Failed')).toBe(true);
  });

  it('should NOT allow transition from Completed to Evaluating (idempotency/guard)', () => {
    expect(SubmissionStateMachine.canTransition('Completed', 'Evaluating')).toBe(false);
  });

  it('should NOT allow transition from Evaluating to Submitted', () => {
    expect(SubmissionStateMachine.canTransition('Evaluating', 'Submitted')).toBe(false);
  });

  it('should allow retry from Failed to Evaluating', () => {
    expect(SubmissionStateMachine.canTransition('Failed', 'Evaluating')).toBe(true);
  });
});

describe('Evaluator Unit Tests', () => {
  const evaluator = new DeterministicEvaluator();

  it('should reject missing design fields', async () => {
    const sub: Partial<Submission> = {
      designContent: '',
      rationaleContent: 'This is a rationale with enough words to pass.'
    };
    const res = await evaluator.evaluate(sub as Submission);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Design content is required');
  });

  it('should reject missing rationale fields', async () => {
    const sub: Partial<Submission> = {
      designContent: 'This is a design content with enough words to pass.',
      rationaleContent: ''
    };
    const res = await evaluator.evaluate(sub as Submission);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Rationale content is required');
  });

  it('should reject content that is too short', async () => {
    const sub: Partial<Submission> = {
      designContent: 'short',
      rationaleContent: 'short'
    };
    const res = await evaluator.evaluate(sub as Submission);
    expect(res.success).toBe(false);
    expect(res.error).toContain('too short');
  });

  it('should pass valid content', async () => {
    const sub: Partial<Submission> = {
      designContent: 'This is a fully fledged design content that exceeds the twenty character limit comfortably.',
      rationaleContent: 'This rationale is also definitely long enough to pass the deterministic validator successfully.'
    };
    const res = await evaluator.evaluate(sub as Submission);
    expect(res.success).toBe(true);
  });
});
