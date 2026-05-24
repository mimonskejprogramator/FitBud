import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Dumbbell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api';

function EditWorkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    workout_type: 'cardio',
    duration_minutes: '',
    calories_burned: '',
    workout_date: '',
    workout_time: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const loadWorkout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/workouts/${id}`, {
        credentials: 'include',
              });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se načíst trénink');
      }

      const w = data.workout;
      setFormData({
        name: w.name || '',
        workout_type: w.workout_type || 'cardio',
        duration_minutes: w.duration_minutes || '',
        calories_burned: w.calories_burned || '',
        workout_date: w.workout_date || '',
        workout_time: w.workout_time || '',
        notes: w.notes || ''
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/workouts/${id}`, {
        credentials: 'include',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se uložit změny');
      }

      toast({ title: "Trénink upraven", description: "Změny byly úspěšně uloženy." });
      navigate('/workouts');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Načítám...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Dumbbell className="h-8 w-8" />
            Upravit trénink
          </h1>
          <Button onClick={() => navigate('/workouts')} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Úprava tréninku</CardTitle>
            <CardDescription>Změň údaje a ulož je</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Card className="border-destructive">
                  <CardContent className="pt-6">
                    <p className="text-destructive text-sm">{error}</p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Název *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workout_type">Typ tréninku *</Label>
                <Select
                  name="workout_type"
                  value={formData.workout_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, workout_type: value }))}
                  required
                >
                  <SelectTrigger id="workout_type">
                    <SelectValue placeholder="Vyber typ tréninku" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardio">Kardio</SelectItem>
                    <SelectItem value="strength">Posilování</SelectItem>
                    <SelectItem value="flexibility">Protažení</SelectItem>
                    <SelectItem value="sports">Sport</SelectItem>
                    <SelectItem value="other">Jiné</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Délka (min) *</Label>
                  <Input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories_burned">Spálené kcal</Label>
                  <Input
                    id="calories_burned"
                    name="calories_burned"
                    type="number"
                    value={formData.calories_burned}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workout_date">Datum *</Label>
                  <Input
                    id="workout_date"
                    name="workout_date"
                    type="date"
                    value={formData.workout_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workout_time">Čas</Label>
                  <Input
                    id="workout_time"
                    name="workout_time"
                    type="time"
                    value={formData.workout_time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Poznámky</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Ukládám...' : 'Uložit změny'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/workouts')}>
                  Zrušit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EditWorkout;
