import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Kontrola, zda je uživatel přihlášený
    const token = localStorage.getItem('token');

    if (!token) {
      // Pokud není token, přesměruj na login
      navigate('/login');
      return;
    }

    // Dekódování tokenu pro získání info o uživateli
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
      setLoading(false);
    } catch (err) {
      console.error('Chyba při dekódování tokenu:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Načítám...</p>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>🏋️ FitBud Dashboard</h1>
          <p style={{ margin: 0, color: '#666' }}>
            Vítej zpět, <strong>{user?.email}</strong>!
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Odhlásit se
        </button>
      </div>

      {/* Hlavní obsah */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Karta - Jídla */}
        <div style={{
          padding: '20px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0 }}>🍽️ Jídla</h2>
          <p style={{ color: '#666' }}>Evidence výživy a kalorií</p>
          <p style={{ fontSize: '14px', color: '#999' }}>Připravuje se...</p>
        </div>

        {/* Karta - Tréninky */}
        <div style={{
          padding: '20px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0 }}>💪 Tréninky</h2>
          <p style={{ color: '#666' }}>Sledování cvičení</p>
          <p style={{ fontSize: '14px', color: '#999' }}>Připravuje se...</p>
        </div>

        {/* Karta - Spánek */}
        <div style={{
          padding: '20px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0 }}>😴 Spánek</h2>
          <p style={{ color: '#666' }}>Monitoring odpočinku</p>
          <p style={{ fontSize: '14px', color: '#999' }}>Připravuje se...</p>
        </div>
      </div>

      {/* Info box */}
      <div style={{
        padding: '20px',
        background: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#004085' }}>
          📊 Dashboard je ve vývoji. Brzy zde uvidíš statistiky a grafy!
        </p>
      </div>
    </div>
  );
}

export default Dashboard;

