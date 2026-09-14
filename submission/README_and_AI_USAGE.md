# LLD Practice Platform

## How to Run the Project
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open `http://localhost:3000` in your browser.
*(Note: The prototype uses a local SQLite database, `lld-practice.db`, which is created and seeded automatically).*

## Key Decisions
- **Next.js App Router**: Chosen for its simplified server/client boundaries and file-based routing.
- **SQLite (better-sqlite3)**: Used for robust, local persistence without requiring external database hosting.
- **Evaluation Pipeline**: Implemented using the Composite Pattern (`EvaluationPipeline`) to allow seamless chaining of deterministic validation checks and LLM-based judgments.
- **Client-Side Polling**: Used for the feedback UI to handle the asynchronous nature of LLM evaluations gracefully, avoiding blocked threads.
- **Tasteful Dark Theme**: Focused on a developer-centric aesthetic with clear spacing and minimal transitions, keeping the UI fast and functional without over-engineering.

## Limitations
- **Mock User Authentication**: The application currently hardcodes the user session for MVP simplicity.
- **Local Database**: The `better-sqlite3` database works perfectly for local development but would need to be migrated to PostgreSQL or similar for serverless/edge deployments.
- **Background Jobs**: The AI evaluation runs asynchronously in Node. If deployed to serverless platforms (like Vercel), this would need to be refactored to use a proper background job queue (e.g., Inngest, Upstash) to avoid function timeouts.

---

# AI Usage Report

## How AI Was Used
Throughout the development of this prototype, AI was heavily utilized as a pair-programming partner:
- **Ideation & Research**: Used to brainstorm the core learner problems and validate the product direction (shifting from generic LLM prompts to structured rationale pressure-testing).
- **Architecture & Domain Modeling**: AI assisted in defining the `SubmissionStateMachine` and the `Evaluator` interfaces, ensuring SOLID principles were followed.
- **Code Generation**: Scaffolding the Next.js API routes, Database schema, and the React UI components.
- **Refactoring & Polish**: Refining the CSS for a premium dark theme and rapidly debugging React Server/Client boundary issues.
- **Troubleshooting**: Assisting with dependency conflicts (e.g., Vite/Vitest peer dependency resolutions).

Overall, AI acted as a force multiplier, allowing the transition from raw research notes to a fully functional, tested, and styled prototype in a fraction of the traditional time.
