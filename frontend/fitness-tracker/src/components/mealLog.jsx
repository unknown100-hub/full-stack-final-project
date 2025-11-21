import React, { useMemo, useState } from 'react';
import api from '../lib/api';
import { FOOD_CALORIES, FOOD_NAMES } from '../lib/foods';

const FOOD_LOOKUP = FOOD_NAMES.map((name) => ({ name, lower: name.toLowerCase() }));

const matchFoodKey = (value = '') => {
  const query = value.trim().toLowerCase();
  if (!query) return null;
  const exact = FOOD_LOOKUP.find((entry) => entry.lower === query);
  if (exact) return exact.name;
  const startsWith = FOOD_LOOKUP.find((entry) => entry.lower.startsWith(query));
  if (startsWith) return startsWith.name;
  const contains = FOOD_LOOKUP.find((entry) => entry.lower.includes(query));
  return contains ? contains.name : null;
};

const createFoodItem = () => ({
  foodName: '',
  quantity: 1,
  calories: 0,
  manual: false,
  lookupError: '',
  isFetching: false,
  lookupMeta: null,
  matchedFood: '',
  source: '',
});

const stripClientFields = (items) =>
  items.map(({ isFetching, lookupError, lookupMeta, matchedFood, source, ...rest }) => rest);

const hasKnownCalories = (food) => {
  if (!food?.foodName) return false;
  if (matchFoodKey(food.foodName)) return true;
  return food.source === 'lookup' && food.lookupMeta?.caloriesPerServing;
};

const getSourceLabel = (source) => {
  if (source === 'calorieninjas') return 'CalorieNinjas';
  if (source === 'local-db') return 'local nutrition guide';
  if (source === 'local') return 'built-in list';
  return 'lookup';
};

