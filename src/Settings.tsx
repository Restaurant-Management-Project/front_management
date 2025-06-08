import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SettingsPage.css';

const ZONES = [
    { id: 1, name: 'Zone A', tables: '1, 2, 3' },
    { id: 2, name: 'Zone B', tables: '4, 5, 6' },
    { id: 3, name: 'Zone C', tables: '7, 8, 9' }
];

export function Settings() {
    const navigate = useNavigate();
    const [waiters, setWaiters] = useState([]);
    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWaiters();
    }, []);

    const fetchWaiters = async () => {
        const res = await axios.get('http://localhost:8000/v1/api/users/');
        setWaiters(res.data);
        setLoading(false);
    };

    const getUnassignedWaiters = () =>
        waiters.filter((w: any) => w.zone == null);

    const getZoneWaiters = (zoneId: number) =>
        waiters.filter((w: any) => w.zone === zoneId);

    const assignWaiter = async (waiterId: number, zoneId: number | null) => {
        await axios.put(`http://localhost:8000/v1/api/users/${waiterId}/zone/`, {
            zone: zoneId,
        });
        setSelectedZoneId(null);
        fetchWaiters();
    };


    return (
        <div className="settings-container">
                <div className="nav-icon" onClick={() => navigate('/requests')} title="Go to Requests">
                    <h5> ← Go back to Requests 🛎️ </h5>
                </div>
            <h2 className="title">Assign Waiters to Zones</h2>
            {loading ? (
                <p>Loading waiters...</p>
            ) : (
                <div className="zones-list">
                    {ZONES.map((zone) => (
                        <div className="zone-card" key={zone.id}>
                            <h3>{zone.name}</h3>
                            <p>Tables: {zone.tables}</p>

                            <div className="assigned-waiters">
                                <strong>Assigned Waiters:</strong>
                                {getZoneWaiters(zone.id).length === 0 ? (
                                    <p>None</p>
                                ) : (
                                    <ul>
                                        {getZoneWaiters(zone.id).map((w: any) => (
                                            <li key={w.id}>
                                                <span>👤 {w.username}</span>
                                                <button
                                                    className="unassign-btn"
                                                    onClick={() => assignWaiter(w.id, null)}
                                                    title="Unassign waiter"
                                                >
                                                    ❌
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {selectedZoneId === zone.id ? (
                                <div className="waiter-select">
                                    <h4>Assign waiter:</h4>
                                    {getUnassignedWaiters().length === 0 ? (
                                        <p>No unassigned waiters available</p>
                                    ) : (
                                        getUnassignedWaiters().map((w: any) => (
                                            <button key={w.id} onClick={() => assignWaiter(w.id, zone.id)}>
                                                {w.username}
                                            </button>
                                        ))
                                    )}
                                    <button onClick={() => setSelectedZoneId(null)}>Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setSelectedZoneId(zone.id)}>Assign Waiter</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Settings;
