import React, { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const CalorieSummary = () => {
  const [fitness, setFitness] = useState([]);
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const [f, m] = await Promise.all([
          api.get('/users/fitness'),
          api.get('/users/meals')
        ]);
        setFitness(Array.isArray(f.data.fitnessData) ? f.data.fitnessData : []);
        setMeals(Array.isArray(m.data.meals) ? m.data.meals : []);
      } catch (e) {
        setError(e?.response?.data?.msg || 'Failed to load summary');
      }
    };
    run();
  }, []);

  const now = new Date();
  const todayStart = startOfDay(now).getTime();
  const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  weekStart.setHours(0, 0, 0, 0);

  const compute = useMemo(() => {
    const sumFitness = (fromTs) =>
      fitness.filter(e => new Date(e.date).getTime() >= fromTs)
             .reduce((s, e) => s + (Number(e.caloriesBurned) || 0), 0);

    const sumMeals = (fromTs) =>
      meals.filter(m => new Date(m.date).getTime() >= fromTs)
           .reduce((s, m) => s + (Array.isArray(m.foodItems) ? m.foodItems.reduce((a, fi) => a + (Number(fi.calories) || 0), 0) : 0), 0);

    const todayBurn = sumFitness(todayStart);
    const todayEat = sumMeals(todayStart);
    const weekBurn = sumFitness(weekStart.getTime());
    const weekEat = sumMeals(weekStart.getTime());

    return {
      today: { burn: todayBurn, eat: todayEat, net: todayBurn - todayEat },
      week: { burn: weekBurn, eat: weekEat, net: weekBurn - weekEat },
    };
  }, [fitness, meals]);

  if (error) return <div className="message error">{error}</div>;

  return (
    <div className="grid-2">
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Today</div>
        <div>Burned: <b data-testid="today-burn">{compute.today.burn}</b> cal</div>
        <div>Intake: <b data-testid="today-intake">{compute.today.eat}</b> cal</div>
        <div>Net: <b data-testid="today-net" style={{ color: compute.today.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>{compute.today.net}</b> cal</div>
      </div>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Last 7 Days</div>
        <div>Burned: <b data-testid="week-burn">{compute.week.burn}</b> cal</div>
        <div>Intake: <b data-testid="week-intake">{compute.week.eat}</b> cal</div>
        <div>Net: <b data-testid="week-net" style={{ color: compute.week.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>{compute.week.net}</b> cal</div>
      </div>
    </div>
  );
};

export default CalorieSummary;