const MealLog = () => {
  const [mealType, setMealType] = useState('');
  const [foodItems, setFoodItems] = useState(() => [createFoodItem()]);

  const totalCalories = useMemo(
    () => foodItems.reduce((sum, f) => sum + (Number(f.calories) || 0), 0),
    [foodItems],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mealData = { mealType, foodItems: stripClientFields(foodItems) };
    try {
      const response = await api.post('/users/meal', mealData);
      console.log(response.data);
    } catch (err) {
      console.error('Error logging meal', err);
    }
  };

  const updateItem = (index, updater, options = {}) => {
    const { auto = true } = options;
    setFoodItems((prev) => {
      const next = [...prev];
      const current = { ...next[index] };
      const updated =
        typeof updater === 'function' ? updater(current) : { ...current, ...updater };

      if (auto) {
        const matchKey = matchFoodKey(updated.foodName);
        if (!matchKey && updated.source !== 'lookup' && updated.foodName) {
          updated.manual = true;
          updated.matchedFood = '';
        }

        if (!updated.manual && matchKey) {
          const base = FOOD_CALORIES[matchKey] || 0;
          const qty = Number(updated.quantity) || 0;
          updated.calories = Math.round(base * qty);
          updated.matchedFood = matchKey;
          updated.source = 'local';
          updated.lookupMeta = null;
          updated.lookupError = '';
        } else if (
          updated.source === 'lookup' &&
          updated.lookupMeta?.caloriesPerServing
        ) {
          const qty = Number(updated.quantity) || 0;
          updated.calories = Math.round(updated.lookupMeta.caloriesPerServing * qty);
          updated.manual = false;
        }
      }

      next[index] = updated;
      return next;
    });
  };

  const lookupCalories = async (index) => {
    const target = foodItems[index];
    if (!target?.foodName?.trim()) {
      updateItem(
        index,
        { lookupError: 'Enter a food name to look up calories.' },
        { auto: false },
      );
      return;
    }

    updateItem(index, { isFetching: true, lookupError: '' }, { auto: false });
    try {
      const response = await api.get('/users/food-calories', {
        params: { query: target.foodName },
      });
      const { data } = response;
      const qty = Number(target.quantity) || 1;
      const caloriesPerServing = Number(data?.caloriesPerServing) || 0;
      const calories = Math.round(caloriesPerServing * qty);

      updateItem(
        index,
        (cur) => ({
          ...cur,
          calories,
          manual: false,
          matchedFood: data?.name || cur.foodName,
          source: data?.source || 'lookup',
          lookupMeta: {
            servingSizeGrams: data?.servingSizeGrams ?? null,
            caloriesPerServing,
          },
          lookupError: '',
          isFetching: false,
        }),
        { auto: false },
      );
    } catch (err) {
      const msg = err?.response?.data?.msg || 'Could not fetch calories right now.';
      updateItem(index, { lookupError: msg, isFetching: false }, { auto: false });
    }
  };

  const addItem = () => setFoodItems((prev) => [...prev, createFoodItem()]);
  const removeItem = (idx) => setFoodItems((prev) => prev.filter((_, i) => i !== idx));

  const handleFoodBlur = (index) => {
    const food = foodItems[index];
    if (!food?.foodName?.trim()) return;
    const alreadyKnown = matchFoodKey(food.foodName) || food.source === 'lookup';
    if (!alreadyKnown && !food.manual && !food.isFetching) {
      lookupCalories(index);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form" style={{ gap: 12 }}>
      <strong>Log Meal</strong>
      <input
        className="input"
        type="text"
        value={mealType}
        onChange={(e) => setMealType(e.target.value)}
        placeholder="Meal Type (e.g., Breakfast)"
      />

      {foodItems.map((food, index) => (
        <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              display: 'grid',
              gap: 8,
              gridTemplateColumns: '1.2fr 0.5fr 0.8fr 0.65fr 0.85fr auto',
            }}
          >
            <div>
              <input
                className="input"
                list={`food-list-${index}`}
                placeholder="Food (search or type)"
                value={food.foodName}
                onChange={(e) => updateItem(index, { foodName: e.target.value })}
                onBlur={() => handleFoodBlur(index)}
              />
              <datalist id={`food-list-${index}`}>
                {FOOD_NAMES.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            <input
              className="input"
              type="number"
              min="0"
              step="1"
              placeholder="Qty"
              value={food.quantity}
              onChange={(e) => updateItem(index, { quantity: e.target.value })}
            />
            <input
              className={`input ${food.calories <= 0 && food.foodName ? 'zero' : ''}`}
              type="number"
              min="0"
              step="1"
              placeholder={hasKnownCalories(food) ? 'Calories' : 'Enter calories'}
              value={food.calories}
              required={
                !!food.foodName && !hasKnownCalories(food) && Number(food.calories) <= 0
              }
              onChange={(e) =>
                updateItem(index, (cur) => ({ ...cur, calories: Number(e.target.value), manual: true }))
              }
              title="Auto-calculated if food is known; edit to override"
            />
            <button
              type="button"
              className="btn"
              onClick={() => updateItem(index, (cur) => ({ ...cur, manual: false }))}
              disabled={food.isFetching}
            >
              Auto
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => lookupCalories(index)}
              disabled={food.isFetching}
            >
              {food.isFetching ? 'Looking...' : 'Lookup'}
            </button>
            <button type="button" className="btn ghost" onClick={() => removeItem(index)}>
              Remove
            </button>
          </div>
          {food.lookupError ? (
            <span className="hint error">{food.lookupError}</span>
          ) : food.lookupMeta ? (
            <span className="hint">
              Based on{' '}
              {food.lookupMeta.servingSizeGrams ? `${food.lookupMeta.servingSizeGrams}g` : 'one serving'} via{' '}
              {getSourceLabel(food.source)}.
            </span>
          ) : food.source === 'local' && food.matchedFood ? (
            <span className="hint">
              Matched to {food.matchedFood} in the built-in list.
            </span>
          ) : null}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button type="button" className="btn" onClick={addItem}>
          Add Item
        </button>
        <div style={{ marginLeft: 'auto' }}>
          Total calories: <b>{totalCalories}</b>
        </div>
      </div>

      <button type="submit" className="btn primary">
        Log Meal
      </button>
    </form>
  );
};

export default MealLog;
