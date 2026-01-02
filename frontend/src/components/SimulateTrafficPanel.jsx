import React, { useState } from 'react';
import './SimulateTrafficPanel.css'; 

function SimulateTrafficPanel() {
  const [numRequests, setNumRequests] = useState(50);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleSimulate = async () => {
    setRunning(true);
    setResult(null);
    setShowPopup(false);
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
    <div className="simulate-container">
      <h2>Simulate Heavy Traffic</h2>
      <input
        type="number"
        className="simulate-input"
        value={numRequests}
        onChange={(e) => setNumRequests(Number(e.target.value))}
        min={1}
        max={1000}
      />
      <button
        onClick={handleSimulate}
        disabled={running}
        className="simulate-button"
      >
        {running ? 'Running...' : 'Start Simulation'}
      </button>

      {result && result.urls && result.urls.length > 0 && (
        <button onClick={() => setShowPopup(true)} className="result-button">
          Show URL Results
        </button>
      )}

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

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-modal">
            <h3>Simulation Results</h3>
            <ul>
              {result.urls.map((item, i) => (
                <li key={i}>
                  <strong>Original:</strong> {item.original_url} <br />
                  <strong>Short:</strong>{' '}
                  <a href={item.short_url} target="_blank" rel="noopener noreferrer">
                    {item.short_url}
                  </a>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowPopup(false)} className="popup-close">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimulateTrafficPanel;
