import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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

      const response = await fetch(`http://localhost:3000/api/sleep/${id}`, {
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
      const response = await fetch(`http://localhost:3000/api/sleep/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
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
    return <div style={{ padding: '40px', textAlign: 'center' }}><p>Načítám...</p></div>;
  }

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>Upravit záznam spánku</h1>
          <button onClick={() => navigate('/sleep')} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Zpět
          </button>
        </div>

        {error && (
          <div style={{ padding: '15px', marginBottom: '20px', background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Datum *</label>
            <input type="date" name="sleep_date" value={formData.sleep_date} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Čas usnutí</label>
              <input type="time" name="bedtime" value={formData.bedtime} onChange={handleChange} onBlur={calculateDuration} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Čas probuzení</label>
              <input type="time" name="wake_time" value={formData.wake_time} onChange={handleChange} onBlur={calculateDuration} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Délka spánku (hodiny) *</label>
            <input type="number" name="duration_hours" value={formData.duration_hours} onChange={handleChange} step="0.1" min="0" max="24" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Kvalita spánku *</label>
            <select name="quality" value={formData.quality} onChange={handleChange} required style={inputStyle}>
              <option value="excellent">Výborná</option>
              <option value="good">Dobrá</option>
              <option value="fair">Průměrná</option>
              <option value="poor">Špatná</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Poznámky</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: saving ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
              {saving ? 'Ukládám...' : 'Uložit změny'}
            </button>
            <button type="button" onClick={() => navigate('/sleep')} style={{ padding: '12px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSleep;

