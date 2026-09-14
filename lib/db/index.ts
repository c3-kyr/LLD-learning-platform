import Database from 'better-sqlite3';
import { Problem, Submission, Evaluation, SubmissionStatus } from '../domain/models';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lld-practice.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS problems (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    requirements TEXT,
    difficulty TEXT,
    tags TEXT
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    problemId TEXT,
    userId TEXT,
    designContent TEXT,
    rationaleContent TEXT,
    status TEXT,
    createdAt INTEGER,
    evaluationId TEXT
  );

  CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY,
    submissionId TEXT,
    rubric TEXT,
    overallScore REAL,
    createdAt INTEGER
  );
`);

// Insert mock problems if not exists
const problemCount = db.prepare('SELECT count(*) as count FROM problems').get() as { count: number };
if (problemCount.count === 0) {
  const insertProblem = db.prepare(`
    INSERT INTO problems (id, title, description, requirements, difficulty, tags) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertProblem.run(
    'p1',
    'Design a Vending Machine',
    'Design a Vending Machine that accepts multiple coins/notes, dispenses items, and returns change. It should handle different states (Idle, HasMoney, Dispensing, etc).',
    JSON.stringify(['Accept multiple coin types', 'Track inventory', 'Return exact change', 'Handle concurrent requests']),
    'Easy',
    JSON.stringify(['State Pattern', 'Concurrency'])
  );

  insertProblem.run(
    'p2',
    'Design a Parking Lot',
    'Design a system to manage a multi-floor parking lot. It should track available spots, assign vehicles to appropriate spot sizes, and calculate fees based on duration.',
    JSON.stringify(['Support 3 vehicle types (Motorcycle, Car, Bus)', 'Assign nearest available spot dynamically', 'Calculate fee upon exit (hourly rate varies by vehicle)', 'Handle multiple entry/exit gates concurrently']),
    'Medium',
    JSON.stringify(['System Design', 'Object-Oriented'])
  );

  insertProblem.run(
    'p3',
    'Design a Rate Limiter',
    'Design a highly available rate limiter for an API. It needs to enforce limits per user based on a specific algorithm.',
    JSON.stringify(['Implement Token Bucket or Leaky Bucket algorithm', 'Share state across multiple servers (e.g., using Redis)', 'Handle edge cases like race conditions', 'Allow configurable limits per user tier']),
    'Hard',
    JSON.stringify(['Distributed Systems', 'Algorithms'])
  );

  insertProblem.run(
    'p4',
    'Design Tic-Tac-Toe',
    'Design a classic 3x3 Tic-Tac-Toe game that two players can play. The system should correctly identify a winner or a draw.',
    JSON.stringify(['Represent the 3x3 board state', 'Validate if a move is legal (within bounds, cell empty)', 'Detect win condition (row, column, diagonal) efficiently', 'Detect draw condition']),
    'Easy',
    JSON.stringify(['Game Logic', '2D Arrays'])
  );
}

export function getProblems(): Problem[] {
  const rows = db.prepare('SELECT * FROM problems').all() as any[];
  return rows.map(r => ({ ...r, requirements: JSON.parse(r.requirements), tags: JSON.parse(r.tags) }));
}

export function getProblem(id: string): Problem | undefined {
  const row = db.prepare('SELECT * FROM problems WHERE id = ?').get(id) as any;
  if (!row) return undefined;
  return { ...row, requirements: JSON.parse(row.requirements), tags: JSON.parse(row.tags) };
}

export function createSubmission(sub: Submission) {
  db.prepare(`
    INSERT INTO submissions (id, problemId, userId, designContent, rationaleContent, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(sub.id, sub.problemId, sub.userId, sub.designContent, sub.rationaleContent, sub.status, sub.createdAt);
}

export function getSubmission(id: string): Submission | undefined {
  const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id) as Submission | undefined;
  return row;
}

export function updateSubmissionStatus(id: string, status: SubmissionStatus) {
  db.prepare('UPDATE submissions SET status = ? WHERE id = ?').run(status, id);
}

export function saveEvaluation(evaluation: Evaluation, submissionId: string) {
  const insertEval = db.prepare(`
    INSERT INTO evaluations (id, submissionId, rubric, overallScore, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const updateSub = db.prepare(`
    UPDATE submissions 
    SET evaluationId = ?, status = 'Completed' 
    WHERE id = ?
  `);

  const transaction = db.transaction(() => {
    insertEval.run(
      evaluation.id, 
      evaluation.submissionId, 
      JSON.stringify(evaluation.rubric), 
      evaluation.overallScore, 
      evaluation.createdAt
    );
    updateSub.run(evaluation.id, submissionId);
  });

  transaction();
}

export function getEvaluation(id: string): Evaluation | undefined {
  const row = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(id) as any;
  if (!row) return undefined;
  return { ...row, rubric: JSON.parse(row.rubric) };
}

export function getHistory(userId: string): Submission[] {
  return db.prepare('SELECT * FROM submissions WHERE userId = ? ORDER BY createdAt DESC').all(userId) as Submission[];
}
