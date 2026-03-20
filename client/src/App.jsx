import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Autentizace
import Login from './pages/Login';
import Register from './pages/Register';

// Hlavní stránky
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';

// Jídla
import Meals from './pages/Meals';
import AddMeal from './pages/AddMeal';
import EditMeal from './pages/EditMeal';

// Tréninky
import Workouts from './pages/Workouts';
import AddWorkout from './pages/AddWorkout';
import EditWorkout from './pages/EditWorkout';

// Spánek
import Sleep from './pages/Sleep';
import AddSleep from './pages/AddSleep';
import EditSleep from './pages/EditSleep';

// Komponenty
import Layout from './components/Layout';
import { Toaster } from "@/components/ui/toaster";

/**
 * Hlavní komponenta aplikace FitBud
 * Obsahuje routing pro všechny stránky
 */
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
        {/* Autentizace */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard a statistiky */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stats" element={<Stats />} />

        {/* Jídla - CRUD operace */}
        <Route path="/meals" element={<Meals />} />
        <Route path="/meals/add" element={<AddMeal />} />
        <Route path="/meals/edit/:id" element={<EditMeal />} />

        {/* Tréninky - CRUD operace */}
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/add" element={<AddWorkout />} />
        <Route path="/workouts/edit/:id" element={<EditWorkout />} />

        {/* Spánek - CRUD operace */}
        <Route path="/sleep" element={<Sleep />} />
        <Route path="/sleep/add" element={<AddSleep />} />
        <Route path="/sleep/edit/:id" element={<EditSleep />} />

        {/* Výchozí přesměrování na login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

