import { getHistory } from '@/lib/db';
import Link from 'next/link';

export default function HistoryPage() {
  const history = getHistory('user123'); // Hardcoded user for MVP

  return (
    <div className="container">
      <h1>Practice History</h1>
      <p>Your previous attempts.</p>

      <div style={{ marginTop: '2rem' }}>
        {history.length === 0 ? (
          <p>No attempts yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Date</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
                <th style={{ padding: '0.5rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.5rem' }}>{new Date(sub.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span className={`status ${sub.status.toLowerCase()}`}>{sub.status}</span>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <Link href={`/submissions/${sub.id}`}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
