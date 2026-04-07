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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

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
  const [calorieGoal, setCalorieGoal] = useState(() => {
    const stored = localStorage.getItem('calorieGoal');
    return stored ? parseInt(stored) : 2000;
  });
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

  // Změna denního cíle kalorií - jednoduchý prompt, hodnota se uloží do localStorage
  const handleChangeGoal = () => {
    const input = prompt('Denní cíl kalorií (kcal):', calorieGoal);
    if (input === null) return;
    const parsed = parseInt(input);
    if (!isNaN(parsed) && parsed > 0 && parsed < 20000) {
      setCalorieGoal(parsed);
      localStorage.setItem('calorieGoal', parsed.toString());
    }
  };

  // Procento splnění cíle, ořezané na 0-100 pro šířku progress baru
  const caloriePercent = Math.min(100, Math.round((stats.totalCaloriesIn / calorieGoal) * 100));
  const isOverGoal = stats.totalCaloriesIn > calorieGoal;

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
    <div className="min-h-screen bg-background">
      {/* Hlavní obsah */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Statistiky - 3 karty */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Karta - Jídla */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Příjem kalorií</CardDescription>
            </CardHeader>
            <CardContent>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="text-4xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors">
                    {stats.totalCaloriesIn}
                    <span className="text-lg text-muted-foreground font-normal"> / {calorieGoal}</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Dnešní jídla</h4>
                    {stats.todayMeals.length > 0 ? (
                      <div className="space-y-1">
                        {stats.todayMeals.map((meal, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{meal.name}</span>
                            <span className="font-medium">{meal.calories} kcal</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Zatím žádná jídla</p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>

              {/* Progress bar denního cíle */}
              <div className="mt-3 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${isOverGoal ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">
                  {caloriePercent}% denního cíle
                </p>
                <button
                  onClick={handleChangeGoal}
                  className="text-xs text-muted-foreground hover:text-primary underline"
                >
                  změnit cíl
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Karta - Tréninky */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Spálené kalorie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">
                {stats.totalCaloriesOut}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.todayWorkouts.length} tréninků dnes
              </p>
            </CardContent>
          </Card>

          {/* Karta - Spánek */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Spánek</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.todaySleep ? (
                <>
                  <div className="text-4xl font-bold text-foreground">
                    {stats.todaySleep.duration_hours}h
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kvalita: {stats.todaySleep.quality}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold text-muted">
                    -
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Zatím nezaznamenáno
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grafy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Graf kalorií */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kalorický příjem (7 dní)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={caloriesChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Graf spánku */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Délka spánku (7 dní)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line data={sleepChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rychlé akce */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rychlé akce</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => navigate('/meals/add')}
                className="w-full"
              >
                Přidat jídlo
              </Button>
              <Button
                onClick={() => navigate('/workouts/add')}
                className="w-full"
                variant="secondary"
              >
                Přidat trénink
              </Button>
              <Button
                onClick={() => navigate('/sleep/add')}
                className="w-full"
                variant="outline"
              >
                Přidat spánek
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;

