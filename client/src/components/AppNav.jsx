import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Home, Utensils, Dumbbell, Moon, BarChart3, Scale, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logoutRequest } from '@/lib/api';

function AppNav({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [waterGoal, setWaterGoal] = useState(2500);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    await logoutRequest();
    navigate('/login');
  };

  const handleSaveSettings = () => {
    localStorage.setItem('calorieGoal', calorieGoal);
    localStorage.setItem('waterGoal', waterGoal);
    window.dispatchEvent(new Event('settings-updated'));
    toast({
      title: "Nastavení uloženo",
      description: `Kalorie: ${calorieGoal} kcal · Voda: ${waterGoal} ml`,
    });
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    const savedCal = localStorage.getItem('calorieGoal');
    if (savedCal) {
      setCalorieGoal(parseInt(savedCal));
    }
    const savedWater = localStorage.getItem('waterGoal');
    if (savedWater) {
      setWaterGoal(parseInt(savedWater));
    }
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/meals', label: 'Jídla', icon: Utensils },
    { path: '/workouts', label: 'Tréninky', icon: Dumbbell },
    { path: '/sleep', label: 'Spánek', icon: Moon },
    { path: '/weight', label: 'Váha', icon: Scale },
    { path: '/stats', label: 'Statistiky', icon: BarChart3 },
  ];

  return (
    <div className="bg-card border-b px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
          aria-label="Přejít na dashboard"
        >
          FitBud
        </button>
        <nav className="hidden md:flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {user?.name || user?.email}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          aria-label="Přepnout téma"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Nastavení</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Nastavení</SheetTitle>
              <SheetDescription>
                Upravte své cíle a preference
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calorieGoal">Cílový denní příjem kalorií</Label>
                <Input
                  id="calorieGoal"
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Doporučený příjem pro udržení váhy
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="waterGoal">Cílový denní příjem vody (ml)</Label>
                <Input
                  id="waterGoal"
                  type="number"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Doporučeno 2000–3000 ml denně
                </p>
              </div>
              <Button onClick={handleSaveSettings} className="w-full">
                Uložit nastavení
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
        >
          Odhlásit
        </Button>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t px-4 py-2 flex justify-around z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex-col h-auto py-2 px-3"
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}

export default AppNav;
