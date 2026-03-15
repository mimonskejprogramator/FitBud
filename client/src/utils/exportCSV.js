// Pomocné funkce pro export dat do CSV formátu

// Převod pole objektů na CSV string
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Hlavička CSV
  const headerRow = headers.join(',');
  
  // Řádky s daty
  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header] || '';
      // Escapování hodnot s čárkami nebo uvozovkami
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [headerRow, ...rows].join('\n');
};

// Stažení CSV souboru
export const downloadCSV = (csvContent, filename) => {
  // Přidání BOM pro správné zobrazení češtiny v Excelu
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

// Export jídel
export const exportMeals = (meals) => {
  const headers = ['name', 'calories', 'protein', 'carbs', 'fats', 'meal_date', 'meal_time', 'notes'];
  const csvContent = convertToCSV(meals, headers);
  const filename = `fitbud_jidla_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
};

// Export tréninků
export const exportWorkouts = (workouts) => {
  const headers = ['name', 'workout_type', 'duration_minutes', 'calories_burned', 'workout_date', 'workout_time', 'notes'];
  const csvContent = convertToCSV(workouts, headers);
  const filename = `fitbud_treninky_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
};

// Export spánku
export const exportSleep = (sleepRecords) => {
  const headers = ['sleep_date', 'bedtime', 'wake_time', 'duration_hours', 'quality', 'notes'];
  const csvContent = convertToCSV(sleepRecords, headers);
  const filename = `fitbud_spanek_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
};

// Export všech dat najednou
export const exportAllData = async (token) => {
  try {
    // Načtení všech dat
    const [mealsRes, workoutsRes, sleepRes] = await Promise.all([
      fetch('http://localhost:3000/api/meals', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('http://localhost:3000/api/workouts', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('http://localhost:3000/api/sleep', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);

    const mealsData = await mealsRes.json();
    const workoutsData = await workoutsRes.json();
    const sleepData = await sleepRes.json();

    // Export každé kategorie
    if (mealsData.meals && mealsData.meals.length > 0) {
      exportMeals(mealsData.meals);
    }
    
    // Malá pauza mezi staženími
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

