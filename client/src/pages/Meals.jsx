import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportMeals } from '../utils/exportCSV';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '../components/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Utensils, Plus, Download, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api';

function Meals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const response = await fetch(`${API_URL}/api/meals`, {
        credentials: 'include',
              });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se načíst jídla');
      }

      const sortedMeals = data.meals.sort((a, b) => {
        const dateA = new Date(a.meal_date + ' ' + (a.meal_time || '00:00'));
        const dateB = new Date(b.meal_date + ' ' + (b.meal_time || '00:00'));
        return dateB - dateA;
      });

      setMeals(sortedMeals);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/meals/${id}`, {
        credentials: 'include',
        method: 'DELETE',
              });

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat jídlo');
      }

      toast({ title: "Jídlo smazáno" });
      loadMeals();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ');
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
              <Utensils className="h-8 w-8" />
              Moje jídla
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Celkem {meals.length} záznamů
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/meals/add')} className="gap-2">
              <Plus className="h-4 w-4" />
              Přidat jídlo
            </Button>
            <Button
              onClick={() => exportMeals(meals)}
              disabled={meals.length === 0}
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

        {meals.length === 0 ? (
          <EmptyState
            title="Zatím žádná jídla"
            message="Začni sledovat své stravování přidáním prvního jídla"
            actionText="+ Přidat první jídlo"
            onAction={() => navigate('/meals/add')}
          />
        ) : (
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-4">
              {meals.map(meal => (
                <Card key={meal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{meal.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {formatDate(meal.meal_date)} {meal.meal_time && `• ${meal.meal_time}`}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/meals/edit/${meal.id}`)}
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
                              <AlertDialogTitle>Opravdu chceš smazat toto jídlo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tato akce je nevratná. Jídlo "{meal.name}" bude trvale odstraněno.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Zrušit</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(meal.id)}>
                                Smazat
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Kalorie</p>
                        <p className="text-2xl font-bold text-primary">{meal.calories} kcal</p>
                      </div>
                      {meal.protein > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bílkoviny</p>
                          <p className="text-lg font-semibold">{meal.protein}g</p>
                        </div>
                      )}
                      {meal.carbs > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground">Sacharidy</p>
                          <p className="text-lg font-semibold">{meal.carbs}g</p>
                        </div>
                      )}
                      {meal.fats > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground">Tuky</p>
                          <p className="text-lg font-semibold">{meal.fats}g</p>
                        </div>
                      )}
                    </div>
                    {meal.notes && (
                      <p className="mt-4 text-sm text-muted-foreground border-t pt-4">
                        {meal.notes}
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

export default Meals;
