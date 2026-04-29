import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from '../components/EmptyState';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Trash2 } from 'lucide-react';
import { API_URL } from "@/lib/api";

function Weight() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weight, setWeight] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await fetch(`${API_URL}/api/weight`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při načítání');
      setLogs(data.logs);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/weight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ weight_kg: weight, log_date: logDate, notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při ukládání');
      setWeight('');
      setNotes('');
      loadLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/weight/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Mazání selhalo');
      setLogs(logs.filter(l => l.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Card>
            <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
            <CardContent><Skeleton className="h-64 w-full" /></CardContent>
          </Card>
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Data pro graf trendu - zobrazí všechny záznamy v pořadí podle data
  const chartData = {
    labels: logs.map(l => new Date(l.log_date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })),
    datasets: [{
      label: 'Váha (kg)',
      data: logs.map(l => l.weight_kg),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      tension: 0.3
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: false } }
  };

  // Rozdíl od prvního záznamu, pro rychlý přehled trendu
  const diff = logs.length >= 2 ? (logs[logs.length - 1].weight_kg - logs[0].weight_kg).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Váha</h1>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nový záznam</CardTitle>
            <CardDescription>Zapiš svou aktuální váhu, ideálně každé ráno</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="weight">Váha (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1 md:col-span-1">
                <Label htmlFor="notes">Poznámka</Label>
                <Input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="nepovinné"
                />
              </div>
              <Button type="submit" className="w-full">Uložit</Button>
            </form>
          </CardContent>
        </Card>

        {logs.length === 0 ? (
          <EmptyState
            title="Zatím žádné záznamy"
            message="Začni přidáním první váhy ve formuláři výše."
          />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trend</CardTitle>
                {diff !== null && (
                  <CardDescription>
                    Změna od prvního záznamu: {diff > 0 ? '+' : ''}{diff} kg
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Historie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {[...logs].reverse().map(log => (
                    <div key={log.id} className="flex justify-between items-center py-2">
                      <div>
                        <div className="font-medium">{log.weight_kg} kg</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.log_date).toLocaleDateString('cs-CZ')}
                          {log.notes && ` · ${log.notes}`}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(log.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default Weight;

