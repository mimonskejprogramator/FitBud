import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportMeals } from '../utils/exportCSV';

function Meals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/meals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se načíst jídla');
      }

      // Seřazení podle data (nejnovější první)
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

  // Funkce pro smazání jídla
  const handleDelete = async (id) => {
    if (!confirm('Opravdu chceš smazat toto jídlo?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/meals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat jídlo');
      }

      // Znovu načíst seznam
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
      <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px', textAlign: 'center' }}>
        <p>Načítám...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0 }}>Moje jídla</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/meals/add')}
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + Přidat jídlo
            </button>
            <button
              onClick={() => exportMeals(meals)}
              disabled={meals.length === 0}
              style={{
                padding: '10px 20px',
                background: meals.length === 0 ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: meals.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              📥 Export CSV
            </button>
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
              Dashboard
            </button>
          </div>
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

        {/* Seznam jídel */}
        {meals.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            <p>Zatím nemáš žádná jídla zaznamenána.</p>
            <button
              onClick={() => navigate('/meals/add')}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Přidat první jídlo
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {meals.map(meal => (
              <div key={meal.id} style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #ddd'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{meal.name}</h3>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <div>
                        <span style={{ color: '#666', fontSize: '14px' }}>Kalorie: </span>
                        <strong style={{ color: '#28a745', fontSize: '18px' }}>{meal.calories} kcal</strong>
                      </div>
                      {meal.protein > 0 && (
                        <div>
                          <span style={{ color: '#666', fontSize: '14px' }}>Bílkoviny: </span>
                          <strong>{meal.protein}g</strong>
                        </div>
                      )}
                      {meal.carbs > 0 && (
                        <div>
                          <span style={{ color: '#666', fontSize: '14px' }}>Sacharidy: </span>
                          <strong>{meal.carbs}g</strong>
                        </div>
                      )}
                      {meal.fats > 0 && (
                        <div>
                          <span style={{ color: '#666', fontSize: '14px' }}>Tuky: </span>
                          <strong>{meal.fats}g</strong>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', color: '#999' }}>
                      {formatDate(meal.meal_date)} {meal.meal_time && `• ${meal.meal_time}`}
                    </div>
                    {meal.notes && (
                      <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '14px' }}>
                        {meal.notes}
                      </p>
                    )}
                  </div>

                  {/* Tlačítka pro akce */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '15px' }}>
                    <button
                      onClick={() => navigate(`/meals/edit/${meal.id}`)}
                      style={{
                        padding: '6px 12px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Upravit
                    </button>
                    <button
                      onClick={() => handleDelete(meal.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Smazat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Meals;