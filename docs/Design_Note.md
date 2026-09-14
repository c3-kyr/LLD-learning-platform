# Design Note: AI-Fluency LLD Practice Platform

## 1. MVP Scope and User Flow
The MVP focuses strictly on the core practice loop, avoiding complex HLD infrastructure (like microservices or heavy databases) to prioritize domain design and rapid prototyping.

**User Flow:**
1.  **Choose:** Learner selects an LLD problem (e.g., "Design a Vending Machine").
2.  **Practice:** Learner designs the system, utilizing external AI tools (ChatGPT, etc.) if they choose.
3.  **Submit:** Learner submits two text fields: 
    *   `Design Content`: The classes, interfaces, and responsibilities.
    *   `Rationale Content`: Why they chose this design and trade-offs considered.
4.  **Evaluate:** The system asynchronously processes the submission.
5.  **Review:** Learner receives structured feedback that evaluates the design and pressure-tests their rationale.

## 2. Core Domain Design (Classes & Responsibilities)
The core domain is modeled to be extensible and clearly separate concerns.

*   `Problem`: Owns the problem statement, requirements, and constraints.
*   `User`: Represents the learner.
*   `Attempt`: Groups a sequence of submissions for a specific `Problem` by a `User`, allowing the platform to track improvement history over time.
*   `Submission`: Owns the learner's actual input (`designContent`, `rationaleContent`), the timestamp, and its evaluation `Status` (Pending, Evaluating, Completed, Failed).
*   `Evaluation`: Owns the result of a graded submission. It contains structured rubric scores, specific concerns, and AI-generated pressure-test questions based on the learner's rationale.
*   `Evaluator` (Interface): An abstraction for how a submission is graded.
    *   `EvaluationPipeline`: A composite evaluator that runs a chain of registered evaluators and merges their results. This makes adding new evaluators additive rather than a rewrite.
    *   `DeterministicEvaluator`: Checks for required fields, minimum word counts, and handles idempotency.
    *   `AIEvaluator`: Calls the LLM with a strict rubric prompt to analyze responsibilities, coupling, and reasoning quality.

## 3. Evaluation Approach
We separate deterministic checks from judgment-heavy checks to optimize cost and performance.
*   **Deterministic:** Before hitting the LLM, the system validates that both the Design and Rationale are provided.
*   **AI-Assisted (Judgment):** We use a structured prompt (e.g., JSON schema output) to force the LLM to grade against a fixed rubric: *Requirement Understanding, Class Responsibilities, SOLID principles, and Rationale Quality*. The output shape strictly follows: `criterion → score → evidence → concern → suggestion → confidence`. Grounding feedback in `evidence` from the submission prevents "random AI scores" and specifically pressure-tests the learner's rationale.

## 4. Key Trade-offs
*   **Text over Diagram/Code:** We chose plain text for the submission format. While diagrams or executable code provide more concrete evidence, text is the smallest format that proves understanding of *requirements, assumptions, classes, and responsibilities* without requiring a massive engineering effort to build a web-based IDE or UML parser in a 2-day MVP.
*   **Stateful Submissions over Synchronous Blocking:** LLM calls can be slow or fail. Instead of blocking the main thread and risking a timeout, we store the `Submission` immediately with a `Pending` state. The evaluation happens, updating the state to `Completed` or `Failed`. This prevents data loss on evaluator failure and allows the learner to leave the page safely.

## 5. Change Test Answers
*   **Change Test A (Adding Class Diagrams):** The `Submission` entity handles `designContent`. Supporting diagrams only requires adding a `diagramData` field to the `Submission` and exposing it to the `EvaluationPipeline`. The core domain practice flow remains unchanged.
*   **Change Test B (Adding Rule-Based/Human Review):** Because we use an `EvaluationPipeline` (Composite pattern), adding a new rule-based evaluator is as simple as creating a class that implements the `Evaluator` interface and appending it to the pipeline. The API routes and practice flow require zero rewrites.
