
import React, { useState, useEffect, useMemo } from 'react';
import { FuelLog, Vehicle } from '../../types';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';

interface FuelControlProps {
    onBack: () => void;
}

export const FuelControl: React.FC<FuelControlProps> = ({ onBack }) => {
    const [logs, setLogs] = useState<FuelLog[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [newLog, setNewLog] = useState<Partial<FuelLog>>({
        date: new Date().toISOString().split('T')[0],
        liters: 0,
        cost: 0,
        mileage: 0
    });

    const loadData = async () => {
        setLoading(true);
        const [l, v] = await Promise.all([api.getFuelLogs(), api.getVehicles()]);
        setLogs(l);
        setVehicles(v);
        setLoading(false);
        setTimeout(() => window.lucide?.createIcons(), 0);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async () => {
        if (!newLog.vehicleId || !newLog.date || !newLog.liters || !newLog.cost) {
            alert("Por favor rellene todos los campos requeridos.");
            return;
        }
        
        await api.saveFuelLog({
            ...newLog,
            performedBy: 'Admin/Gestor', // Mock user
            liters: Number(newLog.liters),
            cost: Number(newLog.cost),
            mileage: Number(newLog.mileage)
        } as FuelLog);
        
        setIsModalOpen(false);
        setNewLog({ date: new Date().toISOString().split('T')[0], liters: 0, cost: 0, mileage: 0 });
        loadData();
    };
    
    const getVehiclePlate = (id: string) => vehicles.find(v => v.id === id)?.matricula || id;

    const filteredLogs = useMemo(() => {
        return logs.filter(l => {
            const plate = getVehiclePlate(l.vehicleId).toLowerCase();
            return plate.includes(searchTerm.toLowerCase());
        });
    }, [logs, searchTerm, vehicles]);

    const totalCost = useMemo(() => filteredLogs.reduce((sum, log) => sum + log.cost, 0), [filteredLogs]);
    const totalLiters = useMemo(() => filteredLogs.reduce((sum, log) => sum + log.liters, 0), [filteredLogs]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <button onClick={onBack} className="text-gray-400 hover:text-white"><i data-lucide="arrow-left"></i></button>
                    <h2 className="text-3xl font-bold">Control de Combustible</h2>
                </div>
                <Button onClick={() => setIsModalOpen(true)} icon={<i data-lucide="plus-circle"></i>}>
                    Registrar Repostaje
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-900/20 border-l-4 border-blue-500">
                    <p className="text-gray-400">Total Gasto (Filtrado)</p>
                    <p className="text-2xl font-bold text-blue-400">{totalCost.toFixed(2)} €</p>
                </Card>
                <Card className="bg-green-900/20 border-l-4 border-green-500">
                    <p className="text-gray-400">Total Litros (Filtrado)</p>
                    <p className="text-2xl font-bold text-green-400">{totalLiters.toFixed(2)} L</p>
                </Card>
                 <Card className="bg-purple-900/20 border-l-4 border-purple-500">
                    <p className="text-gray-400">Registros</p>
                    <p className="text-2xl font-bold text-purple-400">{filteredLogs.length}</p>
                </Card>
            </div>

            <div className="bg-surface p-4 rounded-lg shadow">
                 <div className="relative">
                    <input 
                        type="text"
                        placeholder="Buscar por Matrícula..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i data-lucide="search" className="text-gray-400"></i>
                    </div>
                </div>
            </div>

            {loading ? <Spinner /> : (
                <div className="bg-surface rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Vehículo</th>
                                <th className="p-4">Litros</th>
                                <th className="p-4">Coste (€)</th>
                                <th className="p-4">Kilometraje</th>
                                <th className="p-4">Responsable</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                                <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4">{new Date(log.date).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold font-mono">{getVehiclePlate(log.vehicleId)}</td>
                                    <td className="p-4">{log.liters.toFixed(2)}</td>
                                    <td className="p-4">{log.cost.toFixed(2)}</td>
                                    <td className="p-4">{log.mileage.toLocaleString()}</td>
                                    <td className="p-4 text-gray-400">{log.performedBy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Registro de Combustible">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Vehículo</label>
                        <select 
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                            value={newLog.vehicleId || ''}
                            onChange={e => setNewLog({...newLog, vehicleId: e.target.value})}
                        >
                            <option value="">Seleccionar Vehículo</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.matricula} - {v.marca}</option>
                            ))}
                        </select>
                    </div>
                    <Input label="Fecha" type="date" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Litros" type="number" value={newLog.liters} onChange={e => setNewLog({...newLog, liters: parseFloat(e.target.value)})} required />
                        <Input label="Coste (€)" type="number" value={newLog.cost} onChange={e => setNewLog({...newLog, cost: parseFloat(e.target.value)})} required />
                    </div>
                    <Input label="Kilometraje Actual" type="number" value={newLog.mileage} onChange={e => setNewLog({...newLog, mileage: parseInt(e.target.value)})} required />
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
