import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function EditWorkout() {
  const navigate = useNavigate();
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
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/workouts/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se načíst trénink');
      }

      // Naplnění formuláře existujícími daty
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/workouts/${id}`, {
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

      navigate('/workouts');
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
          <h1 style={{ margin: 0 }}>Upravit trénink</h1>
          <button onClick={() => navigate('/workouts')} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Název *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Typ tréninku *</label>
            <select name="workout_type" value={formData.workout_type} onChange={handleChange} required style={inputStyle}>
              <option value="cardio">Kardio</option>
              <option value="strength">Posilování</option>
              <option value="flexibility">Protažení</option>
              <option value="sports">Sport</option>
              <option value="other">Jiné</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Délka (min) *</label>
              <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} required min="1" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Spálené kcal</label>
              <input type="number" name="calories_burned" value={formData.calories_burned} onChange={handleChange} min="0" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Datum *</label>
              <input type="date" name="workout_date" value={formData.workout_date} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Čas</label>
              <input type="time" name="workout_time" value={formData.workout_time} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Poznámky</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: saving ? '#ccc' : '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
              {saving ? 'Ukládám...' : 'Uložit změny'}
            </button>
            <button type="button" onClick={() => navigate('/workouts')} style={{ padding: '12px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditWorkout;

