import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const [chartData, setChartData] = useState({
    calories: { labels: [], data: [] },
    sleep: { labels: [], data: [] }
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

      // Příprava dat pro grafy - posledních 7 dní
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
      }

      // Kalorie po dnech
      const caloriesByDay = last7Days.map(date => {
        const dayMeals = mealsData.meals.filter(m => m.meal_date === date);
        return dayMeals.reduce((sum, m) => sum + m.calories, 0);
      });

      // Spánek po dnech
      const sleepByDay = last7Days.map(date => {
        const daySleep = sleepData.sleep.find(s => s.sleep_date === date);
        return daySleep ? daySleep.duration_hours : 0;
      });

      setStats({
        todayMeals,
        todayWorkouts,
        todaySleep,
        totalCaloriesIn,
        totalCaloriesOut
      });

      setChartData({
        calories: {
          labels: last7Days.map(d => new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })),
          data: caloriesByDay
        },
        sleep: {
          labels: last7Days.map(d => new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })),
          data: sleepByDay
        }
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
    return <Loading message="Načítám dashboard..." />;
  }

  // Konfigurace grafů
  const caloriesChartData = {
    labels: chartData.calories.labels,
    datasets: [{
      label: 'Kalorie',
      data: chartData.calories.data,
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2
    }]
  };

  const sleepChartData = {
    labels: chartData.sleep.labels,
    datasets: [{
      label: 'Hodiny spánku',
      data: chartData.sleep.data,
      backgroundColor: 'rgba(139, 92, 246, 0.5)',
      borderColor: 'rgb(139, 92, 246)',
      borderWidth: 2,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '0'
    }}>
      {/* Top Bar */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Dashboard
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: '#64748b'
          }}>
            Vítej zpět, {user?.name || user?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: 'white',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#f8fafc';
            e.target.style.borderColor = '#cbd5e1';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'white';
            e.target.style.borderColor = '#e2e8f0';
          }}
        >
          Odhlásit se
        </button>
      </div>

      {/* Hlavní obsah */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Statistiky - 3 karty */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Karta - Jídla */}
          <div style={{
            padding: '24px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#64748b',
              marginBottom: '8px'
            }}>
              Příjem kalorií
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '4px'
            }}>
              {stats.totalCaloriesIn}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#94a3b8'
            }}>
              {stats.todayMeals.length} jídel dnes
            </div>
          </div>

          {/* Karta - Tréninky */}
          <div style={{
            padding: '24px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#64748b',
              marginBottom: '8px'
            }}>
              Spálené kalorie
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '4px'
            }}>
              {stats.totalCaloriesOut}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#94a3b8'
            }}>
              {stats.todayWorkouts.length} tréninků dnes
            </div>
          </div>

          {/* Karta - Spánek */}
          <div style={{
            padding: '24px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#64748b',
              marginBottom: '8px'
            }}>
              Spánek
            </div>
            {stats.todaySleep ? (
              <>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '4px'
                }}>
                  {stats.todaySleep.duration_hours}h
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#94a3b8'
                }}>
                  Kvalita: {stats.todaySleep.quality}
                </div>
              </>
            ) : (
              <>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: '#cbd5e1',
                  marginBottom: '4px'
                }}>
                  -
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#94a3b8'
                }}>
                  Zatím nezaznamenáno
                </div>
              </>
            )}
          </div>
        </div>

        {/* Grafy */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Graf kalorií */}
          <div style={{
            padding: '24px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#0f172a'
            }}>
              Kalorický příjem (7 dní)
            </h3>
            <div style={{ height: '250px' }}>
              <Bar data={caloriesChartData} options={chartOptions} />
            </div>
          </div>

          {/* Graf spánku */}
          <div style={{
            padding: '24px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#0f172a'
            }}>
              Délka spánku (7 dní)
            </h3>
            <div style={{ height: '250px' }}>
              <Line data={sleepChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Rychlé akce */}
        <div style={{
          padding: '24px',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#0f172a'
          }}>
            Rychlé akce
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <button
              onClick={() => navigate('/meals/add')}
              style={{
                padding: '12px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#2563eb'}
              onMouseOut={(e) => e.target.style.background = '#3b82f6'}
            >
              Přidat jídlo
            </button>
            <button
              onClick={() => navigate('/workouts/add')}
              style={{
                padding: '12px 20px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#7c3aed'}
              onMouseOut={(e) => e.target.style.background = '#8b5cf6'}
            >
              Přidat trénink
            </button>
            <button
              onClick={() => navigate('/sleep/add')}
              style={{
                padding: '12px 20px',
                background: '#06b6d4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#0891b2'}
              onMouseOut={(e) => e.target.style.background = '#06b6d4'}
            >
              Přidat spánek
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

