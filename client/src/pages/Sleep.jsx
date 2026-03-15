import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportSleep } from '../utils/exportCSV';

function Sleep() {
  const navigate = useNavigate();
  const [sleepRecords, setSleepRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSleepRecords();
  }, []);

  const loadSleepRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/sleep', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se načíst záznamy');
      }

      // Seřazení podle data (nejnovější první)
      const sortedRecords = data.sleep.sort((a, b) => {
        return new Date(b.sleep_date) - new Date(a.sleep_date);
      });

      setSleepRecords(sortedRecords);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Opravdu chceš smazat tento záznam?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/sleep/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat záznam');
      }

      loadSleepRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ');
  };

  // Překlad kvality spánku
  const getQualityLabel = (quality) => {
    const qualities = {
      'excellent': 'Výborná',
      'good': 'Dobrá',
      'fair': 'Průměrná',
      'poor': 'Špatná'
    };
    return qualities[quality] || quality;
  };

  // Barva podle kvality
  const getQualityColor = (quality) => {
    const colors = {
      'excellent': '#28a745',
      'good': '#007bff',
      'fair': '#ffc107',
      'poor': '#dc3545'
    };
    return colors[quality] || '#6c757d';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px', textAlign: 'center' }}>
        <p>Načítám...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0 }}>Můj spánek</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/sleep/add')}
              style={{
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + Přidat záznam
            </button>
            <button
              onClick={() => exportSleep(sleepRecords)}
              disabled={sleepRecords.length === 0}
              style={{
                padding: '10px 20px',
                background: sleepRecords.length === 0 ? '#ccc' : '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: sleepRecords.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              📥 Export CSV
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '15px',
            marginBottom: '20px',
            background: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        {sleepRecords.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            <p>Zatím nemáš žádné záznamy o spánku.</p>
            <button
              onClick={() => navigate('/sleep/add')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Přidat první záznam
            </button>
          </div>
        ) : (
          <>
            {/* Statistiky */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0 }}>Statistiky za posledních 7 dní</h3>
              <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ color: '#666', fontSize: '14px' }}>Průměrná délka: </span>
                  <strong style={{ fontSize: '18px', color: '#007bff' }}>
                    {(sleepRecords.slice(0, 7).reduce((sum, r) => sum + parseFloat(r.duration_hours), 0) / Math.min(7, sleepRecords.length)).toFixed(1)}h
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#666', fontSize: '14px' }}>Počet záznamů: </span>
                  <strong style={{ fontSize: '18px' }}>{sleepRecords.length}</strong>
                </div>
              </div>
            </div>

            {/* Seznam záznamů */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {sleepRecords.map(record => (
                <div
                  key={record.id}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #ddd'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', color: '#999', marginBottom: '10px' }}>
                        {formatDate(record.sleep_date)}
                      </div>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <div>
                          <span style={{ color: '#666', fontSize: '14px' }}>Délka: </span>
                          <strong style={{ fontSize: '24px', color: '#007bff' }}>
                            {record.duration_hours}h
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: '#666', fontSize: '14px' }}>Kvalita: </span>
                          <span style={{
                            background: getQualityColor(record.quality),
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {getQualityLabel(record.quality)}
                          </span>
                        </div>
                      </div>
                      {(record.bedtime || record.wake_time) && (
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                          {record.bedtime && `Usnutí: ${record.bedtime}`}
                          {record.bedtime && record.wake_time && ' • '}
                          {record.wake_time && `Probuzení: ${record.wake_time}`}
                        </div>
                      )}
                      {record.notes && (
                        <div style={{
                          marginTop: '10px',
                          padding: '10px',
                          background: '#f8f9fa',
                          borderRadius: '4px',
                          fontSize: '14px',
                          color: '#666'
                        }}>
                          {record.notes}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                      <button
                        onClick={() => navigate(`/sleep/edit/${record.id}`)}
                        style={{
                          padding: '8px 16px',
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Upravit
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Smazat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Sleep;
