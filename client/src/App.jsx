import { useState, useEffect } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test připojení k API
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Chyba při připojení k API:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      maxWidth: '800px', 
      margin: '50px auto',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1>🏋️ FitBud</h1>
      <p>Tvůj osobní fitness tracker</p>
      
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: '#f5f5f5', 
        borderRadius: '8px' 
      }}>
        <h2>Status API</h2>
        {loading ? (
          <p>Načítám...</p>
        ) : apiStatus ? (
          <div>
            <p style={{ color: 'green', fontWeight: 'bold' }}>✅ {apiStatus.message}</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              Čas: {new Date(apiStatus.timestamp).toLocaleString('cs-CZ')}
            </p>
          </div>
        ) : (
          <p style={{ color: 'red' }}>❌ API neodpovídá. Ujisti se, že server běží.</p>
        )}
      </div>

      <div style={{ marginTop: '30px', fontSize: '0.9em', color: '#666' }}>
        <p>📦 Frontend: React + Vite</p>
        <p>🔧 Backend: Node.js + Express</p>
        <p>💾 Databáze: SQLite (připravuje se)</p>
      </div>
    </div>
  );
}

export default App;

