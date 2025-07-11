import React, { useState } from 'react';
import './App.css';
import AnalyticsPanel from './components/AnalyticsPanel';
import SimulateTrafficPanel from './components/SimulateTrafficPanel';

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_url: originalUrl }), // 👈 This must match your backend's expected key
      });

      const data = await res.json();

      if (res.ok) {
        setShortUrl(data.short_url);
        setError('');
      } else {
        setError(data.error || 'Something went wrong.');
        setShortUrl('');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Could not reach the server.');
      setShortUrl('');
    }
  };

  return (
    <div className="App">
      <h1>Miny URL Shortener</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Enter a long URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
        />
        <button type="submit">Shorten</button>
      </form>

      {shortUrl && (
        <p>
          Short URL: <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a>
          <button onClick={()=> {
            navigator.clipboard.writeText(shortUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}>{copied? 'URL Copied!' :'Copy'}</button>
        </p>
      )}

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}
    
    <div style={{ marginTop: '2rem' }} className="Analytics">
      <AnalyticsPanel />
      <SimulateTrafficPanel />
    </div>
    
    </div>
    
    
  );
}

export default App;
