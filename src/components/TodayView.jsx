import React from 'react';
import DayCard from './DayCard';
import NutritionDashboard from './NutritionDashboard';

export default function TodayView({ weeklyData, updateDish, removeDish, addDish, moveDish, goals, updateGoal, updateMealMacros }) {
  // Get current day id (e.g. 'mon', 'tue')
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayIndex = new Date().getDay();
  const currentDayId = days[todayIndex];

  const dayNames = {
    'mon': 'Segunda',
    'tue': 'Terça',
    'wed': 'Quarta',
    'thu': 'Quinta',
    'fri': 'Sexta',
    'sat': 'Sábado',
    'sun': 'Domingo'
  };

  const dayData = weeklyData[currentDayId] || {};

  return (
    <div style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* Left Column: Today's Meals */}
      <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
        <DayCard 
          dayId={currentDayId}
          dayName={`Hoje (${dayNames[currentDayId]})`}
          data={dayData}
          updateDish={updateDish}
          removeDish={removeDish}
          addDish={addDish}
          moveDish={moveDish}
          updateMealMacros={updateMealMacros}
          showDessertDrinks={true}
        />
      </div>

      {/* Right Column: Nutrition Dashboard */}
      <div style={{ flex: '0 0 320px', minWidth: '300px', alignSelf: 'stretch' }}>
        <NutritionDashboard dailyDishes={dayData} goals={goals} updateGoal={updateGoal} />
      </div>
    </div>
  );
}
