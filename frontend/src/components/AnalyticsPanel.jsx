import React, { useEffect, useState } from 'react';

function AnalyticsPanel() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats/analytics');
      const data = await res.json();
      if (res.ok) {
        setStats(data);
        setError('');
      } else {
        setError(data.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error(err);
      setError('Server not reachable');
    }
  };

  fetchStats(); // First fetch

  const interval = setInterval(fetchStats, 5000); // Auto-refresh every 5s
  return () => clearInterval(interval); // Clean up
}, []);


  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!stats) return <p>Loading analytics...</p>;

  return (
    <div>
      <h2>Analytics</h2>
      <p><strong>Total URLs Created:</strong> {stats.urlCreatedCount}</p>
      <p><strong>Total Visits:</strong> {stats.urlVisitedCount}</p>
      <p><strong>From Redis:</strong> {stats.redisHitCount}</p>
      <p><strong>From DB:</strong> {stats.dbHitCount}</p>
      <p><strong>Total Lookups:</strong> {stats.urlLookupCount}</p>

      {/* <h3>Recent Activity</h3>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <h4>Created</h4>
          <ul>
            {stats.recentUrlCreated.map((e, i) => (
              <li key={i}>{e.original_url || e.short_code}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Visited</h4>
          <ul>
            {stats.recentUrlVisited.map((e, i) => (
              <li key={i}>{e.short_code} ({e.source})</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Lookups</h4>
          <ul>
            {stats.recentUrlLookup.map((e, i) => (
              <li key={i}>{e.original_url} ({e.source})</li>
            ))}
          </ul>
        </div>
      </div> */}
    </div>
  );
}

export default AnalyticsPanel;
