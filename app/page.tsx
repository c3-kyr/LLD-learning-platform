import { getProblems } from '@/lib/db';
import Link from 'next/link';

export default function Dashboard() {
  const problems = getProblems();

  return (
    <div className="container">
      <h1>LLD Practice Problems</h1>
      <p>Select a problem to begin practicing your low-level design.</p>
      
      <div className="problem-grid" style={{ marginTop: '2rem', display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {problems.map(problem => (
          <div key={problem.id} className="card problem-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{problem.title}</h2>
              <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
            </div>
            <p style={{ minHeight: '60px' }}>{problem.description}</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {problem.tags && problem.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>

            <div style={{ marginTop: 'auto' }}>
              <Link href={`/problems/${problem.id}`}>
                <button className="btn w-full">Start Practice</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
