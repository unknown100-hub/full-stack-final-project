import React, { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import CalorieSummary from './calorieSummary';

const Dashboard = () => {
    const [fitnessData, setFitnessData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        api.get('/users/fitness')
            .then(response => {
                setFitnessData(Array.isArray(response.data.fitnessData) ? response.data.fitnessData : []);
            })
            .catch(err => setError(err?.response?.data?.msg || 'Failed to load fitness data'))
            .finally(() => setLoading(false));
    }, []);
    
    const sorted = useMemo(() => {
        return [...fitnessData].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [fitnessData]);

    const data = useMemo(() => ({
        labels: sorted.map(item => new Date(item.date).toLocaleDateString()),
        datasets: [{
            label: 'Calories Burned',
            data: sorted.map(item => item.caloriesBurned || 0),
            borderColor: 'rgba(110, 168, 255, 1)',
            backgroundColor: 'rgba(110,168,255,0.25)',
            fill: true,
            tension: 0.2,
        }]
    }), [sorted]);
    
    if (loading) return <div>Loading dashboard…</div>;
    if (error) return <div className="message error">{error}</div>;

    const lastEntries = [...fitnessData]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    return (
        <div style={{ display: 'grid', gap: 16 }}>
            <CalorieSummary />
            <div>
                <Line data={data} />
            </div>

            {lastEntries.length > 0 && (
                <div>
                    <div style={{ margin: '8px 0', fontWeight: 600 }}>Recent Activity</div>
                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Activity</th>
                                    <th>Duration (min)</th>
                                    <th>Calories</th>
                                    <th>Distance (km)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lastEntries.map((e, i) => (
                                    <tr key={i}>
                                        <td>{new Date(e.date).toLocaleString()}</td>
                                        <td>{e.activityType || '—'}</td>
                                        <td className={(Number(e.duration) || 0) === 0 ? 'zero' : ''}>{Number(e.duration) || 0}</td>
                                        <td className={(Number(e.caloriesBurned) || 0) === 0 ? 'zero' : ''}>{Number(e.caloriesBurned) || 0}</td>
                                        <td className={(Number(e.distance) || 0) === 0 ? 'zero' : ''}>{Number(e.distance) || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
