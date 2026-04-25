import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Moon } from 'lucide-react';
import { API_URL } from "@/lib/api";

function EditSleep() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    sleep_date: '',
    bedtime: '',
    wake_time: '',
    duration_hours: '',
    quality: 'good',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecord();
  }, [id]);

  const loadRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/sleep/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se načíst záznam');
      }

      const s = data.sleep;
      setFormData({
        sleep_date: s.sleep_date || '',
        bedtime: s.bedtime || '',
        wake_time: s.wake_time || '',
        duration_hours: s.duration_hours || '',
        quality: s.quality || 'good',
        notes: s.notes || ''
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

  // Automatický výpočet délky spánku
  const calculateDuration = () => {
    if (formData.bedtime && formData.wake_time) {
      const bedtime = new Date(`2000-01-01 ${formData.bedtime}`);
      let wakeTime = new Date(`2000-01-01 ${formData.wake_time}`);
      if (wakeTime < bedtime) {
        wakeTime = new Date(`2000-01-02 ${formData.wake_time}`);
      }
      const hours = ((wakeTime - bedtime) / (1000 * 60 * 60)).toFixed(1);
      setFormData(prev => ({ ...prev, duration_hours: hours }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');

      // Převod duration_hours na číslo
      const dataToSend = {
        ...formData,
        duration_hours: parseFloat(formData.duration_hours)
      };

      const response = await fetch(`${API_URL}/api/sleep/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se uložit změny');
      }

      navigate('/sleep');
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
            <Moon className="h-8 w-8" />
            Upravit záznam spánku
          </h1>
          <Button onClick={() => navigate('/sleep')} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Úprava záznamu</CardTitle>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">Kvalita spánku *</Label>
                <Select
                  name="quality"
                  value={formData.quality}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, quality: value }))}
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
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Ukládám...' : 'Uložit změny'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/sleep')}>
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

export default EditSleep;

