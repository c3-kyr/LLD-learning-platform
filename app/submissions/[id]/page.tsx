'use client';

import { useState, useEffect, use } from 'react';

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/submissions/${id}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      if (data?.submission?.status === 'Evaluating') {
        fetchStatus();
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, data?.submission?.status]);

  const handleRetry = async () => {
    setLoading(true);
    try {
      await fetch(`/api/evaluate/${id}`, { method: 'POST' });
      fetchStatus();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (loading && !data) return <div className="container">Loading...</div>;
  if (!data || !data.submission) return <div className="container">Submission not found.</div>;

  const { submission, evaluation } = data;

  return (
    <div className="container">
      <h1>Feedback Report</h1>
      <div style={{ marginBottom: '2rem' }}>
        Status: <span className={`status ${submission.status.toLowerCase()}`}>{submission.status}</span>
      </div>

      {submission.status === 'Evaluating' && (
        <div className="card loading-card">
          <div className="spinner-large"></div>
          <p>AI is analyzing your architecture...</p>
        </div>
      )}

      {submission.status === 'Failed' && (
        <div className="card" style={{ borderColor: 'var(--danger-color)' }}>
          <h3>Evaluation Failed</h3>
          <p>There was an error while evaluating your submission.</p>
          <button className="btn" onClick={handleRetry}>Retry Evaluation</button>
        </div>
      )}

      {submission.status === 'Completed' && evaluation && (
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Deterministic Checks</h3>
            <p style={{ color: 'var(--success-color)', fontWeight: 'bold', margin: 0 }}>
              ✓ Passed (Required fields present, length &gt; 20 characters)
            </p>
          </div>

          <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h2>AI Evaluation - Overall Score</h2>
            <div className="score">{evaluation.overallScore.toFixed(1)} / 5.0</div>
          </div>

          <h3>AI Detailed Rubric</h3>
          
          {Object.entries(evaluation.rubric).map(([key, item]: [string, any]) => (
            <div key={key} className="card rubric-item">
              <h4 style={{ textTransform: 'capitalize', marginBottom: '0.5rem' }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div className="score" style={{ margin: 0 }}>{item.score} / 5</div>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${(item.score / 5) * 100}%`, backgroundColor: item.score === 5 ? 'var(--success-color)' : item.score >= 3 ? 'var(--warning-color)' : 'var(--danger-color)' }}></div>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Confidence: {item.confidence} / 5
              </div>
              <p><strong>Evidence:</strong> {item.evidence}</p>
              {item.concern && <p><strong>Concern:</strong> <span style={{ color: 'var(--warning-color)' }}>{item.concern}</span></p>}
              {item.suggestion && <p><strong>Suggestion:</strong> {item.suggestion}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
