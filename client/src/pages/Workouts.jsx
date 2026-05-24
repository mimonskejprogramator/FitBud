import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportWorkouts } from '../utils/exportCSV';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '../components/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dumbbell, Plus, Download, Pencil, Trash2, Clock, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api';

function Workouts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/workouts`, {
        credentials: 'include',
              });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se načíst tréninky');
      }

      const sortedWorkouts = data.workouts.sort((a, b) => {
        const dateA = new Date(a.workout_date + ' ' + (a.workout_time || '00:00'));
        const dateB = new Date(b.workout_date + ' ' + (b.workout_time || '00:00'));
        return dateB - dateA;
      });

      setWorkouts(sortedWorkouts);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/workouts/${id}`, {
        credentials: 'include',
        method: 'DELETE',
              });

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat trénink');
      }

      toast({ title: "Trénink smazán" });
      loadWorkouts();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ');
  };

  const getWorkoutTypeLabel = (type) => {
    const types = {
      'cardio': 'Kardio',
      'strength': 'Posilování',
      'flexibility': 'Protažení',
      'sports': 'Sport',
      'other': 'Jiné'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-1/3" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Dumbbell className="h-8 w-8" />
              Moje tréninky
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Celkem {workouts.length} záznamů
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/workouts/add')} className="gap-2">
              <Plus className="h-4 w-4" />
              Přidat trénink
            </Button>
            <Button
              onClick={() => exportWorkouts(workouts)}
              disabled={workouts.length === 0}
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

        {workouts.length === 0 ? (
          <EmptyState
            title="Zatím žádné tréninky"
            message="Začni sledovat svou aktivitu přidáním prvního tréninku"
            actionText="+ Přidat první trénink"
            onAction={() => navigate('/workouts/add')}
          />
        ) : (
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-4">
              {workouts.map(workout => (
                <Card key={workout.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{workout.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {formatDate(workout.workout_date)} {workout.workout_time && `• ${workout.workout_time}`}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/workouts/edit/${workout.id}`)}
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
                              <AlertDialogTitle>Opravdu chceš smazat tento trénink?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tato akce je nevratná. Trénink "{workout.name}" bude trvale odstraněn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Zrušit</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(workout.id)}>
                                Smazat
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Typ</p>
                        <p className="text-lg font-semibold">{getWorkoutTypeLabel(workout.workout_type) || 'Neuvedeno'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Délka
                        </p>
                        <p className="text-lg font-semibold">{workout.duration_minutes} min</p>
                      </div>
                      {workout.calories_burned && (
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Flame className="h-4 w-4" />
                            Spáleno
                          </p>
                          <p className="text-2xl font-bold text-destructive">{workout.calories_burned} kcal</p>
                        </div>
                      )}
                    </div>
                    {workout.notes && (
                      <p className="mt-4 text-sm text-muted-foreground border-t pt-4">
                        {workout.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

export default Workouts;
