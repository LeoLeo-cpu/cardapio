import React from 'react';
import DayCard from './DayCard';

const DAYS = [
  { id: 'mon', name: 'Segunda' },
  { id: 'tue', name: 'Terça' },
  { id: 'wed', name: 'Quarta' },
  { id: 'thu', name: 'Quinta' },
  { id: 'fri', name: 'Sexta' },
  { id: 'sat', name: 'Sábado' },
  { id: 'sun', name: 'Domingo' }
];

export default function WeeklyGrid({ weeklyData, updateDish, removeDish, addDish, moveDish, addDrink, updateDrink, removeDrink, updateMealMacros }) {
  return (
    <main style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
      {DAYS.map(day => (
        <DayCard
          key={day.id}
          dayId={day.id}
          dayName={day.name}
          data={weeklyData[day.id] || {}}
          updateDish={updateDish}
          removeDish={removeDish}
          addDish={addDish}
          moveDish={moveDish}
          addDrink={addDrink}
          updateDrink={updateDrink}
          removeDrink={removeDrink}
          updateMealMacros={updateMealMacros}
        />
      ))}
    </main>
  );
}
