import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { API_URL, fetchCurrentUser, logoutRequest } from '@/lib/api';

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
  const [waterGoal, setWaterGoal] = useState(() => {
    const stored = localStorage.getItem('waterGoal');
    return stored ? parseInt(stored) : 2500;
  });
  const [waterToday, setWaterToday] = useState(0);
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
  const location = useLocation();
  const justRegistered = location.state?.justRegistered;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await fetchCurrentUser();
      if (cancelled) return;
      if (!u) {
        navigate('/login');
        return;
      }
      setUser(u);
      loadTodayStats();
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  useEffect(() => {
    const syncGoals = () => {
      const cal = localStorage.getItem('calorieGoal');
      if (cal) setCalorieGoal(parseInt(cal));
      const water = localStorage.getItem('waterGoal');
      if (water) setWaterGoal(parseInt(water));
    };
    window.addEventListener('settings-updated', syncGoals);
    return () => window.removeEventListener('settings-updated', syncGoals);
  }, []);

  const loadTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const mealsRes = await fetch(`${API_URL}/api/meals`, { credentials: 'include' });
      const mealsData = await mealsRes.json();
      const todayMeals = mealsData.meals.filter(m => m.meal_date === today);

      const totalCaloriesIn = todayMeals.reduce((sum, m) => sum + m.calories, 0);

      const workoutsRes = await fetch(`${API_URL}/api/workouts`, { credentials: 'include' });
      const workoutsData = await workoutsRes.json();
      const todayWorkouts = workoutsData.workouts.filter(w => w.workout_date === today);
      const totalCaloriesOut = todayWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

      const sleepRes = await fetch(`${API_URL}/api/sleep`, { credentials: 'include' });
      const sleepData = await sleepRes.json();
      const todaySleep = sleepData.sleep.find(s => s.sleep_date === today);

      const waterRes = await fetch(`${API_URL}/api/water/today`, { credentials: 'include' });
      const waterData = await waterRes.json();
      setWaterToday(Number(waterData.total) || 0);

      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
      }

      const caloriesByDay = last7Days.map(date => {
        const dayMeals = mealsData.meals.filter(m => m.meal_date === date);
        return dayMeals.reduce((sum, m) => sum + m.calories, 0);
      });

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

  const handleLogout = async () => {
    await logoutRequest();
    navigate('/login');
  };

  const handleChangeGoal = () => {
    const input = prompt('Denní cíl kalorií (kcal):', calorieGoal);
    if (input === null) return;
    const parsed = parseInt(input);
    if (!isNaN(parsed) && parsed > 0 && parsed < 20000) {
      setCalorieGoal(parsed);
      localStorage.setItem('calorieGoal', parsed.toString());
    }
  };

  const caloriePercent = Math.min(100, Math.round((stats.totalCaloriesIn / calorieGoal) * 100));
  const isOverGoal = stats.totalCaloriesIn > calorieGoal;

  const handleAddWater = async (amount) => {
    try {
      const res = await fetch(`${API_URL}/api/water`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount_ml: amount })
      });
      if (res.ok) {
        setWaterToday(prev => Number(prev) + Number(amount));
      }
    } catch (err) {
      console.error('Chyba při ukládání vody:', err);
    }
  };

  const waterPercent = Math.min(100, Math.round((waterToday / waterGoal) * 100));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-32 mb-3" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mb-6">
            <CardHeader className="pb-2"><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent>
              <Skeleton className="h-2 w-full mb-3" />
              <Skeleton className="h-8 w-48" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto p-6">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {justRegistered ? 'Vítej' : 'Vítej zpět'}{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {justRegistered ? 'Pojď si nastavit svůj první den' : 'Tady je tvůj dnešní přehled'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

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

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pitný režim</CardTitle>
            <CardDescription>Dnes vypito: {waterToday} ml / {waterGoal} ml</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-sky-500 transition-all"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handleAddWater(250)}>
                +250 ml
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAddWater(500)}>
                +500 ml
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAddWater(750)}>
                +750 ml
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

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
