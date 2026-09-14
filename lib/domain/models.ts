export interface Problem {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface User {
  id: string;
  name: string;
}

export type SubmissionStatus = 'Submitted' | 'Evaluating' | 'Completed' | 'Failed';

export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  designContent: string;
  rationaleContent: string;
  status: SubmissionStatus;
  createdAt: number;
  evaluationId?: string;
}

export interface EvaluationCriterion {
  score: number;
  evidence: string;
  concern?: string;
  suggestion?: string;
  confidence: number;
}

export interface Evaluation {
  id: string;
  submissionId: string;
  rubric: {
    requirementUnderstanding: EvaluationCriterion;
    classResponsibilities: EvaluationCriterion;
    solidPrinciples: EvaluationCriterion;
    rationaleQuality: EvaluationCriterion;
  };
  overallScore: number;
  createdAt: number;
}

export class SubmissionStateMachine {
  static canTransition(currentStatus: SubmissionStatus, nextStatus: SubmissionStatus): boolean {
    const transitions: Record<SubmissionStatus, SubmissionStatus[]> = {
      'Submitted': ['Evaluating', 'Failed'],
      'Evaluating': ['Completed', 'Failed'],
      'Completed': [],
      'Failed': ['Evaluating'] // allows retry
    };
    return transitions[currentStatus].includes(nextStatus);
  }
}
