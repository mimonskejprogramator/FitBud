import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppNav from './AppNav';
import { fetchCurrentUser } from '@/lib/api';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  const hideOn = ['/login', '/register'];
  const isPublic = hideOn.includes(location.pathname);

  useEffect(() => {
    if (isPublic) return;

    let cancelled = false;
    (async () => {
      const u = await fetchCurrentUser();
      if (cancelled) return;
      if (!u) {
        navigate('/login');
        return;
      }
      setUser(u);
    })();
    return () => { cancelled = true; };
  }, [navigate, isPublic, location.pathname]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
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
