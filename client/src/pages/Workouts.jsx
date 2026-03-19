import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportWorkouts } from '../utils/exportCSV';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

function Workouts() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/workouts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodařilo se načíst tréninky');
      }

      // Seřazení podle data
      const sortedWorkouts = data.workouts.sort((a, b) => {
        const dateA = new Date(a.workout_date + ' ' + (a.workout_time || '00:00'));
        const dateB = new Date(b.workout_date + ' ' + (b.workout_time || '00:00'));
        return dateB - dateA;
      });

      setWorkouts(sortedWorkouts);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Opravdu chceš smazat tento trénink?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/workouts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat trénink');
      }

      loadWorkouts();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ');
  };

  // Překlad typu tréninku
  const getWorkoutTypeLabel = (type) => {
    const types = {
      'cardio': 'Kardio',
      'strength': 'Posilování',
      'flexibility': 'Protažení',
      'sports': 'Sport',
      'other': 'Jiné'
    };
    return types[type] || type;
  };

  if (loading) {
    return <Loading message="Načítám tréninky..." />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0 }}>Moje tréninky</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/workouts/add')}
              style={{
                padding: '10px 20px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + Přidat trénink
            </button>
            <button
              onClick={() => exportWorkouts(workouts)}
              disabled={workouts.length === 0}
              style={{
                padding: '10px 20px',
                background: workouts.length === 0 ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: workouts.length === 0 ? 'not-allowed' : 'pointer',
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

        {workouts.length === 0 ? (
          <EmptyState
            icon="💪"
            title="Zatím žádné tréninky"
            message="Začni sledovat svou aktivitu přidáním prvního tréninku"
            actionText="+ Přidat první trénink"
            onAction={() => navigate('/workouts/add')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {workouts.map(workout => (
              <div
                key={workout.id}
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #ddd'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                      {workout.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <div>
                        <span style={{ color: '#666', fontSize: '14px' }}>Typ: </span>
                        <span style={{
                          background: '#dc3545',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          display: 'inline-block',
                          minWidth: '60px'
                        }}>
                          {getWorkoutTypeLabel(workout.workout_type) || 'Neuvedeno'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#666', fontSize: '14px' }}>Délka: </span>
                        <strong>{workout.duration_minutes} min</strong>
                      </div>
                      {workout.calories_burned && (
                        <div>
                          <span style={{ color: '#666', fontSize: '14px' }}>Spáleno: </span>
                          <strong style={{ color: '#dc3545' }}>{workout.calories_burned} kcal</strong>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', color: '#999' }}>
                      {formatDate(workout.workout_date)}
                      {workout.workout_time && ` • ${workout.workout_time}`}
                    </div>
                    {workout.notes && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: '#f8f9fa',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        {workout.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                    <button
                      onClick={() => navigate(`/workouts/edit/${workout.id}`)}
                      style={{
                        padding: '8px 16px',
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
                      onClick={() => handleDelete(workout.id)}
                      style={{
                        padding: '8px 16px',
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

export default Workouts;
