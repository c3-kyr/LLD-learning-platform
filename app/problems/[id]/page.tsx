import { getProblem } from '@/lib/db';
import PracticeForm from './PracticeForm';

export default async function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = getProblem(id);

  if (!problem) {
    return <div className="container">Problem not found.</div>;
  }

  return (
    <div className="split-pane">
      <div className="pane pane-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Problem Description</h2>
          <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
        </div>
        <p><strong>{problem.title}</strong></p>
        <p style={{ lineHeight: '1.6' }}>{problem.description}</p>
        
        <h3 style={{ marginTop: '2rem' }}>Requirements</h3>
        <ul style={{ lineHeight: '1.6' }}>
          {problem.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>
      <PracticeForm problemId={id} />
    </div>
  );
}
