
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Incident, IncidentStatus, User, UserRole } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { IncidentForm } from './IncidentForm';
import { ShiftPlanning } from './ShiftPlanning';
import { AccountManagement } from './AccountManagement';
import { MedicalInventory } from './MedicalInventory';
import { FuelControl } from './FuelControl';

type OperationView = 'dashboard' | 'incidents' | 'shifts' | 'accounts' | 'fuel' | 'checklists' | 'inventory' | 'audit';

const OperationItem: React.FC<{ title: string; icon: string; onClick: () => void; }> = ({ title, icon, onClick }) => (
    <button onClick={onClick} className="w-full h-full">
        <Card className="flex flex-col items-center justify-center text-center p-6 hover:bg-gray-700/50 transition-colors h-full">
            <i data-lucide={icon} className="h-12 w-12 text-primary mb-4"></i>
            <h3 className="font-semibold">{title}</h3>
        </Card>
    </button>
);

const IncidentsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    const fetchIncidents = async () => {
        setLoading(true);
        const data = await api.getIncidents();
        setIncidents(data);
        setLoading(false);
        setTimeout(() => window.lucide?.createIcons(), 0);
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const handleNew = () => {
        setSelectedIncident(null);
        setIsFormModalOpen(true);
    };
    
    const handleEdit = (incident: Incident) => {
        setSelectedIncident(incident);
        setIsFormModalOpen(true);
    };
    
    const handleOpenDelete = (incident: Incident) => {
        setSelectedIncident(incident);
        setIsDeleteModalOpen(true);
    };

    const handleSave = async (incident: Incident) => {
        await api.saveIncident(incident);
        fetchIncidents();
        setIsFormModalOpen(false);
        setSelectedIncident(null);
    };
    
    const handleDelete = async () => {
        if (selectedIncident) {
            await api.deleteIncident(selectedIncident.id);
            fetchIncidents();
            setIsDeleteModalOpen(false);
            setSelectedIncident(null);
        }
    };
    
    const statusColors: Record<IncidentStatus, string> = {
        [IncidentStatus.Abierta]: 'bg-red-500/20 text-red-400',
        [IncidentStatus.EnProgreso]: 'bg-yellow-500/20 text-yellow-400',
        [IncidentStatus.Resuelta]: 'bg-green-500/20 text-green-400',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <button onClick={onBack} className="text-gray-400 hover:text-white"><i data-lucide="arrow-left"></i></button>
                    <h2 className="text-3xl font-bold">Sistema de Incidencias</h2>
                </div>
                <Button onClick={handleNew} icon={<i data-lucide="plus-circle"></i>}>
                    Nueva Incidencia
                </Button>
            </div>
            {loading ? <Spinner /> : (
                <div className="bg-surface rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Vehículo ID</th>
                                <th className="p-4">Descripción</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidents.map(inc => (
                                <tr key={inc.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4">{inc.date}</td>
                                    <td className="p-4 font-mono">{inc.vehicleId}</td>
                                    <td className="p-4 max-w-sm truncate">{inc.description}</td>
                                    <td className="p-4">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[inc.status]}`}>
                                            {inc.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleEdit(inc)} className="text-primary hover:underline">Editar</button>
                                            <button onClick={() => handleOpenDelete(inc)} className="text-danger hover:underline">Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedIncident ? 'Editar Incidencia' : 'Nueva Incidencia'}>
                <IncidentForm incident={selectedIncident} onSave={handleSave} onCancel={() => setIsFormModalOpen(false)} />
            </Modal>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Eliminar Incidencia"
                message="¿Estás seguro de que quieres eliminar esta incidencia? Esta acción no se puede deshacer."
            />
        </div>
    );
};

interface OperationsPageProps {
    user: User;
}

export const OperationsPage: React.FC<OperationsPageProps> = ({ user }) => {
    const [view, setView] = useState<OperationView>('dashboard');

    useEffect(() => {
        setTimeout(() => window.lucide?.createIcons(), 0);
    }, [view]);

    if (view === 'incidents') return <IncidentsView onBack={() => setView('dashboard')} />;
    if (view === 'shifts') return <ShiftPlanning onBack={() => setView('dashboard')} />;
    if (view === 'accounts') return <AccountManagement onBack={() => setView('dashboard')} />;
    if (view === 'inventory') return <MedicalInventory onBack={() => setView('dashboard')} />;
    if (view === 'fuel') return <FuelControl onBack={() => setView('dashboard')} />;
    
    // Placeholder for other views
    if (view !== 'dashboard') {
        return (
             <div className="space-y-6">
                 <div className="flex items-center gap-4">
                     <button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-white"><i data-lucide="arrow-left"></i></button>
                    <h2 className="text-3xl font-bold">Módulo en Construcción</h2>
                </div>
                <Card>
                    <p>Esta funcionalidad aún no ha sido implementada.</p>
                </Card>
            </div>
        )
    }

    const allOperations = [
        { id: 'shifts', title: 'Planificación de Turnos', icon: 'calendar-days', onClick: () => setView('shifts') },
        { id: 'accounts', title: 'Gestión de Cuentas', icon: 'key-round', onClick: () => setView('accounts') },
        { id: 'incidents', title: 'Sistema de Incidencias', icon: 'alert-triangle', onClick: () => setView('incidents') },
        { id: 'inventory', title: 'Inventario Médico', icon: 'syringe', onClick: () => setView('inventory') },
        { id: 'fuel', title: 'Control de Combustible', icon: 'fuel', onClick: () => setView('fuel') },
        { id: 'checklists', title: 'Checklists Digitales', icon: 'clipboard-check', onClick: () => alert("Módulo no implementado.") },
        { id: 'audit', title: 'Auditoría y Logs', icon: 'shield-check', onClick: () => alert("Módulo no implementado.") },
    ];

    // Filter operations based on role
    const visibleOperations = allOperations.filter(op => {
        if (user.rol === UserRole.Administrador || user.rol === UserRole.Gestor) return true;
        
        // Non-admins/managers only see specific modules
        const allowedIds = ['incidents', 'inventory', 'checklists'];
        return allowedIds.includes(op.id);
    });

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Sistemas Complementarios (Operaciones)</h2>
            <p className="text-gray-400">Seleccione un sistema para gestionar.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {visibleOperations.map(op => (
                     <OperationItem key={op.id} title={op.title} icon={op.icon} onClick={op.onClick} />
                ))}
            </div>
            {visibleOperations.length === 0 && (
                <p className="text-gray-500 italic">No tienes permisos para ver operaciones.</p>
            )}
        </div>
    );
};
