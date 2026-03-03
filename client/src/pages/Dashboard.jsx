import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayMeals: [],
    todayWorkouts: [],
    todaySleep: null,
    totalCaloriesIn: 0,
    totalCaloriesOut: 0
  });
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
      loadTodayStats(token);
    } catch (err) {
      console.error('Chyba při dekódování tokenu:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  // Načtení dnešních dat ze serveru
  const loadTodayStats = async (token) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // formát YYYY-MM-DD

      // Načtení jídel z API
      const mealsRes = await fetch('http://localhost:3000/api/meals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const mealsData = await mealsRes.json();
      const todayMeals = mealsData.meals.filter(m => m.meal_date === today);

      // Sečtení kalorií - reduce je fakt užitečný
      const totalCaloriesIn = todayMeals.reduce((sum, m) => sum + m.calories, 0);

      // Tréninky
      const workoutsRes = await fetch('http://localhost:3000/api/workouts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const workoutsData = await workoutsRes.json();
      const todayWorkouts = workoutsData.workouts.filter(w => w.workout_date === today);
      const totalCaloriesOut = todayWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

      // Spánek - tady používám find místo filter, protože je jen jeden záznam za den
      const sleepRes = await fetch('http://localhost:3000/api/sleep', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sleepData = await sleepRes.json();
      const todaySleep = sleepData.sleep.find(s => s.sleep_date === today);

      setStats({
        todayMeals,
        todayWorkouts,
        todaySleep,
        totalCaloriesIn,
        totalCaloriesOut
      });
      setLoading(false);
    } catch (err) {
      console.error('Chyba při načítání statistik:', err);
      setLoading(false);
    }
  };

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
          <h1 style={{ margin: '0 0 5px 0', color: '#333' }}>FitBud Dashboard</h1>
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
          <h2 style={{ marginTop: 0, color: '#28a745' }}>Jídla</h2>
          <p style={{ color: '#666', marginBottom: '15px' }}>Dnešní příjem kalorií</p>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
            {stats.totalCaloriesIn} kcal
          </div>
          <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
            {stats.todayMeals.length} jídel dnes
          </p>
          <button
            onClick={() => navigate('/meals/add')}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            + Přidat jídlo
          </button>
        </div>

        {/* Karta - Tréninky */}
        <div style={{
          padding: '20px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, color: '#dc3545' }}>Tréninky</h2>
          <p style={{ color: '#666', marginBottom: '15px' }}>Spálené kalorie</p>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>
            {stats.totalCaloriesOut} kcal
          </div>
          <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
            {stats.todayWorkouts.length} tréninků dnes
          </p>
        </div>

        {/* Karta - Spánek */}
        <div style={{
          padding: '20px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, color: '#007bff' }}>Spánek</h2>
          <p style={{ color: '#666', marginBottom: '15px' }}>Dnešní spánek</p>
          {stats.todaySleep ? (
            <>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
                {stats.todaySleep.duration_hours}h
              </div>
              <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
                Kvalita: {stats.todaySleep.quality}/5
              </p>
            </>
          ) : (
            <p style={{ fontSize: '14px', color: '#999' }}>Zatím nezaznamenáno</p>
          )}
        </div>
      </div>

      {/* Info box - TODO: přidat grafy */}
      <div style={{
        padding: '20px',
        background: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#004085', fontWeight: '500' }}>
          Brzy zde přidám grafy a týdenní statistiky!
        </p>
      </div>
    </div>
  );
}

export default Dashboard;

