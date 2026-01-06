import React, { useState } from 'react';
import './App.css';
import AnalyticsPanel from './components/AnalyticsPanel';
import SimulateTrafficPanel from './components/SimulateTrafficPanel';

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [analyticsPopupVisible, setAnalyticsPopupVisible] = useState(false);
  const [stimuateTrafficPopupVisible, setSimulateTrafficPopupVisible] = useState(false);

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
    <div className="main-container">
      <div className="left-panel">
      <h1>Miny URL Shortener</h1>

      <form onSubmit={handleSubmit} className="shorten-form">
        <input
          type="url"
          placeholder="Enter a long URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
        />

        <div className="shorten-row">
          <button type="submit">Shorten</button>

          {shortUrl && (
            <span className="short-url-inline">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(shortUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </span>
          )}
        </div>
      </form>



      
      

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}
        <div className='button-group'>
          <button className='analytics-btn' onClick={() => setAnalyticsPopupVisible(true)}>View Analytics</button>
          <button className='simulate-traffic-btn' onClick={() => setSimulateTrafficPopupVisible(true)}>Simulate Traffic</button>
        
      </div>
      </div>
    
    {analyticsPopupVisible && (
      <div className='overlay'>
        <div className='popup'>
          <AnalyticsPanel />
          <div className='popup-footer' >
          <button className='close-btn' onClick={() => setAnalyticsPopupVisible(false)}>Close</button>
          </div>
        </div>
      </div>
    )}

    {stimuateTrafficPopupVisible && (
      <div className='overlay'>
        <div className='popup'>
          <SimulateTrafficPanel />
          <button className='close-btn' onClick={() => setSimulateTrafficPopupVisible(false)}>Close</button>
          
        </div>
      </div>
    )}

    
     
    </div>
    
    
  );
}

export default App;
