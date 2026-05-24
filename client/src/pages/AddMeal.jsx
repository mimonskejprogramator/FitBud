import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api';

function AddMeal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    meal_date: new Date().toISOString().split('T')[0],
    meal_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
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

    if (!formData.name.trim()) {
      setError('Zadej název jídla');
      return;
    }
    if (!formData.calories || parseInt(formData.calories) <= 0) {
      setError('Zadej platný počet kalorií (musí být větší než 0)');
      return;
    }
    if (!formData.meal_date) {
      setError('Vyber datum');
      return;
    }

    if (formData.protein && parseInt(formData.protein) < 0) {
      setError('Bílkoviny nesmí být záporné číslo');
      return;
    }
    if (formData.carbs && parseInt(formData.carbs) < 0) {
      setError('Sacharidy nesmí být záporné číslo');
      return;
    }
    if (formData.fats && parseInt(formData.fats) < 0) {
      setError('Tuky nesmí být záporné číslo');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/meals`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          calories: parseInt(formData.calories),
          protein: formData.protein ? parseInt(formData.protein) : 0,
          carbs: formData.carbs ? parseInt(formData.carbs) : 0,
          fats: formData.fats ? parseInt(formData.fats) : 0
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se přidat jídlo');
      }

      toast({ title: "Jídlo přidáno", description: "Záznam byl úspěšně uložen." });
      navigate('/meals');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 max-w-2xl">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Utensils className="h-8 w-8" />
              Přidat jídlo
            </h1>
          </div>
          <Button onClick={() => navigate('/meals')} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nové jídlo</CardTitle>
            <CardDescription>Zaznamenej své jídlo a makroživiny</CardDescription>
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
                <Label htmlFor="name">Název jídla *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="např. Snídaně - ovesná kaše"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calories">Kalorie (kcal) *</Label>
                <Input
                  id="calories"
                  name="calories"
                  type="number"
                  value={formData.calories}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="např. 350"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="protein">Bílkoviny (g)</Label>
                  <Input
                    id="protein"
                    name="protein"
                    type="number"
                    value={formData.protein}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbs">Sacharidy (g)</Label>
                  <Input
                    id="carbs"
                    name="carbs"
                    type="number"
                    value={formData.carbs}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fats">Tuky (g)</Label>
                  <Input
                    id="fats"
                    name="fats"
                    type="number"
                    value={formData.fats}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meal_date">Datum *</Label>
                  <Input
                    id="meal_date"
                    name="meal_date"
                    type="date"
                    value={formData.meal_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meal_time">Čas</Label>
                  <Input
                    id="meal_time"
                    name="meal_time"
                    type="time"
                    value={formData.meal_time}
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
                {loading ? 'Přidávám...' : 'Přidat jídlo'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AddMeal;
