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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { exportAllData } from '../utils/exportCSV';
import { Skeleton } from '@/components/ui/skeleton';
import { API_URL } from '@/lib/api';

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
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const loadAllData = async () => {
    try {
      const [mealsRes, workoutsRes, sleepRes] = await Promise.all([
        fetch(`${API_URL}/api/meals`, {
        credentials: 'include', headers: { } }),
        fetch(`${API_URL}/api/workouts`, {
        credentials: 'include', headers: { } }),
        fetch(`${API_URL}/api/sleep`, {
        credentials: 'include', headers: { } })
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

  const dayLabels = last7Days.map(d => {
    return new Date(d).toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric' });
  });

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

  const sleepData = last7Days.map(day => {
    const record = sleepRecords.find(s => s.sleep_date === day);
    return record ? parseFloat(record.duration_hours) : 0;
  });

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

  const tickColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: tickColor } }
    },
    scales: {
      x: { ticks: { color: tickColor }, grid: { color: gridColor } },
      y: { beginAtZero: true, ticks: { color: tickColor }, grid: { color: gridColor } }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto p-6 space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
          <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  const handleExportAll = async () => {
    setExportMessage('');
    const result = await exportAllData();
    setExportMessage(result.message);
    setTimeout(() => setExportMessage(''), 5000);
  };

  const hasNoData = meals.length === 0 && workouts.length === 0 && sleepRecords.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold">Statistiky a grafy</h1>
          <Button onClick={handleExportAll} disabled={hasNoData}>
            Exportovat všechna data
          </Button>
        </div>

        {error && (
          <Card className="border-destructive mb-4">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {exportMessage && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <p className="text-sm">{exportMessage}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Celkem přijato</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalCaloriesIn}</div>
              <p className="text-xs text-muted-foreground mt-1">kcal celkem</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Celkem spáleno</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{totalCaloriesOut}</div>
              <p className="text-xs text-muted-foreground mt-1">kcal celkem</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Průměrný spánek</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{avgSleep}h</div>
              <p className="text-xs text-muted-foreground mt-1">za všechny záznamy</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Kalorie za posledních 7 dní</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={caloriesChartData} options={chartOptions} />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Délka spánku za posledních 7 dní</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={sleepChartData} options={{
              ...chartOptions,
              scales: {
                x: { ticks: { color: tickColor }, grid: { color: gridColor } },
                y: { beginAtZero: true, max: 12, ticks: { color: tickColor }, grid: { color: gridColor }, title: { display: true, text: 'Hodiny', color: tickColor } }
              }
            }} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Počty záznamů</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between px-3 py-2 bg-muted rounded">
                <span>Jídla celkem</span>
                <strong>{meals.length}</strong>
              </div>
              <div className="flex justify-between px-3 py-2 bg-muted rounded">
                <span>Tréninky celkem</span>
                <strong>{workouts.length}</strong>
              </div>
              <div className="flex justify-between px-3 py-2 bg-muted rounded">
                <span>Záznamy spánku</span>
                <strong>{sleepRecords.length}</strong>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Typy tréninků</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['cardio', 'strength', 'flexibility', 'sports', 'other'].map(type => {
                const count = workouts.filter(w => w.workout_type === type).length;
                const labels = { cardio: 'Kardio', strength: 'Posilování', flexibility: 'Protažení', sports: 'Sport', other: 'Jiné' };
                return count > 0 ? (
                  <div key={type} className="flex justify-between px-3 py-2 bg-muted rounded">
                    <span>{labels[type]}</span>
                    <strong>{count}x</strong>
                  </div>
                ) : null;
              })}
              {workouts.length === 0 && (
                <p className="text-sm text-muted-foreground">Zatím žádné tréninky</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Stats;
