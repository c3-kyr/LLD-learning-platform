# Research Note: AI-Fluency LLD Practice Platform

## 1. The Learner Problem
Practicing Low-Level Design (LLD) presents a unique challenge: unlike algorithmic problems with clear pass/fail test cases, LLD is subjective. A learner can design a Parking Lot and still be unsure if their abstractions, relationships, and trade-offs are actually good. 

Furthermore, the industry is undergoing a massive shift. Top companies (like Google) are introducing "AI Fluency" rounds for SWE hiring. Candidates are expected to architect systems *collaboratively with AI*, evaluating trade-offs and pressure-testing edge cases in real-time. The core learner problem has evolved: **Learners not only lack a way to evaluate their LLD, but they also lack a safe environment to practice using AI as a design partner without falling victim to hallucinations.**

## 2. Existing Approaches & Tools
During my research, I evaluated a few existing methods learners use to practice LLD:
*   **Traditional Platforms (LeetCode, HackerRank):** Highly optimized for algorithmic coding. Any design questions are often rigid, lacking the nuanced evaluation required for true object-oriented design.
*   **Static Text Courses (Educative.io, etc.):** Great for reading about design patterns, but they offer zero interactive feedback loops for a learner's custom solution.
*   **Raw LLM Prompts (ChatGPT, Claude):** Many learners paste their design into an LLM and ask, "Is this good?" While helpful, the AI often acts overly agreeable, providing the "correct" answer rather than critically evaluating the learner's specific reasoning or checking if the learner actually understands the generated code.

## 3. Key Gaps
*   **Lack of Rationale Evaluation:** Existing tools evaluate the *final output* (the code or diagram) but completely ignore the *reasoning* behind the choices. 
*   **Ignoring AI Fluency:** No platform currently simulates the modern interview environment where a candidate must defend their AI-assisted design against scrutiny.

## 4. Product Direction & MVP
To address these gaps, this MVP will focus on a new paradigm: **The AI-Aware LLD Platform**. 

Instead of trying to prevent AI usage, the platform embraces it. We require a two-part submission from the learner:
1.  **The Design:** A text-based representation of classes, interfaces, and responsibilities.
2.  **The Rationale:** A brief explanation of *why* they chose this design, what trade-offs they considered, and how they validated any AI suggestions they used.

The platform's AI acts as a Senior Staff Engineer. It does not just grade the design; it **pressure-tests** the rationale to ensure the candidate hasn't blindly copied an AI hallucination. This directly targets the modern learner problem, providing a highly relevant, 2024/2025-ready practice loop while keeping the engineering scope narrow enough for a 2-day MVP.
