import React, { useState } from 'react';
import api from '../lib/api';

const FitnessForm = () => {
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState(0); // minutes
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [distance, setDistance] = useState(0); // km
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = {
        activityType,
        duration: Number(duration) || 0,
        caloriesBurned: Number(caloriesBurned) || 0,
        distance: Number(distance) || 0,
      };
      const res = await api.post('/users/fitness', payload);
      setMessage(`Saved: ${payload.activityType} — ${payload.duration} min, ${payload.caloriesBurned} cal, ${payload.distance} km`);
      setActivityType('');
      setDuration(0);
      setCaloriesBurned(0);
      setDistance(0);
      console.log(res.data);
    } catch (err) {
      setMessage(err?.response?.data?.msg || 'Error saving fitness entry');
    }
  };

  return (
    <form onSubmit={submit} className="form" style={{ display: 'grid', gap: 12 }}>
      <strong>Log Fitness</strong>
      <input
        className="input"
        list="activity-list"
        value={activityType}
        onChange={(e) => setActivityType(e.target.value)}
        placeholder="Activity (e.g., Running)"
        required
      />
      <datalist id="activity-list">
        {['Running', 'Walking', 'Cycling', 'Swimming', 'Rowing', 'Hiking', 'Yoga', 'Strength Training'].map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>
      <div className="grid-2">
        <input
          className={`input ${Number(duration) === 0 ? 'zero' : ''}`}
          type="number"
          min="0"
          step="1"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (minutes)"
          required
        />
        <input
          className={`input ${Number(caloriesBurned) === 0 ? 'zero' : ''}`}
          type="number"
          min="0"
          step="1"
          value={caloriesBurned}
          onChange={(e) => setCaloriesBurned(e.target.value)}
          placeholder="Calories Burned"
          required
        />
      </div>
      <input
        className={`input ${Number(distance) === 0 ? 'zero' : ''}`}
        type="number"
        min="0"
        step="0.01"
        value={distance}
        onChange={(e) => setDistance(e.target.value)}
        placeholder="Distance (km) - optional"
      />
      <div style={{ color: 'var(--muted)' }}>
        Preview: {activityType || 'Activity'} — {Number(duration) || 0} min, {Number(caloriesBurned) || 0} cal, {Number(distance) || 0} km
      </div>
      <button className="btn primary" type="submit">Add Entry</button>
      {message && <div className="message">{message}</div>}
    </form>
  );
};

export default FitnessForm;
