import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Dumbbell } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";

function AddWorkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    workout_type: 'cardio',
    duration_minutes: '',
    calories_burned: '',
    workout_date: new Date().toISOString().split('T')[0],
    workout_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validace vstupů
    if (!formData.name.trim()) {
      setError('Zadej název tréninku');
      return;
    }
    if (!formData.duration_minutes || parseInt(formData.duration_minutes) <= 0) {
      setError('Zadej délku tréninku (musí být větší než 0)');
      return;
    }
    if (parseInt(formData.duration_minutes) > 600) {
      setError('Délka tréninku je příliš velká (max 600 minut)');
      return;
    }
    if (formData.calories_burned && parseInt(formData.calories_burned) < 0) {
      setError('Spálené kalorie nesmí být záporné číslo');
      return;
    }
    if (!formData.workout_date) {
      setError('Vyber datum tréninku');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          duration_minutes: parseInt(formData.duration_minutes),
          calories_burned: formData.calories_burned ? parseInt(formData.calories_burned) : 0
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se přidat trénink');
      }

      toast({ title: "Trénink přidán", description: "Záznam byl úspěšně uložen." });
      navigate('/workouts');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Dumbbell className="h-8 w-8" />
              Přidat trénink
            </h1>
          </div>
          <Button onClick={() => navigate('/workouts')} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět
          </Button>
        </div>

        {/* Formulář */}
        <Card>
          <CardHeader>
            <CardTitle>Nový trénink</CardTitle>
            <CardDescription>Zaznamenej svůj trénink a aktivitu</CardDescription>
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
                <Label htmlFor="name">Název tréninku *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="např. Běh v parku"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workout_type">Typ tréninku *</Label>
                <Select
                  name="workout_type"
                  value={formData.workout_type}
                  onValueChange={(value) => setFormData({...formData, workout_type: value})}
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
                  <Label htmlFor="duration_minutes">Délka (minuty) *</Label>
                  <Input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="např. 30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calories_burned">Spálené kalorie</Label>
                  <Input
                    id="calories_burned"
                    name="calories_burned"
                    type="number"
                    value={formData.calories_burned}
                    onChange={handleChange}
                    min="0"
                    placeholder="volitelné"
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
                  placeholder="Volitelné poznámky..."
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Přidávám...' : 'Přidat trénink'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AddWorkout;

