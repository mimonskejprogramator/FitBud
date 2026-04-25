import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportSleep } from '../utils/exportCSV';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Moon, Plus, Download, Pencil, Trash2, Clock } from 'lucide-react';
import { API_URL } from "@/lib/api";

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

      const response = await fetch(`${API_URL}/api/sleep`, {
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
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/sleep/${id}`, {
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
    return <Loading message="Načítám záznamy spánku..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Moon className="h-8 w-8" />
              Můj spánek
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Celkem {sleepRecords.length} záznamů
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/sleep/add')} className="gap-2">
              <Plus className="h-4 w-4" />
              Přidat záznam
            </Button>
            <Button
              onClick={() => exportSleep(sleepRecords)}
              disabled={sleepRecords.length === 0}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {sleepRecords.length === 0 ? (
          <EmptyState
            title="Zatím žádné záznamy spánku"
            message="Začni sledovat kvalitu svého spánku přidáním prvního záznamu"
            actionText="+ Přidat první záznam"
            onAction={() => navigate('/sleep/add')}
          />
        ) : (
          <>
            {/* Statistiky */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiky za posledních 7 dní</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Průměrná délka</p>
                    <p className="text-3xl font-bold text-primary">
                      {(sleepRecords.slice(0, 7).reduce((sum, r) => sum + parseFloat(r.duration_hours), 0) / Math.min(7, sleepRecords.length)).toFixed(1)}h
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Počet záznamů</p>
                    <p className="text-3xl font-bold">{sleepRecords.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seznam záznamů */}
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-4">
              {sleepRecords.map(record => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">Spánek</CardTitle>
                        <CardDescription className="mt-2">
                          {formatDate(record.sleep_date)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/sleep/edit/${record.id}`)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Upravit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="gap-2">
                              <Trash2 className="h-4 w-4" />
                              Smazat
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Opravdu chceš smazat tento záznam?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tato akce je nevratná. Záznam spánku bude trvale odstraněn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Zrušit</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(record.id)}>
                                Smazat
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Délka
                        </p>
                        <p className="text-3xl font-bold text-primary">{record.duration_hours}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kvalita</p>
                        <p className="text-lg font-semibold">{getQualityLabel(record.quality)}</p>
                      </div>
                    </div>
                    {(record.bedtime || record.wake_time) && (
                      <div className="mt-4 text-sm text-muted-foreground">
                        {record.bedtime && `Usnutí: ${record.bedtime}`}
                        {record.bedtime && record.wake_time && ' • '}
                        {record.wake_time && `Probuzení: ${record.wake_time}`}
                      </div>
                    )}
                    {record.notes && (
                      <p className="mt-4 text-sm text-muted-foreground border-t pt-4">
                        {record.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}

export default Sleep;
