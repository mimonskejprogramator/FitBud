import { useNavigate, useLocation } from 'react-router-dom';

// Jednoduchá navigační lišta - zobrazuje se na všech stránkách
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Skryj navbar na login a register stránkách
  const hideOn = ['/login', '/register'];
  if (hideOn.includes(location.pathname)) {
    return null;
  }

  // Zvýraznění aktivní položky menu
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const navItemStyle = (path) => ({
    padding: '8px 16px',
    background: isActive(path) ? 'rgba(255,255,255,0.2)' : 'transparent',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive(path) ? 'bold' : 'normal',
    textDecoration: 'none'
  });

  return (
    <nav style={{
      background: '#343a40',
      padding: '12px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: '20px',
          cursor: 'pointer',
          letterSpacing: '1px'
        }}
      >
        💪 FitBud
      </div>

      {/* Navigační položky */}
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={navItemStyle('/dashboard')}
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate('/meals')}
          style={navItemStyle('/meals')}
        >
          Jídla
        </button>
        <button
          onClick={() => navigate('/workouts')}
          style={navItemStyle('/workouts')}
        >
          Tréninky
        </button>
        <button
          onClick={() => navigate('/sleep')}
          style={navItemStyle('/sleep')}
        >
          Spánek
        </button>
        <button
          onClick={() => navigate('/stats')}
          style={navItemStyle('/stats')}
        >
          Statistiky
        </button>
      </div>

      {/* Odhlášení */}
      <button
        onClick={handleLogout}
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
        Odhlásit se
      </button>
    </nav>
  );
}

export default Navbar;

