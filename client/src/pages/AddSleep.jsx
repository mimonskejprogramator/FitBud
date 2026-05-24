import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api';

function AddSleep() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    sleep_date: new Date().toISOString().split('T')[0],
    bedtime: '',
    wake_time: '',
    duration_hours: '',
    quality: 'good',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDuration = () => {
    if (formData.bedtime && formData.wake_time) {
      const bedtime = new Date(`2000-01-01 ${formData.bedtime}`);
      let wakeTime = new Date(`2000-01-01 ${formData.wake_time}`);

      if (wakeTime < bedtime) {
        wakeTime = new Date(`2000-01-02 ${formData.wake_time}`);
      }

      const diff = wakeTime - bedtime;
      const hours = (diff / (1000 * 60 * 60)).toFixed(1);

      setFormData(prev => ({
        ...prev,
        duration_hours: hours
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.sleep_date) {
      setError('Vyber datum spánku');
      return;
    }
    if (!formData.duration_hours || parseFloat(formData.duration_hours) <= 0) {
      setError('Zadej délku spánku (musí být větší než 0)');
      return;
    }
    if (parseFloat(formData.duration_hours) > 24) {
      setError('Délka spánku nemůže být více než 24 hodin');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        duration_hours: parseFloat(formData.duration_hours)
      };

      const response = await fetch(`${API_URL}/api/sleep`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se uložit záznam');
      }

      toast({ title: "Spánek přidán", description: "Záznam byl úspěšně uložen." });
      navigate('/sleep');
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
              <Moon className="h-8 w-8" />
              Přidat záznam spánku
            </h1>
          </div>
          <Button onClick={() => navigate('/sleep')} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nový záznam spánku</CardTitle>
            <CardDescription>Zaznamenej svůj spánek a jeho kvalitu</CardDescription>
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
                <Label htmlFor="sleep_date">Datum *</Label>
                <Input
                  id="sleep_date"
                  name="sleep_date"
                  type="date"
                  value={formData.sleep_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedtime">Čas usnutí</Label>
                  <Input
                    id="bedtime"
                    name="bedtime"
                    type="time"
                    value={formData.bedtime}
                    onChange={handleChange}
                    onBlur={calculateDuration}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wake_time">Čas probuzení</Label>
                  <Input
                    id="wake_time"
                    name="wake_time"
                    type="time"
                    value={formData.wake_time}
                    onChange={handleChange}
                    onBlur={calculateDuration}
                  />
                  <p className="text-xs text-muted-foreground">
                    Délka spánku se vypočítá automaticky
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_hours">Délka spánku (hodiny) *</Label>
                <Input
                  id="duration_hours"
                  name="duration_hours"
                  type="number"
                  value={formData.duration_hours}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="24"
                  required
                  placeholder="např. 7.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">Kvalita spánku *</Label>
                <Select
                  name="quality"
                  value={formData.quality}
                  onValueChange={(value) => setFormData({...formData, quality: value})}
                  required
                >
                  <SelectTrigger id="quality">
                    <SelectValue placeholder="Vyber kvalitu spánku" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Výborná</SelectItem>
                    <SelectItem value="good">Dobrá</SelectItem>
                    <SelectItem value="fair">Průměrná</SelectItem>
                    <SelectItem value="poor">Špatná</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Poznámky</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Např. probuzení v noci, sny..."
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Ukládám...' : 'Uložit záznam'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AddSleep;
