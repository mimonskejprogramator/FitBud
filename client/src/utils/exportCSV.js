import { API_URL } from '../lib/api';

export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) {
    return '';
  }

  const headerRow = headers.join(',');

  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header] || '';

      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [headerRow, ...rows].join('\n');
};

export const downloadCSV = (csvContent, filename) => {

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportMeals = (meals) => {
  if (!meals || meals.length === 0) {
    alert('Žádná data k exportu');
    return;
  }
  const headers = ['name', 'calories', 'protein', 'carbs', 'fats', 'meal_date', 'meal_time', 'notes'];
  const csvContent = convertToCSV(meals, headers);
  const filename = `fitbud_jidla_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
};

export const exportWorkouts = (workouts) => {
  if (!workouts || workouts.length === 0) {
    alert('Žádná data k exportu');
    return;
  }
  const headers = ['name', 'workout_type', 'duration_minutes', 'calories_burned', 'workout_date', 'workout_time', 'notes'];
  const csvContent = convertToCSV(workouts, headers);
  const filename = `fitbud_treninky_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
};

export const exportSleep = (sleepRecords) => {
  if (!sleepRecords || sleepRecords.length === 0) {
    alert('Žádná data k exportu');
    return;
  }
  const headers = ['sleep_date', 'bedtime', 'wake_time', 'duration_hours', 'quality', 'notes'];
  const csvContent = convertToCSV(sleepRecords, headers);
  const filename = `fitbud_spanek_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
};

export const exportAllData = async () => {
  try {

    const [mealsRes, workoutsRes, sleepRes] = await Promise.all([
      fetch(`${API_URL}/api/meals`, {
        credentials: 'include', headers: { } }),
      fetch(`${API_URL}/api/workouts`, {
        credentials: 'include', headers: { } }),
      fetch(`${API_URL}/api/sleep`, {
        credentials: 'include', headers: { } })
    ]);

    const mealsData = await mealsRes.json();
    const workoutsData = await workoutsRes.json();
    const sleepData = await sleepRes.json();

    if (mealsData.meals && mealsData.meals.length > 0) {
      exportMeals(mealsData.meals);
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    if (workoutsData.workouts && workoutsData.workouts.length > 0) {
      exportWorkouts(workoutsData.workouts);
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    if (sleepData.sleep && sleepData.sleep.length > 0) {
      exportSleep(sleepData.sleep);
    }

    return { success: true, message: 'Data byla úspěšně exportována' };
  } catch (error) {
    console.error('Chyba při exportu:', error);
    return { success: false, message: 'Nepodařilo se exportovat data' };
  }
};
