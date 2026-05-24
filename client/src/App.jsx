import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';

import Meals from './pages/Meals';
import AddMeal from './pages/AddMeal';
import EditMeal from './pages/EditMeal';

import Workouts from './pages/Workouts';
import AddWorkout from './pages/AddWorkout';
import EditWorkout from './pages/EditWorkout';

import Sleep from './pages/Sleep';
import AddSleep from './pages/AddSleep';
import EditSleep from './pages/EditSleep';

import Weight from './pages/Weight';

import Layout from './components/Layout';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stats" element={<Stats />} />

        <Route path="/meals" element={<Meals />} />
        <Route path="/meals/add" element={<AddMeal />} />
        <Route path="/meals/edit/:id" element={<EditMeal />} />

        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/add" element={<AddWorkout />} />
        <Route path="/workouts/edit/:id" element={<EditWorkout />} />

        <Route path="/sleep" element={<Sleep />} />
        <Route path="/sleep/add" element={<AddSleep />} />
        <Route path="/sleep/edit/:id" element={<EditSleep />} />

        <Route path="/weight" element={<Weight />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
