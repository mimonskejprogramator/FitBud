import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppNav from './AppNav';

/**
 * Layout komponenta pro autentizované stránky
 * Zobrazuje AppNav a obaluje obsah stránky
 */
function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Ověření tokenu a načtení uživatele
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Dekódování tokenu pro získání uživatelských dat
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch (err) {
      console.error('Chyba při dekódování tokenu:', err);
      navigate('/login');
    }
  }, [navigate]);

  // Skrýt layout na login a register stránkách
  const hideOn = ['/login', '/register'];
  if (hideOn.includes(location.pathname)) {
    return <>{children}</>;
  }

  if (!user) {
    return null; // Nebo loading spinner
  }

  return (
    <>
      <AppNav user={user} />
      <main className="pb-16 md:pb-0">
        {children}
      </main>
    </>
  );
}

export default Layout;

