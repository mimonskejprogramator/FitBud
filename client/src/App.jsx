import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddMeal from './pages/AddMeal';
import EditMeal from './pages/EditMeal';
import Meals from './pages/Meals';
import AddWorkout from './pages/AddWorkout';
import Workouts from './pages/Workouts';
import AddSleep from './pages/AddSleep';
import Sleep from './pages/Sleep';
import Stats from './pages/Stats';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar se zobrazí na všech stránkách kromě login/register */}
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/meals/add" element={<AddMeal />} />
        <Route path="/meals/edit/:id" element={<EditMeal />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/add" element={<AddWorkout />} />
        <Route path="/sleep" element={<Sleep />} />
        <Route path="/sleep/add" element={<AddSleep />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

