import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddSleep() {
  const navigate = useNavigate();
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

  // Automatický výpočet délky spánku
  const calculateDuration = () => {
    if (formData.bedtime && formData.wake_time) {
      const bedtime = new Date(`2000-01-01 ${formData.bedtime}`);
      let wakeTime = new Date(`2000-01-01 ${formData.wake_time}`);
      
      // Pokud je čas probuzení menší než čas usnutí, přičti den
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
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Validace
      if (!formData.sleep_date || !formData.duration_hours) {
        throw new Error('Vyplň datum a délku spánku');
      }

      const response = await fetch('http://localhost:3000/api/sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se uložit záznam');
      }

      // Přesměrování na seznam
      navigate('/sleep');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0 }}>Přidat záznam spánku</h1>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Zpět
          </button>
        </div>

        {error && (
          <div style={{
            padding: '15px',
            marginBottom: '20px',
            background: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          background: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {/* Datum */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Datum *
            </label>
            <input
              type="date"
              name="sleep_date"
              value={formData.sleep_date}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Čas usnutí */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Čas usnutí
            </label>
            <input
              type="time"
              name="bedtime"
              value={formData.bedtime}
              onChange={handleChange}
              onBlur={calculateDuration}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Čas probuzení */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Čas probuzení
            </label>
            <input
              type="time"
              name="wake_time"
              value={formData.wake_time}
              onChange={handleChange}
              onBlur={calculateDuration}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Délka spánku se vypočítá automaticky
            </small>
          </div>

          {/* Délka spánku */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Délka spánku (hodiny) *
            </label>
            <input
              type="number"
              name="duration_hours"
              value={formData.duration_hours}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="24"
              required
              placeholder="např. 7.5"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Kvalita spánku */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Kvalita spánku *
            </label>
            <select
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              <option value="excellent">Výborná</option>
              <option value="good">Dobrá</option>
              <option value="fair">Průměrná</option>
              <option value="poor">Špatná</option>
            </select>
          </div>

          {/* Poznámky */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Poznámky
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Např. probuzení v noci, sny..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Tlačítka */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Ukládám...' : 'Uložit záznam'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '12px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSleep;

