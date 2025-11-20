
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Shift, User } from '../../types';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

export const GlobalCalendar: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [s, u] = await Promise.all([api.getShifts(), api.getUsers()]);
            setShifts(s);
            setUsers(u);
            setLoading(false);
        };
        loadData();
    }, []);
    
    const getUserName = (id: string) => {
        const u = users.find(user => user.id === id);
        return u ? `${u.nombre} ${u.primerApellido}` : id;
    };

    // Group shifts by day for the next 7 days
    const days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    });

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Calendario Global de Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {days.map(date => {
                    const dayShifts = shifts.filter(s => s.start.startsWith(date));
                    return (
                        <Card key={date} className="min-h-[200px]">
                            <h3 className="font-bold text-lg border-b border-gray-700 pb-2 mb-2">
                                {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </h3>
                            {dayShifts.length === 0 ? <p className="text-sm text-gray-500">Sin turnos.</p> : (
                                <ul className="space-y-2">
                                    {dayShifts.map(s => (
                                        <li key={s.id} className="text-sm bg-gray-800 p-2 rounded border-l-4 border-primary">
                                            <p className="font-semibold">{getUserName(s.userId)}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(s.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - 
                                                {new Date(s.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    );
};
