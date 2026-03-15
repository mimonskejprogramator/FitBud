import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { exportAllData } from '../utils/exportCSV';

// Registrace komponent Chart.js - bez toho to nefunguje
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function Stats() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [sleepRecords, setSleepRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Načtení všech dat najednou
      const [mealsRes, workoutsRes, sleepRes] = await Promise.all([
        fetch('http://localhost:3000/api/meals', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/workouts', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/sleep', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const mealsData = await mealsRes.json();
      const workoutsData = await workoutsRes.json();
      const sleepData = await sleepRes.json();

      setMeals(mealsData.meals || []);
      setWorkouts(workoutsData.workouts || []);
      setSleepRecords(sleepData.sleep || []);
      setLoading(false);
    } catch (err) {
      setError('Nepodařilo se načíst data');
      setLoading(false);
    }
  };

  // Pomocná funkce - posledních N dní
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Labely pro grafy (Po, Út, St...)
  const dayLabels = last7Days.map(d => {
    return new Date(d).toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric' });
  });

  // Data pro graf kalorií (příjem vs výdej)
  const caloriesInData = last7Days.map(day => {
    return meals
      .filter(m => m.meal_date === day)
      .reduce((sum, m) => sum + (m.calories || 0), 0);
  });

  const caloriesOutData = last7Days.map(day => {
    return workouts
      .filter(w => w.workout_date === day)
      .reduce((sum, w) => sum + (w.calories_burned || 0), 0);
  });

  // Data pro graf spánku
  const sleepData = last7Days.map(day => {
    const record = sleepRecords.find(s => s.sleep_date === day);
    return record ? parseFloat(record.duration_hours) : 0;
  });

  // Celkové statistiky
  const totalCaloriesIn = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalCaloriesOut = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
  const avgSleep = sleepRecords.length > 0
    ? (sleepRecords.reduce((sum, s) => sum + parseFloat(s.duration_hours), 0) / sleepRecords.length).toFixed(1)
    : 0;

  const caloriesChartData = {
    labels: dayLabels,
    datasets: [
      {
        label: 'Příjem (kcal)',
        data: caloriesInData,
        backgroundColor: 'rgba(40, 167, 69, 0.6)',
        borderColor: '#28a745',
        borderWidth: 1
      },
      {
        label: 'Výdej (kcal)',
        data: caloriesOutData,
        backgroundColor: 'rgba(220, 53, 69, 0.6)',
        borderColor: '#dc3545',
        borderWidth: 1
      }
    ]
  };

  const sleepChartData = {
    labels: dayLabels,
    datasets: [
      {
        label: 'Délka spánku (h)',
        data: sleepData,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Načítám statistiky...</p>
      </div>
    );
  }

  const handleExportAll = async () => {
    setExportMessage('');
    const token = localStorage.getItem('token');
    const result = await exportAllData(token);
    setExportMessage(result.message);
    setTimeout(() => setExportMessage(''), 5000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0 }}>Statistiky a grafy</h1>
          <button
            onClick={handleExportAll}
            disabled={meals.length === 0 && workouts.length === 0 && sleepRecords.length === 0}
            style={{
              padding: '12px 24px',
              background: (meals.length === 0 && workouts.length === 0 && sleepRecords.length === 0) ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (meals.length === 0 && workouts.length === 0 && sleepRecords.length === 0) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            📥 Exportovat všechna data
          </button>
        </div>

        {error && (
          <div style={{ padding: '15px', marginBottom: '20px', background: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {exportMessage && (
          <div style={{ padding: '15px', marginBottom: '20px', background: '#d4edda', color: '#155724', borderRadius: '4px' }}>
            {exportMessage}
          </div>
        )}

        {/* Souhrnné karty */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Celkem přijato</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>{totalCaloriesIn}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>kcal celkem</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Celkem spáleno</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc3545' }}>{totalCaloriesOut}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>kcal celkem</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>Průměrný spánek</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>{avgSleep}h</div>
            <div style={{ fontSize: '12px', color: '#999' }}>za všechny záznamy</div>
          </div>
        </div>

        {/* Graf kalorií */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Kalorie za posledních 7 dní</h2>
          <Bar data={caloriesChartData} options={chartOptions} />
        </div>

        {/* Graf spánku */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Délka spánku za posledních 7 dní</h2>
          <Line data={sleepChartData} options={{
            ...chartOptions,
            plugins: { ...chartOptions.plugins },
            scales: { y: { beginAtZero: true, max: 12, title: { display: true, text: 'Hodiny' } } }
          }} />
        </div>

        {/* Přehled aktivit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0 }}>Počty záznamů</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                <span>🥗 Jídla celkem</span>
                <strong>{meals.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                <span>💪 Tréninky celkem</span>
                <strong>{workouts.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                <span>😴 Záznamy spánku</span>
                <strong>{sleepRecords.length}</strong>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0 }}>Typy tréninků</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['cardio', 'strength', 'flexibility', 'sports', 'other'].map(type => {
                const count = workouts.filter(w => w.workout_type === type).length;
                const labels = { cardio: 'Kardio', strength: 'Posilování', flexibility: 'Protažení', sports: 'Sport', other: 'Jiné' };
                return count > 0 ? (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                    <span>{labels[type]}</span>
                    <strong>{count}x</strong>
                  </div>
                ) : null;
              })}
              {workouts.length === 0 && <p style={{ color: '#999', fontSize: '14px' }}>Zatím žádné tréninky</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;

