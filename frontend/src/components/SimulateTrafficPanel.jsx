import React, { useState } from 'react';

function SimulateTrafficPanel() {
  const [numRequests, setNumRequests] = useState(50);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const handleSimulate = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch('/api/simulate?count=' + numRequests);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Simulation failed:', err);
      setResult({ error: 'Failed to run simulation' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Simulate Heavy Traffic</h2>
      <input
        type="number"
        value={numRequests}
        onChange={(e) => setNumRequests(Number(e.target.value))}
        min={1}
        max={1000}
      />
      <button onClick={handleSimulate} disabled={running}>
        {running ? 'Running...' : 'Start Simulation'}
      </button>

      {result && (
        <div style={{ marginTop: '1rem' }}>
          {result.error ? (
            <p style={{ color: 'red' }}>{result.error}</p>
          ) : (
            <>
              <p>✅ Simulation Complete</p>
              <p>Requests: {result.total}</p>
              <p>Successes: {result.success}</p>
              <p>Failures: {result.fail}</p>
              <p>Avg Time: {result.avgMs.toFixed(2)} ms</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SimulateTrafficPanel;
