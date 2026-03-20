import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Home, Utensils, Dumbbell, Moon, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

function AppNav({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSaveSettings = () => {
    localStorage.setItem('calorieGoal', calorieGoal);
    toast({
      title: "Nastavení uloženo",
      description: `Cílový příjem kalorií: ${calorieGoal} kcal`,
    });
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('calorieGoal');
    if (saved) {
      setCalorieGoal(parseInt(saved));
    }
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/meals', label: 'Jídla', icon: Utensils },
    { path: '/workouts', label: 'Tréninky', icon: Dumbbell },
    { path: '/sleep', label: 'Spánek', icon: Moon },
    { path: '/stats', label: 'Statistiky', icon: BarChart3 },
  ];

  return (
    <div className="bg-card border-b px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold text-primary">FitBud</h1>
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

      {/* Mobile Navigation */}
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

