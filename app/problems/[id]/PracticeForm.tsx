'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PracticeForm({ problemId }: { problemId: string }) {
  const router = useRouter();
  const [design, setDesign] = useState('');
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Create submission
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId,
          userId: 'user123', // Hardcoded for MVP
          designContent: design,
          rationaleContent: rationale
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');

      const submissionId = data.id;

      // 2. Trigger evaluation
      const evalRes = await fetch(`/api/evaluate/${submissionId}`, { method: 'POST' });
      if (!evalRes.ok) {
        const evalData = await evalRes.json();
        throw new Error(evalData.error || 'Failed to trigger evaluation');
      }

      // 3. Redirect to feedback page
      router.push(`/submissions/${submissionId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="pane pane-right">
      <h2>Your Solution</h2>
      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', padding: '1rem', background: 'rgba(220, 53, 69, 0.1)', borderRadius: '4px' }}>{error}</div>}
      
      <div className="form-group">
        <label>Design (Classes, Interfaces, Responsibilities)</label>
        <textarea 
          value={design} 
          onChange={e => setDesign(e.target.value)}
          placeholder="Paste your code or text-based design here..."
        />
      </div>
      
      <div className="form-group">
        <label>Rationale (Trade-offs, AI Usage, Why this design?)</label>
        <textarea 
          value={rationale} 
          onChange={e => setRationale(e.target.value)}
          placeholder="Explain your choices..."
        />
      </div>
      
      <button 
        className="btn" 
        onClick={handleSubmit} 
        disabled={loading || !design || !rationale}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
      >
        {loading ? (
          <>
            <span className="spinner"></span> Submitting...
          </>
        ) : 'Submit & Evaluate'}
      </button>
    </div>
  );
}
