import { GoogleGenAI, Type, Schema } from '@google/genai';
import { Submission, EvaluatorResult } from './models';

// We update models.ts to include EvaluatorResult, or just define it here.
export interface EvaluatorResult {
  success: boolean;
  evaluation?: {
    rubric: {
      requirementUnderstanding: any;
      classResponsibilities: any;
      solidPrinciples: any;
      rationaleQuality: any;
    };
    overallScore: number;
  };
  error?: string;
}

export interface Evaluator {
  evaluate(submission: Submission): Promise<EvaluatorResult>;
}

export class DeterministicEvaluator implements Evaluator {
  async evaluate(submission: Submission): Promise<EvaluatorResult> {
    if (!submission.designContent || submission.designContent.trim().length === 0) {
      return { success: false, error: 'Design content is required.' };
    }
    if (!submission.rationaleContent || submission.rationaleContent.trim().length === 0) {
      return { success: false, error: 'Rationale content is required.' };
    }
    if (submission.designContent.trim().length < 20 || submission.rationaleContent.trim().length < 20) {
      return { success: false, error: 'Content is too short to be evaluated.' };
    }
    return { success: true };
  }
}

export class AIEvaluator implements Evaluator {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: 'AIzaSyCiqX755UDrYWeWbEoJUvPNhhArtdUxSj8' });
  }

  async evaluate(submission: Submission): Promise<EvaluatorResult> {
    const prompt = `
You are an expert Senior Software Engineer evaluating a candidate's Low-Level Design (LLD).
Evaluate the following submission based on the strict rubric.

Design Content:
${submission.designContent}

Rationale Content:
${submission.rationaleContent}

Provide an evaluation for:
1. requirementUnderstanding (Did they solve the problem?)
2. classResponsibilities (Are the classes cohesive and well-defined?)
3. solidPrinciples (Does it follow SOLID principles?)
4. rationaleQuality (Does their rationale justify their decisions?)

For each criterion, provide:
- score (1-5)
- evidence (Quotes or specific references to their design/rationale)
- concern (What is wrong? Optional if perfect)
- suggestion (How to fix it? Optional if perfect)
- confidence (1-5)
`;

    const criterionSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "Score from 1 to 5" },
        evidence: { type: Type.STRING, description: "Quotes or specific references to their design/rationale" },
        concern: { type: Type.STRING, description: "What is wrong? Leave empty if perfect" },
        suggestion: { type: Type.STRING, description: "How to fix it? Leave empty if perfect" },
        confidence: { type: Type.INTEGER, description: "Confidence in this score from 1 to 5" }
      },
      required: ["score", "evidence", "confidence"]
    };

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        rubric: {
          type: Type.OBJECT,
          properties: {
            requirementUnderstanding: criterionSchema,
            classResponsibilities: criterionSchema,
            solidPrinciples: criterionSchema,
            rationaleQuality: criterionSchema
          },
          required: ["requirementUnderstanding", "classResponsibilities", "solidPrinciples", "rationaleQuality"]
        }
      },
      required: ["rubric"]
    };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.2
        }
      });

      if (!response.text) {
        return { success: false, error: 'Empty response from AI.' };
      }

      const data = JSON.parse(response.text);
      
      const scores = [
        data.rubric.requirementUnderstanding.score,
        data.rubric.classResponsibilities.score,
        data.rubric.solidPrinciples.score,
        data.rubric.rationaleQuality.score
      ];
      const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      return {
        success: true,
        evaluation: {
          rubric: data.rubric,
          overallScore
        }
      };
    } catch (e: any) {
      return { success: false, error: 'AI Evaluation failed: ' + e.message };
    }
  }
}

export class EvaluationPipeline implements Evaluator {
  private evaluators: Evaluator[];

  constructor(evaluators: Evaluator[]) {
    this.evaluators = evaluators;
  }

  async evaluate(submission: Submission): Promise<EvaluatorResult> {
    let finalEvaluation: any = undefined;

    for (const evaluator of this.evaluators) {
      const result = await evaluator.evaluate(submission);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      
      if (result.evaluation) {
        finalEvaluation = { ...finalEvaluation, ...result.evaluation };
      }
    }

    // If pipeline finishes and we have an evaluation, return it.
    // If we only ran deterministic, finalEvaluation might be undefined, which is fine, 
    // it just means it passed the deterministic checks.
    return { success: true, evaluation: finalEvaluation };
  }
}
