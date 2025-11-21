import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const MealsList = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/meals');
        setMeals(res.data.meals || []);
      } catch (e) {
        setError(e?.response?.data?.msg || 'Failed to load meals');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <div>Loading meals…</div>;
  if (error) return <div style={{ color: 'crimson' }}>{error}</div>;

  return (
    <div>
      <strong>Meals</strong>
      {meals.length === 0 ? (
        <div>No meals yet.</div>
      ) : (
        <ul style={{ paddingLeft: 16 }}>
          {meals.map((m, i) => (
            <li key={i}>
              <div><b>{m.mealType || 'Meal'}</b> — {new Date(m.date || Date.now()).toLocaleString()}</div>
              {Array.isArray(m.foodItems) && m.foodItems.length > 0 && (
                <ul>
                  {m.foodItems.map((f, j) => (
                    <li key={j}>
                      {f.foodName} — {f.calories} cal
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MealsList;
